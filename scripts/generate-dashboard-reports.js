import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { setTimeout as wait } from 'timers/promises';

import { preview as vitePreview } from 'vite';
import { runPa11yReport } from './run-pa11y-report.js';

const fetchFn = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORTS_DIR = resolve(__dirname, '../reports');
const PREVIEW_PORT = Number(process.env.REPORTS_PREVIEW_PORT || 4173);
const BASE_URL = process.env.REPORTS_BASE_URL || `http://127.0.0.1:${PREVIEW_PORT}/`;

const log = (...args) => console.log('[reports:dashboard]', ...args);

const isWindows = process.platform === 'win32';

function getBin(name) {
  return resolve(__dirname, `../node_modules/.bin/${name}${isWindows ? '.cmd' : ''}`);
}

function runCommand(command, args, options = {}) {
  log('Running command:', command, args.join(' '));
  const spawnOptions = { stdio: 'inherit', ...options };
  let cmd = command;
  let cmdArgs = args;
  if (isWindows) {
    cmd = process.env.ComSpec || 'cmd.exe';
    cmdArgs = ['/c', command, ...args];
  }
  return new Promise((resolvePromise, rejectPromise) => {
    const proc = spawn(cmd, cmdArgs, spawnOptions);
    proc.on('error', rejectPromise);
    proc.on('exit', code => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetchFn(url, { method: 'GET' });
      if (response.ok) {
        log('Preview server responded successfully');
        return;
      }
      log('Preview server responded with status', response.status);
    } catch (error) {
      log('Preview server not ready yet:', error.message);
    }
    await wait(500);
  }
  throw new Error(`Timed out waiting for preview server at ${url}`);
}

async function runLighthouseCollect() {
  const lhciBin = getBin('lhci');
  await runCommand(lhciBin, ['collect', '--config=./lighthouserc.json']);
}

async function runPwaAuditCollect() {
  const lhciBin = getBin('lhci');
  await runCommand(lhciBin, ['collect', '--config=./lighthouserc.pwa.json']);
}

async function syncLighthouseReport(targetFilename = 'lighthouse-report.html') {
  const lhciDir = resolve(__dirname, '../.lighthouseci');
  const destination = resolve(REPORTS_DIR, targetFilename);

  try {
    const entries = await fs.readdir(lhciDir, { withFileTypes: true });
    const htmlFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.html'));

    if (htmlFiles.length === 0) {
      log('No Lighthouse HTML reports found in .lighthouseci; skipping sync');
      return;
    }

    // Pick the most recently modified HTML report
    let latestFile = null;
    let latestMtime = 0;

    for (const file of htmlFiles) {
      const fullPath = resolve(lhciDir, file.name);
      const stats = await fs.stat(fullPath);
      if (stats.mtimeMs > latestMtime) {
        latestMtime = stats.mtimeMs;
        latestFile = fullPath;
      }
    }

    if (!latestFile) {
      log('Unable to determine latest Lighthouse HTML report; skipping sync');
      return;
    }

    await fs.mkdir(REPORTS_DIR, { recursive: true });
    await fs.copyFile(latestFile, destination);
    log('Lighthouse report synced to', destination);
  } catch (error) {
    log('Unable to sync Lighthouse report from .lighthouseci:', error.message);
  }
}

async function mergeSeoReports() {
  const pa11yFile = resolve(REPORTS_DIR, 'seo-pa11y.html');
  const seoAuditFile = resolve(REPORTS_DIR, 'seo-audit.html');

  const pa11yExists = await fs
    .access(pa11yFile)
    .then(() => true)
    .catch(() => false);

  const sections = [];

  if (pa11yExists) {
    sections.push(`<section><h2>Pa11y Accessibility Summary</h2><iframe src="seo-pa11y.html" title="Pa11y Report" loading="lazy" style="width:100%;height:70vh;border:1px solid rgba(255,0,255,0.2);"></iframe></section>`);
  } else {
    log('Pa11y report not found; skipping embed');
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Accessibility Audit</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: 'Rajdhani', Arial, sans-serif; margin: 0; padding: 2rem; background: #0b0f16; color: #f5f5f5; }
      h1 { font-family: 'Orbitron', Arial, sans-serif; letter-spacing: 0.1em; text-transform: uppercase; }
      section { margin-bottom: 2rem; }
      .muted { color: #9aa8b2; font-size: 0.95rem; }
    </style>
  </head>
  <body>
    <h1>Accessibility Audit</h1>
    <p class="muted">Reports generated ${new Date().toISOString()}</p>
    ${sections.join('\n') || '<p>No accessibility reports were generated.</p>'}
  </body>
</html>`;

  await fs.writeFile(seoAuditFile, html, 'utf8');
}


async function generateDashboardReports() {
  await fs.mkdir(REPORTS_DIR, { recursive: true });

  log('Starting Vite preview server...');
  const previewServer = await vitePreview({
    root: resolve(__dirname, '..'),
    preview: {
      host: '127.0.0.1',
      port: PREVIEW_PORT,
      strictPort: true
    },
    logLevel: 'error'
  });
  log(`Preview server listening at ${BASE_URL}`);

  try {
    log('Waiting for preview server to become available...');
    await waitForServer(BASE_URL);

    log('Running Lighthouse CI');
    await runLighthouseCollect();

    log('Lighthouse run completed; syncing report artefact');
    await syncLighthouseReport();

    log('Running Lighthouse PWA audit');
    await runPwaAuditCollect();

    log('PWA Lighthouse run completed; syncing PWA report');
    await syncLighthouseReport('pwa-audit.html');

    log('Running Pa11y');
    await runPa11yReport(BASE_URL);

    log('Merging accessibility reports');
    await mergeSeoReports();
    log('Dashboard reports generated successfully');
  } finally {
    await previewServer.close();
    log('Preview server stopped');
  }
}

generateDashboardReports().catch(error => {
  console.error('[reports:dashboard] failed:', error);
  process.exitCode = 1;
});

export { generateDashboardReports };
