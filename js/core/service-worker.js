import { isDevelopmentEnv, isServiceWorkerDisabled } from '../utils/env.js';

/**
 * Service Worker Registration
 * Registers service worker and handles updates
 */

let registration = null;

/**
 * Register service worker
 */
export function registerServiceWorker() {
  // Allow builds (like GitHub Pages) to opt out of service worker caching
  if (isServiceWorkerDisabled()) {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const sessionFlagKey = 'sw-disabled-reload';
      navigator.serviceWorker
        .getRegistrations()
        .then(registrations => {
          let hadActiveWorker = false;
          const unregisterPromises = registrations.map(reg => {
            if (reg.active) {
              hadActiveWorker = true;
            }
            return reg.unregister();
          });

          return Promise.all(unregisterPromises).then(() => {
            const shouldReload =
              hadActiveWorker && typeof window !== 'undefined' && !sessionStorage.getItem(sessionFlagKey);

            if (shouldReload) {
              sessionStorage.setItem(sessionFlagKey, 'true');
              window.location.reload();
            } else if (typeof window !== 'undefined') {
              sessionStorage.removeItem(sessionFlagKey);
            }
          });
        })
        .catch(() => {
          // Ignore cleanup errors; the site still works without unregistering
        });
    }

    if (typeof window !== 'undefined') {
      console.info('[Service Worker] Disabled for this build');
    }
    return;
  }

  // Skip service worker registration during development to avoid caching issues
  if (isDevelopmentEnv()) {
    if (typeof window !== 'undefined') {
      console.info('[Service Worker] Skipping registration in development mode');
    }
    return;
  }

  if (!('serviceWorker' in navigator)) {
    // Service Worker not supported - gracefully degrade
    return;
  }

  try {
    window.addEventListener('load', () => {
      // Get base path from current location (handles /logia-ink/ base path)
      const basePath =
        window.location.pathname.replace(/\/[^/]*\.html?$/, '').replace(/\/$/, '') || '';
      const swPath = `${basePath}/sw.js`;

      navigator.serviceWorker
        .register(swPath)
        .then(reg => {
          registration = reg;
          if (isDevelopmentEnv()) {
            console.log('[Service Worker] Registered:', reg.scope);
          }

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch(error => {
          // Service worker registration failed - site still works without it
          if (isDevelopmentEnv()) {
            console.error('[Service Worker] Registration failed:', error);
          }
          // In production, fail silently - site works without service worker
        });
    });
  } catch (error) {
    // Service worker initialization failed - gracefully degrade
    if (isDevelopmentEnv()) {
      console.error('[Service Worker] Initialization failed:', error);
    }
  }

  // Listen for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Service worker updated, reload page
      window.location.reload();
    });
  }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  // Check if update notification already exists
  if (document.querySelector('.sw-update-notification')) {
    return;
  }

  const notification = document.createElement('div');
  notification.className = 'sw-update-notification';
  notification.innerHTML = `
        <div class="sw-update-content">
            <p>New version available!</p>
            <button class="sw-update-btn" id="sw-update-btn">Update Now</button>
            <button class="sw-update-dismiss" id="sw-update-dismiss">Dismiss</button>
        </div>
    `;

  document.body.appendChild(notification);

  // Update button
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });

  // Dismiss button
  document.getElementById('sw-update-dismiss').addEventListener('click', () => {
    notification.remove();
  });
}

/**
 * Check for service worker updates
 */
export function checkForUpdates() {
  if (registration) {
    registration.update();
  }
}
