/**
 * Unit Tests for js/core/cursor.js
 * Tests custom cursor effects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initCursor } from '../../../js/core/cursor.js';

describe('cursor.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    // Mock requestAnimationFrame
    window.requestAnimationFrame = vi.fn(callback => {
      callback();
      return 1;
    });

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initCursor', () => {
    it('should return early if cursor dot element is missing', () => {
      expect(() => initCursor()).not.toThrow();
    });

    it('should set initial cursor position to center', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      initCursor();

      expect(cursorDot.style.left).toBe('960px'); // window.innerWidth / 2
      expect(cursorDot.style.top).toBe('540px'); // window.innerHeight / 2
    });

    it('should set initial opacity and z-index', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      initCursor();

      expect(cursorDot.style.opacity).toBe('1');
      expect(cursorDot.style.zIndex).toBe('99999');
    });

    it('should update cursor position on mouse move', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      initCursor();

      const mouseEvent = new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 300,
        bubbles: true,
      });

      document.dispatchEvent(mouseEvent);

      // Wait for RAF
      const rafCallback = window.requestAnimationFrame.mock.calls[0]?.[0];
      if (rafCallback) {
        rafCallback();
      }

      expect(cursorDot.style.left).toBe('500px');
      expect(cursorDot.style.top).toBe('300px');
    });

    it('should use requestAnimationFrame for cursor updates', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      initCursor();

      document.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 100,
          clientY: 200,
          bubbles: true,
        })
      );

      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should scale cursor on interactive elements', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      const link = document.createElement('a');
      link.href = '#';
      document.body.appendChild(link);

      initCursor();

      const mouseEnterEvent = new MouseEvent('mouseenter', {
        target: link,
        bubbles: true,
      });

      document.dispatchEvent(mouseEnterEvent);

      expect(cursorDot.style.transform).toBe('scale(1.5)');
    });

    it('should reset cursor scale when leaving interactive elements', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      const button = document.createElement('button');
      document.body.appendChild(button);

      initCursor();

      // Enter
      document.dispatchEvent(
        new MouseEvent('mouseenter', {
          target: button,
          bubbles: true,
        })
      );

      expect(cursorDot.style.transform).toBe('scale(1.5)');

      // Leave
      document.dispatchEvent(
        new MouseEvent('mouseleave', {
          target: button,
          bubbles: true,
        })
      );

      expect(cursorDot.style.transform).toBe('scale(1)');
    });

    it('should handle buttons, inputs, and textareas', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      const input = document.createElement('input');
      document.body.appendChild(input);

      initCursor();

      document.dispatchEvent(
        new MouseEvent('mouseenter', {
          target: input,
          bubbles: true,
        })
      );

      expect(cursorDot.style.transform).toBe('scale(1.5)');
    });

    it('should not scale on non-interactive elements', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      const div = document.createElement('div');
      document.body.appendChild(div);

      initCursor();

      document.dispatchEvent(
        new MouseEvent('mouseenter', {
          target: div,
          bubbles: true,
        })
      );

      expect(cursorDot.style.transform).toBe('');
    });

    it('should throttle rapid mouse movements with RAF', () => {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      let rafCallCount = 0;
      window.requestAnimationFrame = vi.fn(callback => {
        rafCallCount++;
        callback();
        return rafCallCount;
      });

      initCursor();

      // Multiple rapid movements
      for (let i = 0; i < 10; i++) {
        document.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: 100 + i,
            clientY: 200 + i,
            bubbles: true,
          })
        );
      }

      // Should batch updates via RAF
      expect(rafCallCount).toBeGreaterThan(0);
      expect(rafCallCount).toBeLessThan(10); // Throttled
    });

    it('should use passive event listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);

      initCursor();

      const mousemoveCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'mousemove'
      );

      expect(mousemoveCall?.[2]).toEqual({ passive: true });
    });
  });
});

