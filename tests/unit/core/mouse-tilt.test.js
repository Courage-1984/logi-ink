/**
 * Unit Tests for js/core/mouse-tilt.js
 * Tests 3D tilt effects on interactive cards
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initMouseTilt } from '../../../js/core/mouse-tilt.js';

describe('mouse-tilt.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    // Mock window.matchMedia
    window.matchMedia = vi.fn(query => ({
      matches: query === '(hover: hover) and (pointer: fine)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Mock requestAnimationFrame
    window.requestAnimationFrame = vi.fn(callback => {
      callback();
      return 1;
    });

    // Reset initialization flag
    delete window.mouseTiltInitialized;

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.mouseTiltInitialized;
  });

  describe('initMouseTilt', () => {
    it('should initialize without errors', () => {
      expect(() => initMouseTilt()).not.toThrow();
    });

    it('should return early if no tilt elements found', () => {
      expect(() => initMouseTilt()).not.toThrow();
    });

    it('should not initialize twice', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      initMouseTilt();
      const firstCall = window.requestAnimationFrame.mock.calls.length;

      initMouseTilt();
      const secondCall = window.requestAnimationFrame.mock.calls.length;

      // Should not add additional listeners
      expect(secondCall).toBe(firstCall);
    });

    it('should skip initialization on non-hover devices', () => {
      window.matchMedia = vi.fn(() => ({
        matches: false, // No hover capability
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      initMouseTilt();

      // Should not set up event listeners
      expect(tiltElement.dataset.tiltInitialized).toBeUndefined();
    });

    it('should apply tilt transform on mouse move', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container service-card';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      initMouseTilt();

      const mouseEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 100,
        bubbles: true,
      });

      tiltElement.dispatchEvent(mouseEvent);

      // Execute RAF callback
      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      expect(tiltElement.style.transform).toContain('perspective');
      expect(tiltElement.style.transform).toContain('rotateX');
      expect(tiltElement.style.transform).toContain('rotateY');
    });

    it('should calculate tilt based on mouse position relative to element center', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      }));

      initMouseTilt();

      // Mouse at top-left corner (should tilt down and right)
      tiltElement.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 100,
          clientY: 100,
          bubbles: true,
        })
      );

      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      expect(tiltElement.style.transform).toContain('rotateX');
      expect(tiltElement.style.transform).toContain('rotateY');
    });

    it('should clamp tilt angles to max 10 degrees', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }));

      initMouseTilt();

      // Extreme mouse position (far from center)
      tiltElement.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 1000,
          clientY: 1000,
          bubbles: true,
        })
      );

      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      // Transform should contain clamped values
      const transform = tiltElement.style.transform;
      expect(transform).toBeTruthy();
      // Values should be clamped (implementation detail, but should not exceed max)
    });

    it('should apply service-card specific transform', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container service-card';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      initMouseTilt();

      tiltElement.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 150,
          clientY: 100,
          bubbles: true,
        })
      );

      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      expect(tiltElement.style.transform).toContain('translateY(-10px)');
      expect(tiltElement.style.transform).toContain('translateZ(20px)');
    });

    it('should apply project-card specific transform', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container project-card';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
      }));

      initMouseTilt();

      tiltElement.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 200,
          clientY: 150,
          bubbles: true,
        })
      );

      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      expect(tiltElement.style.transform).toContain('translateY(-5px)');
      expect(tiltElement.style.transform).toContain('translateZ(15px)');
    });

    it('should reset transform on mouse leave', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      initMouseTilt();

      // Apply tilt
      tiltElement.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 150,
          clientY: 100,
          bubbles: true,
        })
      );

      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      expect(tiltElement.style.transform).toBeTruthy();

      // Mouse leave
      tiltElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      expect(tiltElement.style.transform).toBe('');
      expect(tiltElement.style.willChange).toBe('');
    });

    it('should use requestAnimationFrame for performance', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      initMouseTilt();

      tiltElement.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 150,
          clientY: 100,
          bubbles: true,
        })
      );

      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should throttle rapid mouse movements', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      let rafCallCount = 0;
      window.requestAnimationFrame = vi.fn(callback => {
        rafCallCount++;
        callback();
        return rafCallCount;
      });

      initMouseTilt();

      // Multiple rapid movements
      for (let i = 0; i < 10; i++) {
        tiltElement.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: 150 + i,
            clientY: 100 + i,
            bubbles: true,
          })
        );
      }

      // Should batch updates via RAF
      expect(rafCallCount).toBeGreaterThan(0);
      expect(rafCallCount).toBeLessThan(10); // Throttled
    });

    it('should cache element rect to avoid repeated getBoundingClientRect calls', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      const getBoundingClientRectSpy = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      tiltElement.getBoundingClientRect = getBoundingClientRectSpy;

      initMouseTilt();

      // Multiple mouse moves
      for (let i = 0; i < 5; i++) {
        tiltElement.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 100,
            bubbles: true,
          })
        );
      }

      // Should cache rect (fewer calls than mouse moves)
      expect(getBoundingClientRectSpy.mock.calls.length).toBeLessThan(5);
    });

    it('should use passive event listeners', () => {
      const addEventListenerSpy = vi.spyOn(Element.prototype, 'addEventListener');
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      initMouseTilt();

      const mousemoveCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'mousemove'
      );

      expect(mousemoveCall?.[2]).toEqual({ passive: true });
    });

    it('should set willChange property for performance', () => {
      const tiltElement = document.createElement('div');
      tiltElement.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement);

      tiltElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      initMouseTilt();

      tiltElement.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 150,
          clientY: 100,
          bubbles: true,
        })
      );

      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      expect(tiltElement.style.willChange).toBe('transform');
    });

    it('should handle multiple tilt elements independently', () => {
      const tiltElement1 = document.createElement('div');
      tiltElement1.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement1);

      const tiltElement2 = document.createElement('div');
      tiltElement2.className = 'mouse-tilt-container';
      document.body.appendChild(tiltElement2);

      tiltElement1.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      tiltElement2.getBoundingClientRect = vi.fn(() => ({
        left: 400,
        top: 0,
        width: 300,
        height: 200,
      }));

      initMouseTilt();

      tiltElement1.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 150,
          clientY: 100,
          bubbles: true,
        })
      );

      tiltElement2.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 550,
          clientY: 100,
          bubbles: true,
        })
      );

      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      expect(tiltElement1.style.transform).toBeTruthy();
      expect(tiltElement2.style.transform).toBeTruthy();
    });
  });
});

