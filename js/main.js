/**
 * Main Entry Point
 * Imports and initializes all modules
 */

import { initNavigation } from './core/navigation.js';
import { initScroll } from './core/scroll.js';
import { initAnimations } from './core/animations.js';
import { initCursor } from './core/cursor.js';
import { initMouseTilt } from './core/mouse-tilt.js';
import { initInteractions } from './utils/interactions.js';
import { initContactForm } from './pages/contact.js';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScroll();
    initAnimations();
    initCursor();
    initMouseTilt();
    initInteractions();
    
    // Initialize page-specific modules
    if (window.location.pathname.includes('contact.html')) {
        initContactForm();
    }
});
