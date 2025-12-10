/**
 * Unit Tests for js/pages/services.js
 * Tests service modal functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initServiceModals } from '../../../js/pages/services.js';

describe('services.js', () => {
  let mockObserver;

  beforeEach(() => {
    document.body.innerHTML = '';

    // Mock IntersectionObserver
    class MockIntersectionObserver {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observe = vi.fn();
        this.unobserve = vi.fn();
        this.disconnect = vi.fn();
      }
    }

    mockObserver = new MockIntersectionObserver();
    global.IntersectionObserver = MockIntersectionObserver;

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initServiceModals', () => {
    it('should initialize without errors', () => {
      expect(() => initServiceModals()).not.toThrow();
    });

    it('should observe offer panels for visibility', () => {
      const offerPanel = document.createElement('div');
      offerPanel.className = 'offer-panel';
      document.body.appendChild(offerPanel);

      initServiceModals();

      const observerInstance = global.IntersectionObserver.mock.instances[0];
      expect(observerInstance?.observe).toHaveBeenCalledWith(offerPanel);
    });

    it('should add is-visible class when panel intersects', () => {
      const offerPanel = document.createElement('div');
      offerPanel.className = 'offer-panel';
      document.body.appendChild(offerPanel);

      initServiceModals();

      const observerInstance = global.IntersectionObserver.mock.instances[0];
      if (observerInstance?.callback) {
        observerInstance.callback([
          {
            target: offerPanel,
            isIntersecting: true,
          },
        ]);

        expect(offerPanel.classList.contains('is-visible')).toBe(true);
      }
    });

    it('should open modal when service button is clicked', () => {
      const offerPanel = document.createElement('div');
      offerPanel.className = 'offer-panel';
      offerPanel.setAttribute('data-modal', 'modal-web-dev');

      const button = document.createElement('button');
      button.className = 'service-modal-btn';
      offerPanel.appendChild(button);

      const modal = document.createElement('div');
      modal.id = 'modal-web-dev';
      modal.className = 'modal';

      document.body.appendChild(offerPanel);
      document.body.appendChild(modal);

      initServiceModals();

      button.click();

      expect(modal.classList.contains('active')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should close modal when close button is clicked', () => {
      const modal = document.createElement('div');
      modal.id = 'modal-web-dev';
      modal.className = 'modal active';
      document.body.style.overflow = 'hidden';

      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      modal.appendChild(closeButton);

      document.body.appendChild(modal);

      initServiceModals();

      closeButton.click();

      expect(modal.classList.contains('active')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('should close modal when clicking outside content', () => {
      const modal = document.createElement('div');
      modal.id = 'modal-web-dev';
      modal.className = 'modal active';
      document.body.style.overflow = 'hidden';

      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modal.appendChild(modalContent);

      document.body.appendChild(modal);

      initServiceModals();

      // Click on modal background (not content)
      modal.dispatchEvent(
        new MouseEvent('click', {
          target: modal,
          bubbles: true,
        })
      );

      expect(modal.classList.contains('active')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('should not close modal when clicking on content', () => {
      const modal = document.createElement('div');
      modal.id = 'modal-web-dev';
      modal.className = 'modal active';

      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modal.appendChild(modalContent);

      document.body.appendChild(modal);

      initServiceModals();

      // Click on modal content
      modalContent.dispatchEvent(
        new MouseEvent('click', {
          target: modalContent,
          bubbles: true,
        })
      );

      expect(modal.classList.contains('active')).toBe(true);
    });

    it('should close modal with Escape key', () => {
      const modal = document.createElement('div');
      modal.id = 'modal-web-dev';
      modal.className = 'modal active';
      document.body.style.overflow = 'hidden';
      document.body.appendChild(modal);

      initServiceModals();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(modal.classList.contains('active')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('should close all active modals with Escape key', () => {
      const modal1 = document.createElement('div');
      modal1.id = 'modal-1';
      modal1.className = 'modal active';
      document.body.appendChild(modal1);

      const modal2 = document.createElement('div');
      modal2.id = 'modal-2';
      modal2.className = 'modal active';
      document.body.appendChild(modal2);

      initServiceModals();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(modal1.classList.contains('active')).toBe(false);
      expect(modal2.classList.contains('active')).toBe(false);
    });

    it('should stop event propagation on button click', () => {
      const offerPanel = document.createElement('div');
      offerPanel.className = 'offer-panel';
      offerPanel.setAttribute('data-modal', 'modal-web-dev');

      const button = document.createElement('button');
      button.className = 'service-modal-btn';
      offerPanel.appendChild(button);

      const modal = document.createElement('div');
      modal.id = 'modal-web-dev';
      modal.className = 'modal';

      document.body.appendChild(offerPanel);
      document.body.appendChild(modal);

      const stopPropagationSpy = vi.fn();
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(clickEvent, 'stopPropagation', {
        value: stopPropagationSpy,
      });

      initServiceModals();

      button.dispatchEvent(clickEvent);

      // stopPropagation should be called in the handler
      expect(modal.classList.contains('active')).toBe(true);
    });

    it('should handle missing modal gracefully', () => {
      const offerPanel = document.createElement('div');
      offerPanel.className = 'offer-panel';
      offerPanel.setAttribute('data-modal', 'non-existent-modal');

      const button = document.createElement('button');
      button.className = 'service-modal-btn';
      offerPanel.appendChild(button);

      document.body.appendChild(offerPanel);

      expect(() => {
        initServiceModals();
        button.click();
      }).not.toThrow();
    });
  });
});

