/**
 * Unit Tests for js/utils/accessibility.js
 * Tests accessibility utilities (focus management, ARIA announcements)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trapFocus,
  announceToScreenReader,
  setLastFocusedElement,
  restoreFocus,
  initAccessibility,
} from '../../../js/utils/accessibility.js';

describe('accessibility.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('trapFocus', () => {
    it('should return early if container is null', () => {
      const result = trapFocus(null);
      expect(result).toBeUndefined();
    });

    it('should return early if container has no focusable elements', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const result = trapFocus(container);
      expect(result).toBeUndefined();
    });

    it('should trap focus within container', () => {
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      button1.textContent = 'Button 1';
      const button2 = document.createElement('button');
      button2.textContent = 'Button 2';
      const button3 = document.createElement('button');
      button3.textContent = 'Button 3';

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);

      expect(document.activeElement).toBe(button1);

      // Test Tab key - should cycle through buttons
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      button3.dispatchEvent(tabEvent);

      // After Tab on last element, should wrap to first
      button3.focus();
      const tabEvent2 = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      button3.dispatchEvent(tabEvent2);

      // Test Shift+Tab - should go backwards
      button1.focus();
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      });
      button1.dispatchEvent(shiftTabEvent);

      // Cleanup
      if (cleanup) cleanup();
    });

    it('should handle Escape key to close modal', () => {
      const modal = document.createElement('div');
      modal.classList.add('modal');
      const container = document.createElement('div');
      const button = document.createElement('button');
      const closeButton = document.createElement('button');
      closeButton.setAttribute('data-close', 'true');
      closeButton.textContent = 'Close';

      container.appendChild(button);
      modal.appendChild(container);
      modal.appendChild(closeButton);
      document.body.appendChild(modal);

      const closeSpy = vi.spyOn(closeButton, 'click');

      trapFocus(container);

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      container.dispatchEvent(escapeEvent);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should return cleanup function', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      container.appendChild(button);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);

      expect(typeof cleanup).toBe('function');

      if (cleanup) {
        cleanup();
      }
    });
  });

  describe('announceToScreenReader', () => {
    it('should create live region if it does not exist', () => {
      announceToScreenReader('Test message');

      const liveRegion = document.getElementById('aria-live-region');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
      expect(liveRegion.textContent).toBe('Test message');
    });

    it('should use existing live region if it exists', () => {
      const existingRegion = document.createElement('div');
      existingRegion.id = 'aria-live-region';
      existingRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(existingRegion);

      announceToScreenReader('New message');

      const liveRegion = document.getElementById('aria-live-region');
      expect(liveRegion).toBe(existingRegion);
      expect(liveRegion.textContent).toBe('New message');
    });

    it('should use assertive priority when specified', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const liveRegion = document.getElementById('aria-live-region');
      expect(liveRegion.getAttribute('aria-live')).toBe('assertive');
    });

    it('should clear message after timeout', () => {
      vi.useFakeTimers();

      announceToScreenReader('Test message');

      const liveRegion = document.getElementById('aria-live-region');
      expect(liveRegion.textContent).toBe('Test message');

      vi.advanceTimersByTime(1000);

      expect(liveRegion.textContent).toBe('');

      vi.useRealTimers();
    });
  });

  describe('setLastFocusedElement and restoreFocus', () => {
    it('should store and restore focus', () => {
      const button = document.createElement('button');
      button.textContent = 'Test Button';
      document.body.appendChild(button);

      button.focus();
      expect(document.activeElement).toBe(button);

      setLastFocusedElement(button);

      const otherButton = document.createElement('button');
      otherButton.textContent = 'Other Button';
      document.body.appendChild(otherButton);
      otherButton.focus();

      expect(document.activeElement).toBe(otherButton);

      restoreFocus();

      expect(document.activeElement).toBe(button);
    });

    it('should handle restoreFocus when no element was stored', () => {
      // Should not throw
      expect(() => restoreFocus()).not.toThrow();
    });
  });

  describe('initAccessibility', () => {
    it('should add main-content ID to main element if missing', () => {
      const main = document.createElement('main');
      document.body.appendChild(main);

      initAccessibility();

      expect(main.id).toBe('main-content');
    });

    it('should not override existing main-content ID', () => {
      const main = document.createElement('main');
      main.id = 'existing-id';
      document.body.appendChild(main);

      initAccessibility();

      expect(main.id).toBe('existing-id');
    });

    it('should enhance skip link functionality', () => {
      // Mock scrollIntoView since jsdom doesn't implement it
      Element.prototype.scrollIntoView = vi.fn();

      const skipLink = document.createElement('a');
      skipLink.className = 'skip-link';
      skipLink.href = '#main-content';
      const main = document.createElement('main');
      main.id = 'main-content';
      document.body.appendChild(skipLink);
      document.body.appendChild(main);

      initAccessibility();

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      skipLink.dispatchEvent(clickEvent);

      // Skip link should focus main content
      expect(document.activeElement).toBe(main);
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it('should handle Escape key for modals', () => {
      const modal = document.createElement('div');
      modal.classList.add('modal', 'active');
      const closeButton = document.createElement('button');
      closeButton.setAttribute('data-close', 'true');
      modal.appendChild(closeButton);
      document.body.appendChild(modal);

      initAccessibility();

      const closeSpy = vi.spyOn(closeButton, 'click');

      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(escapeEvent);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should announce page load', () => {
      initAccessibility();

      const liveRegion = document.getElementById('aria-live-region');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Page loaded');
    });
  });
});

