/**
 * Unit Tests for js/utils/performance.js
 * Tests Web Vitals tracking and performance monitoring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackWebVitals, trackPageLoad, initPerformanceTracking } from '../../../js/utils/performance.js';
import * as env from '../../../js/utils/env.js';

// Mock web-vitals
vi.mock('web-vitals', () => ({
  onLCP: vi.fn((callback) => {
    // Simulate LCP metric
    setTimeout(() => {
      callback({
        name: 'LCP',
        value: 1200,
        rating: 'good',
        id: 'lcp-1',
        navigationType: 'navigate',
      });
    }, 10);
  }),
  onCLS: vi.fn((callback) => {
    // Simulate CLS metric
    setTimeout(() => {
      callback({
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        id: 'cls-1',
        navigationType: 'navigate',
      });
    }, 10);
  }),
  onINP: vi.fn((callback) => {
    // Simulate INP metric
    setTimeout(() => {
      callback({
        name: 'INP',
        value: 150,
        rating: 'good',
        id: 'inp-1',
        navigationType: 'navigate',
      });
    }, 10);
  }),
}));

describe('performance.js', () => {
  beforeEach(() => {
    // Mock window.plausible
    window.plausible = vi.fn();

    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock window.performance
    window.performance = {
      getEntriesByType: vi.fn(() => [
        {
          domainLookupStart: 0,
          domainLookupEnd: 10,
          connectStart: 10,
          connectEnd: 50,
          requestStart: 50,
          responseStart: 100,
          responseEnd: 200,
          domInteractive: 300,
          domComplete: 500,
          fetchStart: 0,
          loadEventEnd: 600,
        },
      ]),
    };

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        pathname: '/',
      },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.plausible;
  });

  describe('trackWebVitals', () => {
    it('should track LCP metric', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(true);

      trackWebVitals();

      // Wait for async callbacks
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('LCP'),
        expect.stringContaining('1200')
      );
    });

    it('should track CLS metric', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(true);

      trackWebVitals();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('CLS'),
        expect.stringContaining('0.05')
      );
    });

    it('should track INP metric', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(true);

      trackWebVitals();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('INP'),
        expect.stringContaining('150')
      );
    });

    it('should report to Plausible in production', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(false);

      trackWebVitals();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(window.plausible).toHaveBeenCalledWith(
        'Web Vital - LCP',
        expect.objectContaining({
          props: expect.objectContaining({
            value: '1200',
            rating: 'good',
          }),
        })
      );
    });

    it('should not report to Plausible in development', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(true);

      trackWebVitals();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(window.plausible).not.toHaveBeenCalled();
    });

    it('should handle missing plausible function gracefully', async () => {
      delete window.plausible;
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(false);

      expect(() => trackWebVitals()).not.toThrow();

      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should format CLS with 4 decimal places', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(true);

      trackWebVitals();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('CLS'),
        expect.stringMatching(/0\.0{3,4}5/)
      );
    });

    it('should format LCP and INP as integers', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(true);

      trackWebVitals();

      await new Promise(resolve => setTimeout(resolve, 50));

      const logCalls = console.log.mock.calls.map(call => call[0]);
      const lcpCall = logCalls.find(call => call.includes('LCP'));
      const inpCall = logCalls.find(call => call.includes('INP'));

      expect(lcpCall).toMatch(/1200\s*ms/);
      expect(inpCall).toMatch(/150\s*ms/);
    });
  });

  describe('trackPageLoad', () => {
    it('should track page load metrics', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(true);

      trackPageLoad();

      // Wait for load event
      window.dispatchEvent(new Event('load'));

      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(console.log).toHaveBeenCalledWith(
        '📊 Page Load Metrics:',
        expect.objectContaining({
          dns: expect.any(Number),
          tcp: expect.any(Number),
          loadTime: expect.any(Number),
        })
      );
    });

    it('should calculate DNS time correctly', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(true);

      trackPageLoad();
      window.dispatchEvent(new Event('load'));

      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(console.log).toHaveBeenCalledWith(
        '📊 Page Load Metrics:',
        expect.objectContaining({
          dns: 10, // domainLookupEnd - domainLookupStart
        })
      );
    });

    it('should report to Plausible in production', async () => {
      vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(false);

      trackPageLoad();
      window.dispatchEvent(new Event('load'));

      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(window.plausible).toHaveBeenCalledWith(
        'Page Load Metrics',
        expect.objectContaining({
          props: expect.objectContaining({
            path: '/',
            dns: expect.any(String),
            loadTime: expect.any(String),
          }),
        })
      );
    });

    it('should handle missing performance API gracefully', () => {
      delete window.performance;

      expect(() => trackPageLoad()).not.toThrow();
    });

    it('should handle missing navigation timing entry', () => {
      window.performance.getEntriesByType = vi.fn(() => []);

      expect(() => trackPageLoad()).not.toThrow();
    });
  });

  describe('initPerformanceTracking', () => {
    it('should initialize both Web Vitals and page load tracking', () => {
      const webVitalsSpy = vi.spyOn({ trackWebVitals }, 'trackWebVitals');
      const pageLoadSpy = vi.spyOn({ trackPageLoad }, 'trackPageLoad');

      initPerformanceTracking();

      // Both should be called
      expect(webVitalsSpy).toHaveBeenCalled();
      expect(pageLoadSpy).toHaveBeenCalled();
    });
  });
});

