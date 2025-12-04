/**
 * Cursor Effects Module
 * Handles custom cursor dot effects
 * Optimized for immediate visibility and performance
 */

export function initCursor() {
  const cursorDot = document.querySelector('.cursor-dot');

  if (!cursorDot) {
    return;
  }

  // Set initial position immediately to prevent invisible cursor on first load
  // Use a default center position if mouse hasn't moved yet
  let lastX = window.innerWidth / 2;
  let lastY = window.innerHeight / 2;

  // Set initial position immediately (before first mousemove)
  cursorDot.style.left = lastX + 'px';
  cursorDot.style.top = lastY + 'px';

  // Force visibility immediately (in case CSS transition hasn't completed)
  cursorDot.style.opacity = '1';
  cursorDot.style.zIndex = '99999'; // Ensure maximum z-index

  // Use requestAnimationFrame to batch cursor updates
  let rafId = null;

  document.addEventListener(
    'mousemove',
    e => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          cursorDot.style.left = lastX + 'px';
          cursorDot.style.top = lastY + 'px';
          rafId = null;
        });
      }
    },
    { passive: true }
  );

  // Scale cursor on interactive elements (defer query until needed)
  // Use event delegation to reduce event listeners
  document.addEventListener(
    'mouseenter',
    e => {
      // Check if target is an Element and has matches method
      const target = e.target;
      if (target && target.nodeType === Node.ELEMENT_NODE && target.matches) {
        if (target.matches('a, button, input, textarea, select')) {
          cursorDot.style.transform = 'scale(1.5)';
        }
      }
    },
    { passive: true, capture: true }
  );

  document.addEventListener(
    'mouseleave',
    e => {
      // Check if target is an Element and has matches method
      const target = e.target;
      if (target && target.nodeType === Node.ELEMENT_NODE && target.matches) {
        if (target.matches('a, button, input, textarea, select')) {
          cursorDot.style.transform = 'scale(1)';
        }
      }
    },
    { passive: true, capture: true }
  );
}
