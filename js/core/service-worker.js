/**
 * Service Worker Registration
 * Registers service worker and handles updates
 */

let registration = null;

/**
 * Register service worker
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Get base path from current location (handles /logia-ink/ base path)
      const basePath =
        window.location.pathname.replace(/\/[^/]*\.html?$/, '').replace(/\/$/, '') || '';
      const swPath = `${basePath}/sw.js`;

      navigator.serviceWorker
        .register(swPath)
        .then(reg => {
          registration = reg;
          console.log('[Service Worker] Registered:', reg.scope);

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
          console.error('[Service Worker] Registration failed:', error);
        });
    });

    // Listen for service worker updates
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
