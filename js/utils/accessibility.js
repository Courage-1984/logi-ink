/**
 * Accessibility Utilities
 * Provides focus management, ARIA announcements, and keyboard navigation
 */

// Store last focused element before modal/overlay opens
let lastFocusedElement = null;

/**
 * Trap focus within a container (for modals, overlays, etc.)
 * @param {HTMLElement} container - The container element to trap focus within
 */
export function trapFocus(container) {
  if (!container) return;

  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Escape key to close modal/overlay
    if (e.key === 'Escape') {
      const modal = container.closest('.modal, .overlay, [role="dialog"]');
      if (modal) {
        const closeButton = modal.querySelector('[data-close], .close-button, [aria-label*="close" i]');
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce message to screen readers
 * @param {string} message - The message to announce
 * @param {string} priority - 'polite' or 'assertive' (default: 'polite')
 */
export function announceToScreenReader(message, priority = 'polite') {
  const liveRegion = document.getElementById('aria-live-region');
  if (!liveRegion) {
    // Create live region if it doesn't exist
    const region = document.createElement('div');
    region.id = 'aria-live-region';
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    region.textContent = message;
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
    return;
  }

  liveRegion.setAttribute('aria-live', priority);
  liveRegion.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}

/**
 * Store the currently focused element
 * @param {HTMLElement} element - The element to store
 */
export function setLastFocusedElement(element) {
  lastFocusedElement = element || document.activeElement;
}

/**
 * Get the last focused element
 * @returns {HTMLElement|null}
 */
export function getLastFocusedElement() {
  return lastFocusedElement;
}

/**
 * Restore focus to the last focused element
 */
export function restoreFocus() {
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

/**
 * Initialize accessibility features
 */
export function initAccessibility() {
  // Add main-content ID if it doesn't exist
  const mainContent = document.querySelector('main, .main-content, #main-content');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }

  // Enhance keyboard navigation for skip link
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      const target = document.querySelector(skipLink.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.setAttribute('tabindex', '-1');
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        announceToScreenReader('Skipped to main content');
        target.removeAttribute('tabindex');
      }
    });
  }

  // Add keyboard navigation for modals
  document.addEventListener('keydown', (e) => {
    // Escape key handling for modals
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal.active, .overlay.active, [role="dialog"][aria-hidden="false"]');
      if (openModal) {
        const closeButton = openModal.querySelector('[data-close], .close-button, [aria-label*="close" i]');
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  });

  // Announce page load to screen readers
  announceToScreenReader('Page loaded');
}

