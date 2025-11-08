/**
 * Environment Utilities
 * Provides safe environment detection for browser-based ES modules
 * without relying on Node-specific globals like process.env.
 */

/**
 * Detect current execution mode.
 * Attempts to use Vite/import.meta/env first, then falls back to process.env,
 * and finally infers from hostname when running directly in the browser.
 * @returns {'development' | 'production' | string}
 */
function detectMode() {
  // Vite / modern bundlers expose import.meta.env
  if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    const { MODE, DEV, PROD } = import.meta.env;
    if (typeof MODE === 'string') {
      return MODE;
    }
    if (typeof DEV === 'boolean') {
      return DEV ? 'development' : 'production';
    }
    if (typeof PROD === 'boolean') {
      return PROD ? 'production' : 'development';
    }
  }

  // Node-style environment variables (only available when bundled)
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV) {
    return process.env.NODE_ENV;
  }

  // Heuristic for browser usage without bundler (e.g., file:// or localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location?.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      return 'development';
    }
  }

  // Default to production if the mode cannot be determined
  return 'production';
}

/**
 * Determine if we are running in development mode.
 * @returns {boolean}
 */
export function isDevelopmentEnv() {
  return detectMode() === 'development';
}

/**
 * Determine if we are running in production mode.
 * @returns {boolean}
 */
export function isProductionEnv() {
  return detectMode() === 'production';
}

/**
 * Determine if service workers should be disabled for the current build.
 * Controlled via Vite's `VITE_DISABLE_SW` flag or an optional window hint.
 * @returns {boolean}
 */
export function isServiceWorkerDisabled() {
  if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    const flag = import.meta.env.VITE_DISABLE_SW;
    if (typeof flag === 'string') {
      return flag.toLowerCase() === 'true';
    }
    if (typeof flag === 'boolean') {
      return flag;
    }
  }

  if (typeof window !== 'undefined' && window.__DISABLE_SW__ === true) {
    return true;
  }

  return false;
}

/**
 * Expose the resolved mode for consumers that need the raw value.
 * @returns {string}
 */
export function getEnvironmentMode() {
  return detectMode();
}
