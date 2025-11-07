/**
 * Service Worker for Logi-Ink
 * Provides offline support and faster repeat visits through asset caching
 *
 * Caching Strategy:
 * - Cache-first for static assets (fonts, images, CSS, JS)
 * - Network-first for HTML pages (always get fresh content)
 * - Stale-while-revalidate for API calls (if any)
 */

const CACHE_NAME = 'logia-ink-v1';
const STATIC_CACHE_NAME = 'logia-ink-static-v3'; // Increment version to force cache update (updated logo path and added 48x48 favicon)
const RUNTIME_CACHE_NAME = 'logia-ink-runtime-v2';

// Get base path from self.location (handles /logia-ink/ base path)
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '').replace(/\/$/, '') || '/';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  // HTML pages (using base path)
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/about.html`,
  `${BASE_PATH}/services.html`,
  `${BASE_PATH}/projects.html`,
  `${BASE_PATH}/contact.html`,

  // CSS
  `${BASE_PATH}/css/main.css`,
  `${BASE_PATH}/css/variables.css`,
  `${BASE_PATH}/css/base.css`,
  `${BASE_PATH}/css/fonts.css`,

  // JavaScript
  `${BASE_PATH}/js/main.js`,

  // Fonts (subsetted)
  `${BASE_PATH}/assets/fonts/Orbitron/woff2/Orbitron-Regular-subset.woff2`,
  `${BASE_PATH}/assets/fonts/Orbitron/woff2/Orbitron-Bold-subset.woff2`,
  `${BASE_PATH}/assets/fonts/Orbitron/woff2/Orbitron-Black-subset.woff2`,
  `${BASE_PATH}/assets/fonts/Rajdhani/woff2/Rajdhani-Light-subset.woff2`,
  `${BASE_PATH}/assets/fonts/Rajdhani/woff2/Rajdhani-Regular-subset.woff2`,
  `${BASE_PATH}/assets/fonts/Rajdhani/woff2/Rajdhani-SemiBold-subset.woff2`,
  `${BASE_PATH}/assets/fonts/Rajdhani/woff2/Rajdhani-Bold-subset.woff2`,

  // Images (critical and common)
  `${BASE_PATH}/assets/images/banners/banner_home.webp`,
  `${BASE_PATH}/assets/images/backgrounds/cta-get-in-touch.webp`,
  `${BASE_PATH}/assets/images/backgrounds/mission-parallax-bg.webp`,
  `${BASE_PATH}/assets/images/backgrounds/process-parallax-bg.webp`,
  `${BASE_PATH}/assets/images/backgrounds/testimonials-parallax-bg.webp`,
  `${BASE_PATH}/logo.png`,

  // Manifest
  `${BASE_PATH}/site.webmanifest`,

  // Icons
  `${BASE_PATH}/apple-touch-icon.png`,
  `${BASE_PATH}/favicon-32x32.png`,
  `${BASE_PATH}/favicon-48x48.png`,
  `${BASE_PATH}/favicon-16x16.png`,
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        // Use addAll but don't fail if some assets fail to cache
        return Promise.allSettled(
          STATIC_ASSETS.map(asset =>
            cache.add(asset).catch(err => {
              console.warn('[Service Worker] Failed to cache:', asset, err);
              return null; // Don't fail entire install
            })
          )
        );
      })
      .then(() => {
        console.log('[Service Worker] Static assets cached (some may have failed)');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('[Service Worker] Cache install failed:', error);
        // Still activate even if caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== RUNTIME_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated');
        return self.clients.claim(); // Take control of all pages
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip range requests (e.g., media seeking) to avoid caching partial responses
  if (request.headers.has('range')) {
    return;
  }

  // Skip cross-origin requests (except for same-origin)
  if (url.origin !== location.origin) {
    return;
  }

  // Skip service worker itself
  if (url.pathname.endsWith('/sw.js')) {
    return;
  }

  // Handle different resource types
  if (isStaticAsset(request.url)) {
    // Static assets: Cache-first strategy (CSS, JS, fonts, images)
    // This ensures all styles and assets are cached for offline use
    event.respondWith(cacheFirst(request));
  } else if (isHTML(request.url)) {
    // HTML pages: Network-first strategy (always get fresh content)
    event.respondWith(networkFirst(request));
  } else {
    // Other resources: Stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Cache-first strategy for static assets
 * Caches all CSS, JS, fonts, images, and other static assets
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Cache all successful responses
      cache.put(request, response.clone());
      console.log('[Service Worker] Cached:', request.url);
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', request.url, error);
    // Try to find a similar cached resource
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Try to find cached version with different query params or hash
    const cacheKeys = await cache.keys();
    for (const key of cacheKeys) {
      const keyUrl = new URL(key.url);
      if (keyUrl.pathname === pathname) {
        console.log('[Service Worker] Found similar cached resource:', key.url);
        return cache.match(key);
      }
    }

    // Return offline response if no cache found
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Network-first strategy for HTML pages
 */
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, serving from cache');
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Fallback to index.html if page not cached
    const fallback = await cache.match(`${BASE_PATH}/index.html`);
    return fallback || new Response('Offline', { status: 503 });
  }
}

/**
 * Stale-while-revalidate strategy
 * Returns cached immediately, updates cache in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const cached = await cache.match(request);

  // Update cache in background (don't wait)
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
        console.log('[Service Worker] Updated cache:', request.url);
      }
      return response;
    })
    .catch(error => {
      console.log('[Service Worker] Background update failed:', request.url, error);
      // Return cached if available, or undefined
      return cached;
    });

  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    // Don't await fetchPromise - let it update in background
    fetchPromise.catch(() => {}); // Suppress errors
    return cached;
  }

  // No cache, wait for network
  return fetchPromise;
}

/**
 * Check if URL is a static asset
 * Includes CSS, JS, fonts, images, and all assets
 */
function isStaticAsset(url) {
  // Match file extensions
  if (
    url.match(/\.(css|js|mjs|woff2?|ttf|eot|otf|png|jpg|jpeg|gif|webp|svg|ico|avif|woff|woff2)$/i)
  ) {
    return true;
  }

  // Match asset directories
  if (
    url.includes('/assets/') ||
    url.includes('/css/') ||
    url.includes('/js/') ||
    url.includes('/fonts/') ||
    url.includes('/images/')
  ) {
    return true;
  }

  // Match Vite build assets (hashed filenames)
  if (url.match(/\/assets\/[^/]+-[a-f0-9]+\.(css|js|woff2?|png|jpg|jpeg|gif|webp|svg|avif)$/i)) {
    return true;
  }

  return false;
}

/**
 * Check if URL is an HTML page
 */
function isHTML(url) {
  return url.endsWith('.html') || url.endsWith('/') || !url.match(/\./);
}

/**
 * Handle service worker updates
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
