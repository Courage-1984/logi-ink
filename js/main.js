/**
 * Main Entry Point
 * Imports and initializes all modules
 */

// Import CSS (ensures Vite processes all nested @import statements correctly)
import '../css/main.css';

// Core modules (load immediately - critical for initial render)
import { initScrollManager } from './core/scroll-manager.js';
import { initNavigation } from './core/navigation.js';
import { initScroll } from './core/scroll.js';
import { initInteractions } from './utils/interactions.js';
import { initHeroFullscreen } from './core/hero-fullscreen.js';

// Non-critical modules (lazy loaded - see lazyLoadOnIdle calls below)
// These are imported dynamically to reduce initial bundle size
let initAnimations, initCursor, initMouseTilt;
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

// CRITICAL: Initialize font loader immediately (before DOM ready)
// This hides navbar and hero text until fonts are loaded to prevent FOUT
import { initFontLoader } from './utils/font-loader.js';
if (typeof document !== 'undefined') {
  // Add fonts-loading class immediately to hide text
  document.documentElement.classList.add('fonts-loading');
  // Initialize font loader
  initFontLoader();
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

  // Initialize hero fullscreen toggle (subtle UI for viewing Three.js backgrounds)
  initHeroFullscreen();
};

// Defer non-critical work using requestIdleCallback
const deferNonCritical = callback => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 0);
  }
};

// Lazy load modules only when needed (viewport-based or idle)
const lazyLoadOnIdle = (callback, options = {}) => {
  const { minDelay = 1000, useIntersection = false } = options;

  if (useIntersection) {
    // Load when page becomes interactive and idle
    if (document.readyState === 'complete') {
      deferNonCritical(() => {
        setTimeout(callback, minDelay);
      });
    } else {
      window.addEventListener('load', () => {
        deferNonCritical(() => {
          setTimeout(callback, minDelay);
        });
      });
    }
  } else {
    // Standard idle callback with delay
    deferNonCritical(() => {
      setTimeout(callback, minDelay);
    });
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

// Load animations immediately after critical modules (critical for perceived performance)
// Use dynamic import for bundle splitting, but load immediately without delay
(async () => {
  // Wait for DOM to be ready, then load animations immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      if (document.querySelectorAll('.fade-in-up, .scroll-reveal-3d, .section-title, .service-card, .count-number').length > 0) {
        if (!initAnimations) {
          const animationsModule = await import('./core/animations.js');
          initAnimations = animationsModule.initAnimations;
        }
        initAnimations();
      }
    });
  } else {
    // DOM already ready, load immediately
    if (document.querySelectorAll('.fade-in-up, .scroll-reveal-3d, .section-title, .service-card, .count-number').length > 0) {
      if (!initAnimations) {
        const animationsModule = await import('./core/animations.js');
        initAnimations = animationsModule.initAnimations;
      }
      initAnimations();
    }
  }
})();

// Load cursor effects early for immediate visibility (on DOMContentLoaded, not idle)
// This ensures cursor is visible immediately on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
  // Only load if cursor dot element exists and device supports hover
    if (document.querySelector('.cursor-dot') && window.matchMedia('(hover: hover)').matches) {
      import('./core/cursor.js').then(({ initCursor }) => {
        initCursor();
      });
    }
  });
} else {
  // DOM already loaded, initialize immediately
  if (document.querySelector('.cursor-dot') && window.matchMedia('(hover: hover)').matches) {
    import('./core/cursor.js').then(({ initCursor }) => {
    initCursor();
    });
  }
}

// Lazy load mouse tilt effects - only on desktop (non-critical visual enhancement)
lazyLoadOnIdle(async () => {
  // Only load if tilt containers exist and device supports hover
  if (document.querySelectorAll('.mouse-tilt-container').length > 0 &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    if (!initMouseTilt) {
      const mouseTiltModule = await import('./core/mouse-tilt.js');
      initMouseTilt = mouseTiltModule.initMouseTilt;
    }
    initMouseTilt();
  }
}, { minDelay: 500, useIntersection: false });

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
    // Wait for active view transition to complete (if any)
    // This prevents Three.js from initializing during page transitions
    if (document.activeViewTransition) {
      await document.activeViewTransition.finished;
    }

    // No need to wait for CSS - Three.js will use window dimensions as fallback
    // Canvas will resize when CSS loads (handled by resize event listener)
    const { initThreeHero, pauseThreeHero, resumeThreeHero } = await import('./core/three-hero.js');
    initThreeHero();

    // Pause animations when page is hidden (helps with Lighthouse CPU idle detection)
    if (typeof document !== 'undefined' && 'hidden' in document) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          pauseThreeHero();
        } else {
          resumeThreeHero();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Also pause after 10 seconds of inactivity to help Lighthouse detect CPU idle
      let inactivityTimer;
      const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          // Only pause if page is visible but user is inactive
          if (!document.hidden) {
            pauseThreeHero();
            // Resume after 2 seconds (in case user returns)
            setTimeout(() => {
              if (!document.hidden) {
                resumeThreeHero();
              }
            }, 2000);
          }
        }, 10000); // 10 seconds of inactivity
      };

      // Reset timer on user interaction
      ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
          resetInactivityTimer();
          if (document.hidden === false) {
            resumeThreeHero();
          }
        }, { passive: true });
      });

      resetInactivityTimer();
    }
  }
};

// Wait for page to be interactive, then use idle callback for faster loading
// Reduced timeout since CSS is now async (doesn't block render)
if (document.readyState === 'complete') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initThreeHeroWhenIdle, { timeout: 200 }); // Faster: 200ms max wait (reduced from 500ms)
  } else {
    setTimeout(initThreeHeroWhenIdle, 200); // Fallback: 200ms delay (reduced from 500ms)
  }
} else {
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initThreeHeroWhenIdle, { timeout: 200 }); // Faster: 200ms max wait
    } else {
      setTimeout(initThreeHeroWhenIdle, 200); // Fallback: 200ms delay
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

  if (pathname.includes('/showcase') || pathname.includes('showcase.html')) {
    const { initShowcase } = await import('./pages/showcase.js');
    initShowcase();
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
