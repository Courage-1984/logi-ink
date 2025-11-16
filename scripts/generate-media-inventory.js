#!/usr/bin/env node
/**
 * Media Inventory Generator
 * Scans the assets directory and produces HTML/JSON reports describing media usage.
 */

import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { resolve, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '..');
const ASSETS_DIR = resolve(ROOT_DIR, 'assets');
const REPORTS_DIR = resolve(ROOT_DIR, 'reports');
const OUTPUT_HTML = resolve(REPORTS_DIR, 'media-inventory.html');
const OUTPUT_JSON = resolve(REPORTS_DIR, 'media-inventory.json');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.ogg']);
const FONT_EXTENSIONS = new Set(['.woff', '.woff2', '.ttf', '.otf']);
const BYTE_IN_MB = 1024 * 1024;

const inventory = [];
const summary = {
  images: { count: 0, bytes: 0 },
  videos: { count: 0, bytes: 0 },
  fonts: { count: 0, bytes: 0 },
  other: { count: 0, bytes: 0 },
};

async function walkDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(absolutePath);
      continue;
    }

    const extension = extname(entry.name).toLowerCase();
    const stats = await fs.stat(absolutePath);
    const relativePath = relative(ROOT_DIR, absolutePath).split('\\').join('/');

    const item = {
      path: relativePath,
      bytes: stats.size,
      category: getCategory(extension),
      width: null,
      height: null,
      format: extension.replace('.', ''),
    };

    if (item.category === 'image' && extension !== '.svg') {
      try {
        const metadata = await sharp(absolutePath).metadata();
        item.width = metadata.width || null;
        item.height = metadata.height || null;
        if (metadata.format) {
          item.format = metadata.format;
        }
      } catch (error) {
        // Ignore metadata failures (e.g., unsupported formats)
      }
    }

    inventory.push(item);
    const summaryKey =
      item.category === 'image' ? 'images' : item.category === 'video' ? 'videos' : item.category === 'font' ? 'fonts' : 'other';
    summary[summaryKey].count += 1;
    summary[summaryKey].bytes += stats.size;
  }
}

function getCategory(extension) {
  if (IMAGE_EXTENSIONS.has(extension)) {
    return 'image';
  }
  if (VIDEO_EXTENSIONS.has(extension)) {
    return 'video';
  }
  if (FONT_EXTENSIONS.has(extension)) {
    return 'font';
  }
  return 'other';
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function renderHtmlReport(items, totals) {
  const generatedAt = new Date().toISOString();
  const topHeavy = [...items]
    .filter(item => item.category === 'image' || item.category === 'video')
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 10);

  const totalsMarkup = `
    <div class="inventory-summary">
      ${renderSummaryCard('Images', totals.images)}
      ${renderSummaryCard('Videos', totals.videos)}
      ${renderSummaryCard('Fonts', totals.fonts)}
      ${renderSummaryCard('Other', totals.other)}
    </div>
  `;

  const largestMarkup = topHeavy
    .map(item => {
      const dimension = item.width && item.height ? `${item.width}×${item.height}` : '—';
      return `
        <tr>
          <td>${item.category}</td>
          <td>${item.format}</td>
          <td class="path">${item.path}</td>
          <td>${dimension}</td>
          <td>${formatBytes(item.bytes)}</td>
        </tr>
      `;
    })
    .join('');

  const tableRows = items
    .sort((a, b) => b.bytes - a.bytes)
    .map(item => {
      const dimension = item.width && item.height ? `${item.width}×${item.height}` : '—';
      const oversized = item.bytes > 0.8 * BYTE_IN_MB ? 'data-oversized="true"' : '';
      return `
        <tr ${oversized}>
          <td>${item.category}</td>
          <td>${item.format}</td>
          <td class="path">${item.path}</td>
          <td>${dimension}</td>
          <td>${formatBytes(item.bytes)}</td>
        </tr>
      `;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Media Inventory · Logi-Ink</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
        font-family: 'Rajdhani', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #0a0a0a;
        color: #ffffff;
      }
      main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 3rem 1.5rem 4rem;
      }
      h1 {
        font-family: 'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 0.5rem;
      }
      .subtitle {
        color: #b0b0b0;
        margin-bottom: 2.5rem;
        font-size: 1.05rem;
      }
      .generated-at {
        font-size: 0.85rem;
        color: #888888;
        margin-bottom: 2rem;
      }
      .inventory-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
      }
      .summary-card {
        border: 1px solid rgba(0, 255, 255, 0.2);
        border-radius: 16px;
        padding: 1.5rem;
        background: rgba(10, 10, 10, 0.65);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.15);
      }
      .summary-card h2 {
        margin: 0;
        font-size: 0.9rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #b0b0b0;
      }
      .summary-card .metric {
        font-size: 2rem;
        font-weight: 700;
        color: #00ffff;
        margin: 0.5rem 0 0;
      }
      .summary-card .bytes {
        color: #ff00ff;
        font-size: 0.95rem;
        margin-top: 0.6rem;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
      }
      thead {
        background: rgba(0, 255, 255, 0.12);
      }
      th,
      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
      }
      tbody tr[data-oversized="true"] {
        background: rgba(255, 0, 128, 0.08);
      }
      tbody tr:hover {
        background: rgba(0, 255, 255, 0.08);
      }
      td.path {
        font-family: 'Fira Code', 'Courier New', Courier, monospace;
        font-size: 0.9rem;
        white-space: nowrap;
      }
      section + section {
        margin-top: 3rem;
      }
      .note {
        margin-top: 1rem;
        font-size: 0.85rem;
        color: #999;
      }
      @media (max-width: 720px) {
        td,
        th {
          padding: 0.6rem;
        }
        td.path {
          white-space: normal;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Media Inventory</h1>
      <p class="subtitle">Overview of images, video, fonts, and other media bundled with the site.</p>
      <div class="generated-at">Generated at ${generatedAt}</div>
      ${totalsMarkup}
      <section>
        <h2>Top Heavy Assets (by size)</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Format</th>
              <th>Path</th>
              <th>Dimensions</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            ${largestMarkup}
          </tbody>
        </table>
        <p class="note">Assets larger than ~0.8 MB are flagged in the complete inventory below.</p>
      </section>
      <section>
        <h2>Complete Inventory</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Format</th>
              <th>Path</th>
              <th>Dimensions</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </section>
    </main>
  </body>
</html>
  `;
}

function renderSummaryCard(title, data) {
  return `
    <div class="summary-card">
      <h2>${title}</h2>
      <div class="metric">${data.count}</div>
      <div class="bytes">${formatBytes(data.bytes)}</div>
    </div>
  `;
}

async function ensureReportsDirectory() {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

async function main() {
  await ensureReportsDirectory();
  await walkDirectory(ASSETS_DIR);

  const html = renderHtmlReport(inventory, summary);
  await fs.writeFile(OUTPUT_HTML, html, 'utf8');
  await fs.writeFile(
    OUTPUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary,
        assets: inventory,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`✅ Media inventory generated: ${relative(ROOT_DIR, OUTPUT_HTML)}`);
  console.log(
    `   Images: ${summary.images.count} (${formatBytes(summary.images.bytes)}) | Videos: ${summary.videos.count} (${formatBytes(summary.videos.bytes)})`,
  );
}

main().catch(error => {
  console.error('❌ Failed to build media inventory', error);
  process.exitCode = 1;
});
