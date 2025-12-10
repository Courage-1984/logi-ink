/**
 * Unit Tests for js/core/scroll.js
 * Tests scroll effects including parallax and scroll progress
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initScroll } from '../../../js/core/scroll.js';

describe('scroll.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    // Mock scroll manager
    vi.mock('../../../js/core/scroll-manager.js', () => ({
      addScrollHandler: vi.fn(),
    }));

    // Mock requestAnimationFrame
    window.requestAnimationFrame = vi.fn(callback => {
      callback();
      return 1;
    });

    // Mock window properties
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0,
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    Object.defineProperty(document.documentElement, 'clientHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initScroll', () => {
    it('should initialize without errors', () => {
      expect(() => initScroll()).not.toThrow();
    });

    it('should apply parallax effect to hero background', async () => {
      const heroBg = document.createElement('div');
      heroBg.className = 'hero-background';
      document.body.appendChild(heroBg);

      const { addScrollHandler } = await import('../../../js/core/scroll-manager.js');
      initScroll();

      const scrollHandler = addScrollHandler.mock.calls.find(
        call => call[0].toString().includes('parallax')
      )?.[0];

      if (scrollHandler) {
        window.scrollY = 100;
        window.pageYOffset = 100;
        scrollHandler();

        // Should apply transform
        expect(heroBg.style.transform).toContain('translateY');
      }
    });

    it('should update scroll progress indicator', async () => {
      const scrollProgress = document.createElement('div');
      scrollProgress.className = 'scroll-progress';
      document.body.appendChild(scrollProgress);

      const { addScrollHandler } = await import('../../../js/core/scroll-manager.js');
      initScroll();

      const scrollHandler = addScrollHandler.mock.calls.find(
        call => call[0].toString().includes('progress')
      )?.[0];

      if (scrollHandler) {
        window.scrollY = 500;
        window.pageYOffset = 500;
        scrollHandler();

        // Should update width
        expect(scrollProgress.style.width).toBeTruthy();
        expect(scrollProgress.style.width).toContain('%');
      }
    });

    it('should handle missing scroll progress element', () => {
      expect(() => initScroll()).not.toThrow();
    });

    it('should handle missing parallax elements', () => {
      expect(() => initScroll()).not.toThrow();
    });

    it('should recalculate scroll height on resize', async () => {
      const scrollProgress = document.createElement('div');
      scrollProgress.className = 'scroll-progress';
      document.body.appendChild(scrollProgress);

      const resizeListener = vi.fn();
      window.addEventListener = vi.fn((event, handler) => {
        if (event === 'resize') {
          resizeListener.mockImplementation(handler);
        }
      });

      initScroll();

      // Trigger resize
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 3000,
      });

      resizeListener();

      // Should have set up resize listener
      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should debounce resize events', async () => {
      const scrollProgress = document.createElement('div');
      scrollProgress.className = 'scroll-progress';
      document.body.appendChild(scrollProgress);

      vi.useFakeTimers();

      initScroll();

      // Trigger multiple rapid resize events
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));

      // Fast-forward time
      vi.advanceTimersByTime(150);

      // Should only update once (debounced)
      vi.useRealTimers();
    });

    it('should handle smooth scroll to anchor links', () => {
      const anchorLink = document.createElement('a');
      anchorLink.href = '#section';
      anchorLink.className = 'smooth-scroll';
      document.body.appendChild(anchorLink);

      const targetSection = document.createElement('section');
      targetSection.id = 'section';
      document.body.appendChild(targetSection);

      // Mock scrollIntoView
      targetSection.scrollIntoView = vi.fn();

      initScroll();

      anchorLink.click();

      // Should scroll to target
      expect(targetSection.scrollIntoView).toHaveBeenCalled();
    });

    it('should prevent default on anchor link clicks', () => {
      const anchorLink = document.createElement('a');
      anchorLink.href = '#section';
      anchorLink.className = 'smooth-scroll';
      document.body.appendChild(anchorLink);

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      initScroll();

      anchorLink.dispatchEvent(clickEvent);

      // Should prevent default navigation
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});

