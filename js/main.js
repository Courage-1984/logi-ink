/**
 * Main Entry Point
 * Imports and initializes all modules
 */

// Import CSS (ensures Vite processes all nested @import statements correctly)
import '../css/main.css';

// Core modules (load immediately)
import { initScrollManager } from './core/scroll-manager.js';
import { initNavigation } from './core/navigation.js';
import { initScroll } from './core/scroll.js';
import { initAnimations } from './core/animations.js';
import { initCursor } from './core/cursor.js';
import { initMouseTilt } from './core/mouse-tilt.js';
import { initInteractions } from './utils/interactions.js';
import { initBackgroundVideoLazyLoad } from './utils/ripples-lazyload.js';
import { initLazyBackgroundImages } from './utils/lazy-background-images.js';
import { initPageTransitions } from './core/page-transitions.js';
import { registerServiceWorker, autoUnregisterServiceWorkers } from './core/service-worker.js';
import { initAccessibility } from './utils/accessibility.js';
import { initErrorHandler } from './utils/error-handler.js';
import { initDynamicPrefetch } from './utils/dynamic-prefetch.js';

// CRITICAL: Auto-unregister service workers immediately (before page loads)
// This prevents service worker from interfering with CSS loading and causing FOUC
if (typeof window !== 'undefined') {
  autoUnregisterServiceWorkers();
}

// Lazy load easter egg module (lightweight initialization - heavy 3D loads on activation)
let easterEggModule = null;

// Initialize all modules when DOM is ready
// Use requestIdleCallback or setTimeout to avoid blocking initial render
const initOnReady = () => {
  // CRITICAL: Initialize mobile detection FIRST to add is-mobile class early
  // This ensures CSS-based disabling works immediately
  if (typeof window !== 'undefined') {
    import('./utils/env.js').then(({ isMobileDevice }) => {
      isMobileDevice(); // This adds the is-mobile class
    });
  }

  // Initialize error handling first (catches errors from other modules)
  initErrorHandler();

  // Critical: Initialize scroll manager first (required by other modules)
  initScrollManager();

  // Critical: Initialize navigation (needed for mobile menu, active states)
  initNavigation();

  // Critical: Initialize scroll effects (back-to-top, progress)
  initScroll();

  // Critical: Initialize page transitions
  initPageTransitions();

  // Critical: Initialize accessibility features
  initAccessibility();

  // Critical: Initialize background video lazy loading
  initBackgroundVideoLazyLoad();

  // Critical: Initialize lazy background images
  initLazyBackgroundImages();

  // Critical: Initialize interactions (button hovers, etc.)
  initInteractions();
};

// Defer non-critical work using requestIdleCallback
const deferNonCritical = callback => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 0);
  }
};

// Use requestIdleCallback to avoid blocking initial render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initOnReady, { timeout: 100 });
    } else {
      setTimeout(initOnReady, 0);
    }
  });
} else {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initOnReady, { timeout: 100 });
  } else {
    setTimeout(initOnReady, 0);
  }
}

// Defer animations (below-fold elements can wait)
deferNonCritical(() => {
  initAnimations();
});

// Defer cursor effects (non-essential visual enhancement)
deferNonCritical(() => {
  initCursor();
});

// Defer mouse tilt effects (non-essential 3D effects)
deferNonCritical(() => {
  initMouseTilt();
});

// Defer dynamic prefetch (nice-to-have optimization)
deferNonCritical(() => {
  initDynamicPrefetch();
});

// Defer performance tracking (analytics, non-blocking)
deferNonCritical(async () => {
  const { initPerformanceTracking } = await import('./utils/performance.js');
  initPerformanceTracking();
});

// Defer service worker registration (can wait until idle)
deferNonCritical(() => {
  registerServiceWorker();
});

// Defer easter egg module (heavy, non-critical)
deferNonCritical(async () => {
  if (!easterEggModule) {
    const easterEggImport = await import('./easter-egg/easter-egg.js');
    easterEggModule = easterEggImport;
    easterEggImport.initEasterEgg();
  }
});

// Defer Three.js hero backgrounds - load when idle (canvas is hidden until ready)
// Use requestIdleCallback for faster loading without blocking critical rendering
const initThreeHeroWhenIdle = async () => {
  // Only load if page is loaded and visible
  if (document.readyState === 'complete' && document.visibilityState === 'visible') {
    const { initThreeHero } = await import('./core/three-hero.js');
    initThreeHero();
  }
};

// Wait for page to be interactive, then use idle callback for faster loading
if (document.readyState === 'complete') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initThreeHeroWhenIdle, { timeout: 500 }); // Faster: 500ms max wait
  } else {
    setTimeout(initThreeHeroWhenIdle, 500); // Fallback: 500ms delay
  }
} else {
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initThreeHeroWhenIdle, { timeout: 500 });
    } else {
      setTimeout(initThreeHeroWhenIdle, 500);
    }
  });
}

// Lazy load page-specific modules (defer until needed)
deferNonCritical(async () => {
  const pathname = window.location.pathname;
  // Check for clean URLs or .html URLs (for backwards compatibility)
  if (pathname.includes('/contact') || pathname.includes('contact.html')) {
    const { initContactForm } = await import('./pages/contact.js');
    initContactForm();
  }

  if (pathname.includes('/services') || pathname.includes('services.html')) {
    const { initServiceModals } = await import('./pages/services.js');
    initServiceModals();
  }

  if (pathname.includes('/projects') || pathname.includes('projects.html')) {
    const { initProjectsPage } = await import('./pages/projects.js');
    initProjectsPage();
  }

  if (pathname.includes('/reports') || pathname.includes('reports.html')) {
    const { initReportsPage } = await import('./pages/reports.js');
    initReportsPage();
  }
});
