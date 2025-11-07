/**
 * Main Entry Point
 * Imports and initializes all modules
 */

// Core modules (load immediately)
import { initScrollManager } from './core/scroll-manager.js';
import { initNavigation } from './core/navigation.js';
import { initScroll } from './core/scroll.js';
import { initAnimations } from './core/animations.js';
import { initCursor } from './core/cursor.js';
import { initMouseTilt } from './core/mouse-tilt.js';
import { initInteractions } from './utils/interactions.js';
import { initPageTransitions } from './core/page-transitions.js';
import { registerServiceWorker } from './core/service-worker.js';
import { initAccessibility } from './utils/accessibility.js';

// Lazy load easter egg module (lightweight initialization - heavy 3D loads on activation)
let easterEggModule = null;

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Register service worker (for offline support and caching)
  registerServiceWorker();

  // Initialize scroll manager first (required by other modules)
  initScrollManager();

  // Initialize accessibility features first
  initAccessibility();

  // Initialize core modules
  initPageTransitions();
  initNavigation();
  initScroll();
  initAnimations();
  initCursor();
  initMouseTilt();
  initInteractions();

  // Lazy load page-specific modules
  if (window.location.pathname.includes('contact.html')) {
    const { initContactForm } = await import('./pages/contact.js');
    initContactForm();
  }

  if (window.location.pathname.includes('services.html')) {
    const { initServiceModals } = await import('./pages/services.js');
    initServiceModals();
  }

  // Initialize easter egg module (sets up triggers - heavy 3D loads on activation)
  // This needs to run early so it can add the footer trigger text
  if (!easterEggModule) {
    const easterEggImport = await import('./core/easter-egg.js');
    easterEggModule = easterEggImport;
    easterEggImport.initEasterEgg();
  }
});
