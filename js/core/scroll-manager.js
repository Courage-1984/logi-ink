/**
 * Scroll Manager Module
 * Centralized scroll event handler using requestAnimationFrame for performance
 * Consolidates all scroll listeners to reduce performance overhead
 */

let scrollTicking = false;
const scrollHandlers = [];

/**
 * Main scroll handler using requestAnimationFrame
 */
function onScroll() {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      scrollHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          // Silently handle errors to prevent breaking other handlers
        }
      });
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}

/**
 * Add a scroll handler to the manager
 * @param {Function} handler - Function to call on scroll
 */
export function addScrollHandler(handler) {
  if (typeof handler === 'function' && !scrollHandlers.includes(handler)) {
    scrollHandlers.push(handler);
  }
}

/**
 * Remove a scroll handler from the manager
 * @param {Function} handler - Function to remove
 */
export function removeScrollHandler(handler) {
  const index = scrollHandlers.indexOf(handler);
  if (index > -1) {
    scrollHandlers.splice(index, 1);
  }
}

/**
 * Initialize the scroll manager
 */
export function initScrollManager() {
  window.addEventListener('scroll', onScroll, { passive: true });
}
