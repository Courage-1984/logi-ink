/**
 * Lazy Background Images Utility
 * Lazy loads CSS background images when sections are near the viewport
 * Supports modern image formats (AVIF, WebP) with fallbacks
 */

// Log immediately when module loads
console.log('[CTA Background] Module loaded');

/**
 * Get the base path for asset URLs
 * Uses Vite's import.meta.env.BASE_URL when available, otherwise detects from current location
 */
function getBasePath() {
  // Vite provides BASE_URL that respects the base config
  // In production builds, this is replaced at build time
  let baseUrl = '/';

  if (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  }

  // Ensure it ends with / for proper path joining (unless it's empty)
  if (baseUrl && !baseUrl.endsWith('/')) {
    baseUrl = `${baseUrl}/`;
  }

  // If baseUrl is empty or just '/', return '/'
  // This works for both dev (/) and preview (/)
  return baseUrl || '/';
}

/**
 * Initialize lazy loading for background images
 */
export function initLazyBackgroundImages() {
  console.log('[CTA Background] initLazyBackgroundImages called');
  const basePath = getBasePath();
  console.log('[CTA Background] Base path detected:', basePath);

  // Lazy load poster image for video background
  const videoBackground = document.querySelector('.section-video-background');
  if (videoBackground && !videoBackground.dataset.lazyLoaded) {
    videoBackground.dataset.lazyLoaded = 'true';
    lazyLoadBackgroundImage(videoBackground, {
      avif: `${basePath}assets/video/optimized/ripples-poster.avif`,
      webp: `${basePath}assets/video/optimized/ripples-poster.webp`,
      fallback: `${basePath}assets/video/optimized/ripples-poster.jpg`,
    });
  }

  // Lazy load CTA section background images (handle all CTA sections on page)
  const ctaSections = document.querySelectorAll('.cta-section');
  console.log('[CTA Background] Found CTA sections:', ctaSections.length);

  if (ctaSections.length === 0) {
    console.log('[CTA Background] No CTA sections found on this page');
    return; // No CTA sections on this page
  }

  ctaSections.forEach((ctaSection) => {
    if (!ctaSection.dataset.lazyLoaded) {
      ctaSection.dataset.lazyLoaded = 'true';
      const sources = getCTABackgroundSources();

      // Load immediately - CTA sections are critical and should always load
      // Don't wait for viewport intersection since they're often at bottom of page
      loadBackgroundImage(ctaSection, sources);
    }
  });

  // Aggressive fallback: Force reload after short delay if not loaded
  // This handles cases where initial load fails due to path issues
  setTimeout(() => {
    ctaSections.forEach((ctaSection) => {
      if (!ctaSection.classList.contains('bg-loaded')) {
        const sources = getCTABackgroundSources();
        // Try loading again with fresh sources
        loadBackgroundImage(ctaSection, sources);
      }
    });
  }, 500); // Reduced to 500ms for faster loading

  // Final fallback: Try again after page is fully loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      ctaSections.forEach((ctaSection) => {
        if (!ctaSection.classList.contains('bg-loaded')) {
          const sources = getCTABackgroundSources();
          loadBackgroundImage(ctaSection, sources);
        }
      });
    }, 200);
  });
}

/**
 * Get CTA section background image sources based on viewport
 */
function getCTABackgroundSources() {
  const width = window.innerWidth;
  const basePath = getBasePath();
  let baseName = 'cta-get-in-touch-1280w';

  if (width <= 480) {
    baseName = 'cta-get-in-touch-480w';
  } else if (width <= 768) {
    baseName = 'cta-get-in-touch-768w';
  } else if (width <= 1024) {
    baseName = 'cta-get-in-touch-1024w';
  }

  // Use base path aware URLs to work in both dev and production (including GitHub Pages)
  const sources = {
    avif: `${basePath}assets/images/responsive/backgrounds/${baseName}.avif`,
    webp: `${basePath}assets/images/responsive/backgrounds/${baseName}.webp`,
    fallback: `${basePath}assets/images/responsive/backgrounds/${baseName}.webp`,
  };

  console.log('[CTA Background] Base path:', basePath);
  console.log('[CTA Background] Viewport width:', width);
  console.log('[CTA Background] Selected image:', baseName);
  console.log('[CTA Background] Full paths:', sources);

  return sources;
}

