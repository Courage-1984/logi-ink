/**
 * E2E Test: Organization Schema with Logo Validation
 *
 * Validates that all pages have proper Organization schema with ImageObject logo
 * to ensure logo appears in search engine results (Google, Bing, DuckDuckGo)
 */

import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:4173';
const pages = [
  { path: '/', name: 'Homepage' },
  { path: '/about', name: 'About' },
  { path: '/services', name: 'Services' },
  { path: '/projects', name: 'Projects' },
  { path: '/contact', name: 'Contact' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/seo-services', name: 'SEO Services' },
];

test.describe('Organization Schema with Logo', () => {
  for (const page of pages) {
    test(`${page.name} page should have Organization schema with ImageObject logo`, async ({ page: browserPage }) => {
      await browserPage.goto(`${baseUrl}${page.path}`);

      // Wait for page to load
      await browserPage.waitForLoadState('networkidle');

      // Extract all JSON-LD scripts
      const jsonLdScripts = await browserPage.$$eval('script[type="application/ld+json"]', (scripts) => {
        return scripts.map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      });

      // Find Organization schema
      const organizationSchema = jsonLdScripts.find(
        schema => schema['@type'] === 'Organization'
      );

      expect(organizationSchema, `${page.name} page should have Organization schema`).toBeDefined();

      // Verify Organization schema has required properties
      expect(organizationSchema['@context']).toBe('https://schema.org');
      expect(organizationSchema['@type']).toBe('Organization');
      expect(organizationSchema['@id']).toBe('https://logi-ink.co.za/#organization');
      expect(organizationSchema.name).toBe('Logi-Ink');
      expect(organizationSchema.url).toBe('https://logi-ink.co.za/');

      // Verify logo is ImageObject with required properties
      expect(organizationSchema.logo, 'Organization schema should have logo property').toBeDefined();
      expect(organizationSchema.logo['@type'], 'Logo should be ImageObject type').toBe('ImageObject');
      expect(organizationSchema.logo.url, 'Logo should have URL').toBe('https://logi-ink.co.za/logo-150x150.png');
      expect(organizationSchema.logo.width, 'Logo should have width').toBe(150);
      expect(organizationSchema.logo.height, 'Logo should have height').toBe(150);

      // Verify logo URL is absolute (required for search engines)
      expect(organizationSchema.logo.url).toMatch(/^https?:\/\//);
    });
  }

  test('Homepage should have WebSite schema referencing Organization', async ({ page }) => {
    await page.goto(`${baseUrl}/`);
    await page.waitForLoadState('networkidle');

    const jsonLdScripts = await page.$$eval('script[type="application/ld+json"]', (scripts) => {
      return scripts.map(script => {
        try {
          return JSON.parse(script.textContent);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    });

    const websiteSchema = jsonLdScripts.find(
      schema => schema['@type'] === 'WebSite'
    );

    expect(websiteSchema, 'Homepage should have WebSite schema').toBeDefined();
    expect(websiteSchema.publisher['@id'], 'WebSite should reference Organization via @id').toBe('https://logi-ink.co.za/#organization');
  });
});

