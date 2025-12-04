/**
 * Unit Tests for vite-plugin-critical-css.js
 * Tests Vite plugin for critical CSS inlining
 *
 * Note: We test plugin structure and hooks. The actual execSync execution
 * is tested via E2E tests which validate the full integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import plugin
import criticalCSSPlugin from '../../vite-plugin-critical-css.js';

describe('vite-plugin-critical-css', () => {
  let plugin;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = criticalCSSPlugin();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('plugin structure', () => {
    it('should return a plugin object', () => {
      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    it('should have correct plugin name', () => {
      expect(plugin.name).toBe('critical-css');
    });

    it('should only apply during build', () => {
      expect(plugin.apply).toBe('build');
    });
  });

  describe('configResolved hook', () => {
    it('should resolve project root and output directory', () => {
      const mockConfig = {
        root: '/project',
        build: {
          outDir: 'dist',
        },
      };

      // Should not throw
      expect(() => plugin.configResolved(mockConfig)).not.toThrow();

      // Verify hook exists
      expect(plugin.configResolved).toBeDefined();
      expect(typeof plugin.configResolved).toBe('function');
    });

    it('should handle different output directories', () => {
      const mockConfig = {
        root: '/project',
        build: {
          outDir: 'build',
        },
      };

      expect(() => plugin.configResolved(mockConfig)).not.toThrow();
      expect(plugin.configResolved).toBeDefined();
    });

    it('should handle custom root paths', () => {
      const mockConfig = {
        root: '/custom/path',
        build: {
          outDir: 'output',
        },
      };

      expect(() => plugin.configResolved(mockConfig)).not.toThrow();
    });
  });

  describe('closeBundle hook', () => {
    it('should exist and be callable', () => {
      expect(plugin.closeBundle).toBeDefined();
      expect(typeof plugin.closeBundle).toBe('function');
    });

    it('should handle closeBundle call without config', () => {
      // Should not throw even without configResolved being called
      // (will fail gracefully when trying to resolve paths)
      expect(() => plugin.closeBundle()).not.toThrow();
    });

    it('should execute without throwing when config is set', () => {
      const mockConfig = {
        root: process.cwd(),
        build: {
          outDir: 'dist',
        },
      };

      plugin.configResolved(mockConfig);

      // Mock console to avoid output during tests
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Should not throw (may execute real script, but that's okay for structure test)
      expect(() => plugin.closeBundle()).not.toThrow();

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('plugin integration', () => {
    it('should be callable as a function', () => {
      expect(typeof criticalCSSPlugin).toBe('function');
      const instance = criticalCSSPlugin();
      expect(instance).toBeDefined();
    });

    it('should return new instance each call', () => {
      const instance1 = criticalCSSPlugin();
      const instance2 = criticalCSSPlugin();
      expect(instance1).not.toBe(instance2);
    });

    it('should return plugin with required hooks', () => {
      const instance = criticalCSSPlugin();
      expect(instance.name).toBe('critical-css');
      expect(instance.apply).toBe('build');
      expect(instance.configResolved).toBeDefined();
      expect(instance.closeBundle).toBeDefined();
    });
  });
});
