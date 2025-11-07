/**
 * Error Handler Utility
 * Provides centralized error handling and logging
 */

import { isDevelopmentEnv, isProductionEnv } from './env.js';

/**
 * Handle JavaScript errors globally
 */
export function initErrorHandler() {
  // Handle unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    handleError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      type: 'javascript',
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleError({
      message: event.reason?.message || 'Unhandled promise rejection',
      error: event.reason,
      type: 'promise',
    });
  });

  // Handle service worker errors
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('error', (event) => {
      handleError({
        message: 'Service Worker error',
        error: event.error || event,
        type: 'service-worker',
      });
    });
  }
}

/**
 * Handle errors with graceful degradation
 * @param {Object} errorInfo - Error information
 */
function handleError(errorInfo) {
  const { message, error, type } = errorInfo;

  // Log error in development
  if (isDevelopmentEnv()) {
    console.error(`[Error Handler] ${type}:`, message, error);
  }

  // In production, you can send errors to a logging service
  // Example: Send to Sentry, LogRocket, or your own logging endpoint
  if (isProductionEnv()) {
    // Uncomment and configure your error tracking service
    // sendToErrorTracking(errorInfo);
  }

  // Graceful degradation - don't break the user experience
  // Errors are logged but don't prevent the site from functioning
}

/**
 * Send error to error tracking service (example implementation)
 * @param {Object} errorInfo - Error information
 */
function sendToErrorTracking(errorInfo) {
  // Example: Send to your error tracking endpoint
  // fetch('/api/log-error', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     ...errorInfo,
  //     url: window.location.href,
  //     userAgent: navigator.userAgent,
  //     timestamp: new Date().toISOString(),
  //   }),
  // }).catch(() => {
  //   // Fail silently if error tracking fails
  // });
}

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context description for error messages
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context = 'Operation') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError({
        message: `${context} failed`,
        error,
        type: 'async',
      });
      // Return null or default value for graceful degradation
      return null;
    }
  };
}

/**
 * Create error boundary for DOM operations
 * @param {Function} fn - Function to execute
 * @param {string} context - Context description
 * @param {*} fallback - Fallback value if error occurs
 * @returns {*} Result of function or fallback
 */
export function safeDOMOperation(fn, context = 'DOM operation', fallback = null) {
  try {
    return fn();
  } catch (error) {
    handleError({
      message: `${context} failed`,
      error,
      type: 'dom',
    });
    return fallback;
  }
}

