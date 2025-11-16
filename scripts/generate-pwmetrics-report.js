import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORTS_BASE_URL = process.env.REPORTS_BASE_URL || 'http://127.0.0.1:4173/';
const REPORTS_DIR = resolve(__dirname, '../reports');
const OUTPUT_HTML = resolve(REPORTS_DIR, 'pwmetrics-report.html');
const OUTPUT_JSON = resolve(REPORTS_DIR, 'pwmetrics.json');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function generatePwMetricsReport(baseUrl = REPORTS_BASE_URL) {
  const modulePath = resolve(__dirname, '../pwmetrics.config.cjs');
  const configUrl = pathToFileURL(modulePath).href;
  const configModule = await import(configUrl);
  const config = configModule.default || configModule;
  const PWMetrics = (await import('pwmetrics')).default;

  await fs.mkdir(REPORTS_DIR, { recursive: true });

  const runConfig = {
    ...config,
    url: baseUrl,
    flags: {
      runs: 1,
      chromeFlags: '--headless --no-sandbox --disable-gpu',
      ...(config.flags || {})
    }
  };

  const options = {
    flags: runConfig.flags,
    expectations: config.expectations || {}
  };

  const pwMetrics = new PWMetrics(runConfig.url, options);

  let results;
  try {
    results = await pwMetrics.start();
  } catch (error) {
    throw new Error(`pwmetrics failed: ${error.message}`);
  }

  await fs.writeFile(OUTPUT_JSON, JSON.stringify(results, null, 2), 'utf8');

  const metricsData = results && results.lighthouseResult && results.lighthouseResult.audits ? results.lighthouseResult.audits : null;
  const summary = results && results.timings ? results.timings : null;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>PWMetrics Report</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: 'Rajdhani', Arial, sans-serif; margin: 0; padding: 2rem; background: #0a0a0a; color: #f5f5f5; }
      h1 { font-family: 'Orbitron', Arial, sans-serif; letter-spacing: 0.1em; text-transform: uppercase; }
      section { margin-bottom: 2rem; }
      table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
      th, td { border: 1px solid rgba(0, 255, 255, 0.2); padding: 0.75rem; text-align: left; }
      th { background: rgba(0, 255, 255, 0.1); }
      tbody tr:nth-child(odd) { background: rgba(255, 255, 255, 0.04); }
      pre { background: rgba(0, 0, 0, 0.6); padding: 1rem; border-radius: 8px; overflow-x: auto; }
      .muted { color: #8aa0a5; font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <h1>PWMetrics Report</h1>
    <p class="muted">Source: ${escapeHtml(baseUrl)}</p>
    ${summary ? `<section><h2>Summary Timings</h2><table><thead><tr><th>Metric</th><th>Value (ms)</th></tr></thead><tbody>${Object.entries(summary).map(([name, value]) => `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(String(value))}</td></tr>`).join('')}</tbody></table></section>` : ''}
    ${metricsData ? `<section><h2>Selected Audits</h2><table><thead><tr><th>Audit</th><th>Score</th><th>Display Value</th></tr></thead><tbody>${Object.values(metricsData)
      .filter(audit => audit && typeof audit.score !== 'undefined')
      .slice(0, 20)
      .map(audit => `<tr><td>${escapeHtml(audit.title || audit.id || 'n/a')}</td><td>${escapeHtml(String(audit.score))}</td><td>${escapeHtml(audit.displayValue || '')}</td></tr>`)
      .join('')}</tbody></table></section>` : ''}
    <section>
      <h2>Raw Results</h2>
      <pre>${escapeHtml(JSON.stringify(results, null, 2))}</pre>
    </section>
  </body>
</html>`;

  await fs.writeFile(OUTPUT_HTML, html, 'utf8');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generatePwMetricsReport().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { generatePwMetricsReport };
