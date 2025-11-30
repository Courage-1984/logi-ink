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
import { registerServiceWorker } from './core/service-worker.js';
import { initAccessibility } from './utils/accessibility.js';
import { initErrorHandler } from './utils/error-handler.js';
import { initDynamicPrefetch } from './utils/dynamic-prefetch.js';

// Lazy load easter egg module (lightweight initialization - heavy 3D loads on activation)
let easterEggModule = null;

// Initialize all modules when DOM is ready
// Use requestIdleCallback or setTimeout to avoid blocking initial render
const initOnReady = () => {
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
const deferNonCritical = (callback) => {
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

// Defer Three.js hero backgrounds (already has internal deferral, but ensure it's not blocking)
deferNonCritical(async () => {
  const { initThreeHero } = await import('./core/three-hero.js');
  initThreeHero();
});

// Lazy load page-specific modules (defer until needed)
deferNonCritical(async () => {
  if (window.location.pathname.includes('contact.html')) {
    const { initContactForm } = await import('./pages/contact.js');
    initContactForm();
  }

  if (window.location.pathname.includes('services.html')) {
    const { initServiceModals } = await import('./pages/services.js');
    initServiceModals();
  }

  if (window.location.pathname.includes('projects.html')) {
    const { initProjectsPage } = await import('./pages/projects.js');
    initProjectsPage();
  }

  if (window.location.pathname.includes('reports.html')) {
    const { initReportsPage } = await import('./pages/reports.js');
    initReportsPage();
  }
});
