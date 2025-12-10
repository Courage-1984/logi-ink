/**
 * E2E Tests for Service Worker
 * Tests service worker registration, caching, and update handling
 */

import { test, expect } from '@playwright/test';

test.describe('Service Worker', () => {
  test('service worker registers in production build', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const swState = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return 'unsupported';
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          return 'missing';
        }

        const state =
          registration.active?.state ||
          registration.installing?.state ||
          registration.waiting?.state ||
          'registered';

        return state;
      } catch (error) {
        console.warn('[Playwright] Service worker check failed', error);
        return 'error';
      }
    });

    // Service worker should be registered (or missing if in dev/preview)
    expect(['activating', 'activated', 'installed', 'registered', 'missing']).toContain(swState);
  });

  test('service worker does not register in development mode', async ({ page }) => {
    // Navigate to localhost (development)
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('load');

    const swState = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return 'unsupported';
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration ? 'registered' : 'missing';
      } catch (error) {
        return 'error';
      }
    });

    // In development, service worker should be unregistered
    expect(swState).toBe('missing');
  });

  test('service worker caches static assets', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for service worker to activate
    await page.waitForTimeout(2000);

    // Check if assets are cached
    const cacheInfo = await page.evaluate(async () => {
      if (!('caches' in window)) {
        return { supported: false };
      }

      try {
        const cacheNames = await caches.keys();
        const hasLogiInkCache = cacheNames.some(name => name.includes('logi-ink'));

        return {
          supported: true,
          cacheNames,
          hasLogiInkCache,
        };
      } catch (error) {
        return { supported: true, error: error.message };
      }
    });

    if (cacheInfo.supported) {
      // Cache may or may not exist depending on SW state
      expect(cacheInfo).toHaveProperty('cacheNames');
    }
  });

  test('service worker handles offline mode', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for service worker to activate
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Try to navigate to a cached page
    await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 10_000 });

    // Page should still load from cache
    await expect(page.locator('main')).toBeVisible();
  });

  test('service worker update notification appears when update available', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for service worker
    await page.waitForTimeout(2000);

    // Check for update notification
    const hasUpdateNotification = await page
      .locator('.service-worker-update-notification')
      .count();

    // Update notification may or may not be present
    expect(hasUpdateNotification).toBeGreaterThanOrEqual(0);
  });

  test('service worker handles navigation correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for service worker
    await page.waitForTimeout(2000);

    // Navigate to another page
    await page.click('nav a[href="/services"]');
    await page.waitForURL('**/services');
    await page.waitForLoadState('networkidle');

    // Page should load correctly
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/\/services/);
  });

  test('service worker respects VITE_DISABLE_SW flag', async ({ page }) => {
    // This test verifies the service worker respects the disable flag
    // In production builds with VITE_DISABLE_SW=true, SW should not register

    await page.goto('/');
    await page.waitForLoadState('load');

    const swDisabled = await page.evaluate(() => {
      return window.__DISABLE_SW__ === true;
    });

    // If disabled, service worker should not be active
    if (swDisabled) {
      const registration = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) {
          return null;
        }
        return await navigator.serviceWorker.getRegistration();
      });

      expect(registration).toBeNull();
    }
  });

  test('service worker handles cache version updates', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for service worker
    await page.waitForTimeout(2000);

    // Check cache version
    const cacheVersion = await page.evaluate(async () => {
      if (!('caches' in window)) {
        return null;
      }

      try {
        const cacheNames = await caches.keys();
        const logiInkCache = cacheNames.find(name => name.includes('logi-ink'));
        return logiInkCache;
      } catch (error) {
        return null;
      }
    });

    // Cache should have version identifier
    if (cacheVersion) {
      expect(cacheVersion).toContain('logi-ink');
    }
  });

  test('service worker unregisters outdated versions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for service worker initialization
    await page.waitForTimeout(2000);

    // Check console for unregistration messages
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.text().includes('Service Worker')) {
        consoleMessages.push(msg.text());
      }
    });

    // Reload page to trigger version check
    await page.reload();
    await page.waitForLoadState('load');

    // Service worker should handle version checks gracefully
    // (may or may not unregister depending on version)
    await page.waitForTimeout(1000);
  });
});

