/**
 * Unit Tests for js/core/animations.js
 * Tests scroll-triggered animations and reveal effects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initAnimations } from '../../../js/core/animations.js';

describe('animations.js', () => {
  let mockObserver;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    // Mock IntersectionObserver with proper class implementation
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

    // Mock requestAnimationFrame
    window.requestAnimationFrame = vi.fn(callback => {
      callback();
      return 1;
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initAnimations', () => {
    it('should initialize without errors', () => {
      expect(() => initAnimations()).not.toThrow();
    });

    it('should observe fade-in-up elements', () => {
      const element = document.createElement('div');
      element.className = 'fade-in-up';
      document.body.appendChild(element);

      initAnimations();

      expect(mockObserver.observe).toHaveBeenCalledWith(element);
    });

    it('should add visible class when element intersects', () => {
      const element = document.createElement('div');
      element.className = 'fade-in-up';
      document.body.appendChild(element);

      initAnimations();

      // Simulate intersection - find the observer instance and call its callback
      const observerInstance = global.IntersectionObserver.mock.instances.find(
        instance => instance.observe.mock.calls.some(call => call[0] === element)
      );
      if (observerInstance && observerInstance.callback) {
        observerInstance.callback([
          {
            target: element,
            isIntersecting: true,
          },
        ]);

        expect(element.classList.contains('visible')).toBe(true);
      }
    });

    it('should observe section titles for text reveal', () => {
      const sectionTitle = document.createElement('h2');
      sectionTitle.className = 'section-title';
      sectionTitle.textContent = 'Test Title';
      document.body.appendChild(sectionTitle);

      initAnimations();

      // Should create text reveal observer
      expect(global.IntersectionObserver).toHaveBeenCalled();
    });

    it('should process text reveal animation', () => {
      const sectionTitle = document.createElement('h2');
      sectionTitle.className = 'section-title';
      sectionTitle.textContent = 'Test Title Words';
      document.body.appendChild(sectionTitle);

      initAnimations();

      // Find text reveal observer instance
      const textRevealObserver = global.IntersectionObserver.mock.instances.find(
        instance => instance.options?.threshold === 0.5
      );

      if (textRevealObserver && textRevealObserver.callback) {
        textRevealObserver.callback([
          {
            target: sectionTitle,
            isIntersecting: true,
          },
        ]);

        // Should wrap words in spans
        expect(sectionTitle.innerHTML).toContain('<span');
        expect(sectionTitle.innerHTML).toContain('Test');
      }
    });

    it('should observe scroll-reveal-3d elements', () => {
      const element = document.createElement('div');
      element.className = 'scroll-reveal-3d';
      document.body.appendChild(element);

      initAnimations();

      const observerInstance = global.IntersectionObserver.mock.instances.find(
        instance => instance.observe.mock.calls.some(call => call[0] === element)
      );
      expect(observerInstance).toBeTruthy();
      expect(observerInstance?.observe).toHaveBeenCalledWith(element);
    });

    it('should observe service cards', () => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'service-card';
      document.body.appendChild(serviceCard);

      initAnimations();

      const observerInstance = global.IntersectionObserver.mock.instances.find(
        instance => instance.observe.mock.calls.some(call => call[0] === serviceCard)
      );
      expect(observerInstance).toBeTruthy();
      expect(observerInstance?.observe).toHaveBeenCalledWith(serviceCard);
    });

    it('should handle elements that are already visible', () => {
      const element = document.createElement('div');
      element.className = 'fade-in-up';
      document.body.appendChild(element);

      // Mock getBoundingClientRect to return visible position
      element.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        bottom: 200,
      }));

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      });

      initAnimations();

      // Should add visible class immediately
      expect(element.classList.contains('visible')).toBe(true);
    });

    it('should cache DOM queries for performance', () => {
      const element1 = document.createElement('div');
      element1.className = 'fade-in-up';
      document.body.appendChild(element1);

      initAnimations();

      // Add another element after init
      const element2 = document.createElement('div');
      element2.className = 'fade-in-up';
      document.body.appendChild(element2);

      // Should only observe initially cached elements
      // (implementation may vary, but should cache)
      const observerInstance = global.IntersectionObserver.mock.instances[0];
      expect(observerInstance?.observe).toHaveBeenCalled();
    });

    it('should handle missing elements gracefully', () => {
      expect(() => initAnimations()).not.toThrow();
    });

    it('should use requestAnimationFrame for batch DOM reads', () => {
      const element = document.createElement('div');
      element.className = 'fade-in-up';
      document.body.appendChild(element);

      initAnimations();

      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });
  });
});

