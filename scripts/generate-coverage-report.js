import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_FILE = resolve(__dirname, '../tests/e2e/smoke.spec.js');
const REPORTS_DIR = resolve(__dirname, '../reports');
const COVERAGE_DIR = resolve(REPORTS_DIR, 'coverage');
const OUTPUT_FILE = resolve(COVERAGE_DIR, 'index.html');

const PAGES = [
  '/',
  '/about.html',
  '/services.html',
  '/projects.html',
  '/pricing.html',
  '/seo-services.html',
  '/contact.html',
  '/reports.html',
];

async function generateCoverageReport() {
  await fs.mkdir(COVERAGE_DIR, { recursive: true });

  let testSource = '';
  try {
    testSource = await fs.readFile(TEST_FILE, 'utf8');
  } catch (error) {
    // If tests are missing, still generate a minimal page
    testSource = '';
  }

  const visited = new Set();
  const gotoRegex = /page\.goto\((['"])(.+?)\1/g;
  let match;
  while ((match = gotoRegex.exec(testSource)) !== null) {
    let url = match[2];
    if (url.startsWith('http')) {
      try {
        const { pathname } = new URL(url);
        url = pathname || '/';
      } catch {
        // leave as-is
      }
    }
    if (!url || url === '') {
      url = '/';
    }
    visited.add(url);
  }

  const rows = PAGES.map(path => ({
    path,
    covered: visited.has(path) || visited.has(path.replace(/^\//, '')),
  }));

  const rowsHtml = rows
    .map(row => {
      const status = row.covered ? 'Covered by smoke tests' : 'Not exercised by smoke suite';
      const statusClass = row.covered ? 'covered' : 'uncovered';
      return `<tr class="${statusClass}"><td>${row.path || '/'}</td><td>${status}</td></tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Route Coverage Snapshot</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 2rem; background: #0a0a0a; color: #f5f5f5; }
      h1 { font-family: 'Orbitron', system-ui, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
      th, td { border: 1px solid rgba(0, 255, 255, 0.25); padding: 0.75rem 1rem; text-align: left; }
      th { background: rgba(0, 255, 255, 0.12); }
      tr:nth-child(odd) { background: rgba(255, 255, 255, 0.03); }
      .covered { color: #00ffb0; }
      .uncovered { color: #ff7a7a; }
      .muted { color: #9aa8b2; font-size: 0.9rem; margin-top: 0.5rem; }
    </style>
  </head>
  <body>
    <h1>Route Coverage Snapshot</h1>
    <p class="muted">Derived from URLs visited inside <code>tests/e2e/smoke.spec.js</code>. This is a lightweight proxy for which primary pages are exercised by the smoke suite.</p>
    <table>
      <thead>
        <tr><th>Path</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </body>
</html>`;

  await fs.writeFile(OUTPUT_FILE, html, 'utf8');
}

if (process.argv[1] === __filename) {
  generateCoverageReport().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { generateCoverageReport };
