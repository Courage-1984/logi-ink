import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { promises as fs } from 'fs';
import pa11y from 'pa11y';
import pa11yHtmlReporter from 'pa11y-reporter-html';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORTS_DIR = resolve(__dirname, '../reports');
const OUTPUT_FILE = resolve(REPORTS_DIR, 'seo-pa11y.html');
const CONFIG_PATH = resolve(__dirname, '../pa11y.config.json');

async function runPa11yReport(targetUrl = 'http://127.0.0.1:4173/', outputPath = OUTPUT_FILE) {
  const configRaw = await fs.readFile(CONFIG_PATH, 'utf8');
  const config = JSON.parse(configRaw);

  await fs.mkdir(REPORTS_DIR, { recursive: true });

  const results = await pa11y(targetUrl, config);
  const html = await pa11yHtmlReporter.results(results);
  await fs.writeFile(outputPath, html, 'utf8');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPa11yReport().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { runPa11yReport };