/**
 * Load background image with format fallback
 */
function loadBackgroundImage(element, sources) {
  let loaded = false;

  // Debug logging
  console.log('[CTA Background] Loading images for:', element);
  console.log('[CTA Background] Sources:', sources);

  // Try AVIF first, then WebP, then fallback
  const tryLoadImage = (src, nextFallback) => {
    if (loaded) return; // Already loaded, don't try again

    console.log('[CTA Background] Trying to load:', src);

    const img = new Image();
    img.onload = () => {
      if (loaded) return; // Already loaded
      loaded = true;
      console.log('[CTA Background] ✅ Successfully loaded:', src);
      element.style.backgroundImage = `url("${src}")`;
      element.classList.add('bg-loaded');
    };
    img.onerror = (e) => {
      console.warn('[CTA Background] ❌ Failed to load:', src, e);
      // Try next fallback
      if (nextFallback && !loaded) {
        tryLoadImage(nextFallback, null);
      } else if (sources.fallback && src !== sources.fallback && !loaded) {
        tryLoadImage(sources.fallback, null);
      } else {
        console.error('[CTA Background] ❌ All image sources failed for:', element);
      }
    };
    img.src = src;
  };

  // Try AVIF -> WebP -> Fallback
  if (sources.avif) {
    tryLoadImage(sources.avif, sources.webp || sources.fallback);
  } else if (sources.webp) {
    tryLoadImage(sources.webp, sources.fallback);
  } else if (sources.fallback) {
    tryLoadImage(sources.fallback, null);
  }
}

/**
 * Cache viewport dimensions to avoid repeated layout reads
 */
let cachedViewportHeight = window.innerHeight || document.documentElement.clientHeight;
let cachedViewportWidth = window.innerWidth || document.documentElement.clientWidth;

// Update cache on resize
let viewportResizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(viewportResizeTimeout);
  viewportResizeTimeout = setTimeout(() => {
    cachedViewportHeight = window.innerHeight || document.documentElement.clientHeight;
    cachedViewportWidth = window.innerWidth || document.documentElement.clientWidth;
  }, 100);
});

/**
 * Batch getBoundingClientRect calls to avoid layout thrashing
 */
const pendingRectReads = new Map();
let rectReadRafId = null;

function batchGetBoundingClientRect(element) {
  if (pendingRectReads.has(element)) {
    return pendingRectReads.get(element);
  }

  const rect = element.getBoundingClientRect();
  pendingRectReads.set(element, rect);

  if (!rectReadRafId) {
    rectReadRafId = requestAnimationFrame(() => {
      pendingRectReads.clear();
      rectReadRafId = null;
    });
  }

  return rect;
}

/**
 * Check if element is already in viewport or near viewport
 * Uses cached viewport dimensions and batched rect reads
 */
function isElementInViewport(element) {
  const rect = batchGetBoundingClientRect(element);

  // More lenient check: element is in viewport or within 500px of it
  return (
    rect.top < cachedViewportHeight + 500 && // Within 500px below viewport
    rect.bottom > -500 && // Within 500px above viewport
    rect.left < cachedViewportWidth &&
    rect.right > 0
  );
}

/**
 * Lazy load a background image using Intersection Observer
 */
function lazyLoadBackgroundImage(element, sources) {
  // If element is already in viewport or near it, load immediately
  if (isElementInViewport(element)) {
    loadBackgroundImage(element, sources);
    return;
  }

  // Use Intersection Observer to load when near viewport
  // Use a larger rootMargin to start loading earlier
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadBackgroundImage(element, sources);
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: '500px', // Start loading 500px before entering viewport (more aggressive)
      threshold: 0, // Trigger as soon as any part is visible
    }
  );

  observer.observe(element);

  // Fallback: If Intersection Observer doesn't work, load after scroll
  // This handles edge cases where IO might not trigger
  let scrollTimeout;
  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (isElementInViewport(element) && !element.classList.contains('bg-loaded')) {
        loadBackgroundImage(element, sources);
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      }
    }, 100);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Also check on resize in case viewport changes
  window.addEventListener('resize', handleScroll, { passive: true });
}


