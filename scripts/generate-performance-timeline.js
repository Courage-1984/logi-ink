import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORTS_DIR = resolve(__dirname, '../reports');
const LHCI_DIR = resolve(__dirname, '../.lighthouseci');
const OUTPUT_HTML = resolve(REPORTS_DIR, 'performance-timeline.html');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function generatePerformanceTimeline() {
  await fs.mkdir(REPORTS_DIR, { recursive: true });

  // Find the freshest Lighthouse JSON report that actually contains performance metrics
  let reportJson = null;
  try {
    const entries = await fs.readdir(LHCI_DIR, { withFileTypes: true });
    const jsonFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.json') && !entry.name.endsWith('.html'))
      .map(async entry => {
        const fullPath = resolve(LHCI_DIR, entry.name);
        const stats = await fs.stat(fullPath);
        return { path: fullPath, mtime: stats.mtimeMs };
      });

    if (jsonFiles.length === 0) {
      const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Performance Timeline</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <h1>Performance Timeline</h1>
    <p>No Lighthouse JSON performance data was found in <code>.lighthouseci</code>. Run the dashboard reports first.</p>
  </body>
</html>`;
      await fs.writeFile(OUTPUT_HTML, html, 'utf8');
      return;
    }

    const filesWithTimes = await Promise.all(jsonFiles);
    filesWithTimes.sort((a, b) => b.mtime - a.mtime);

    for (const candidate of filesWithTimes) {
      const raw = await fs.readFile(candidate.path, 'utf8');
      const parsed = JSON.parse(raw);
      const hasPerformanceCategory = parsed.categories && parsed.categories.performance;
      if (hasPerformanceCategory) {
        reportJson = parsed;
        break;
      }
    }

    if (!reportJson) {
      const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Performance Timeline</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <h1>Performance Timeline</h1>
    <p>No Lighthouse report with a <code>performance</code> category was found. Make sure the standard Lighthouse run is enabled in <code>lighthouserc.json</code>.</p>
  </body>
</html>`;
      await fs.writeFile(OUTPUT_HTML, html, 'utf8');
      return;
    }
  } catch (error) {
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Performance Timeline</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <h1>Performance Timeline</h1>
    <p>Failed to read Lighthouse JSON data: ${escapeHtml(error.message)}</p>
  </body>
</html>`;
    await fs.writeFile(OUTPUT_HTML, html, 'utf8');
    return;
  }

  const audits = reportJson && reportJson.audits ? reportJson.audits : null;
  const metrics = [];

  if (audits) {
    const pick = id => audits[id] && typeof audits[id].numericValue !== 'undefined' ? audits[id].numericValue : null;

    metrics.push(['First Contentful Paint', pick('first-contentful-paint')]);
    metrics.push(['Largest Contentful Paint', pick('largest-contentful-paint')]);
    metrics.push(['Total Blocking Time', pick('total-blocking-time')]);
    metrics.push(['Cumulative Layout Shift', pick('cumulative-layout-shift')]);
    metrics.push(['Speed Index', pick('speed-index')]);
    metrics.push(['Time to Interactive', pick('interactive')]);
  }

  const rowsHtml = metrics
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([name, value]) => `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(value)}</td></tr>`)
    .join('');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Performance Timeline</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 2rem; background: #0a0a0a; color: #f5f5f5; }
      h1 { font-family: 'Orbitron', system-ui, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
      th, td { border: 1px solid rgba(0, 255, 255, 0.25); padding: 0.75rem 1rem; text-align: left; }
      th { background: rgba(0, 255, 255, 0.12); }
      tr:nth-child(odd) { background: rgba(255, 255, 255, 0.03); }
      .muted { color: #9aa8b2; font-size: 0.9rem; margin-top: 0.5rem; }
    </style>
  </head>
  <body>
    <h1>Performance Timeline</h1>
    <p class="muted">Key performance metrics extracted from the latest Lighthouse JSON report in <code>.lighthouseci</code>.</p>
    ${rowsHtml ? `<table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${rowsHtml}</tbody></table>` : '<p>No timing metrics were available in the latest Lighthouse report.</p>'}
  </body>
</html>`;

  await fs.writeFile(OUTPUT_HTML, html, 'utf8');
}

if (process.argv[1] === __filename) {
  generatePerformanceTimeline().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { generatePerformanceTimeline };
