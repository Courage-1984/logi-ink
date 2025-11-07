/**
 * Generate sitemap.xml for the website
 * Run with: node scripts/generate-sitemap.js
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const baseUrl = process.env.VITE_BASE_URL || 'https://logi-ink.com';
const basePath = process.env.VITE_BASE_PATH || '/logia-ink/';

// Normalize basePath - remove trailing slash and ensure leading slash
const normalizedBasePath = basePath === '/' ? '' : basePath.replace(/\/$/, '');

// Pages configuration
const pages = [
  {
    url: '',
    changefreq: 'weekly',
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    url: 'about.html',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    url: 'services.html',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    url: 'projects.html',
    changefreq: 'weekly',
    priority: 0.9,
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    url: 'contact.html',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString().split('T')[0],
  },
];

// Generate sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages
  .map(
    page => {
      // Build URL: baseUrl + normalizedBasePath + page.url
      // If page.url is empty, it's the homepage - don't add trailing slash
      let url = baseUrl + normalizedBasePath;
      if (page.url) {
        url += '/' + page.url;
      } else if (normalizedBasePath) {
        // If basePath exists and page.url is empty, add trailing slash for homepage
        url += '/';
      }
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }
  )
  .join('\n')}
</urlset>`;

// Write sitemap.xml to root
const outputPath = resolve(process.cwd(), 'sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf8');

console.log(`✅ Sitemap generated: ${outputPath}`);
console.log(`   Base URL: ${baseUrl}${normalizedBasePath}`);

