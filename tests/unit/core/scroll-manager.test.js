/**
 * Unit Tests for js/core/scroll-manager.js
 * Tests centralized scroll event handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addScrollHandler, removeScrollHandler, initScrollManager } from '../../../js/core/scroll-manager.js';

describe('scroll-manager.js', () => {
  let mockRequestAnimationFrame;
  let rafCallbacks;

  beforeEach(() => {
    // Mock requestAnimationFrame
    rafCallbacks = [];
    mockRequestAnimationFrame = vi.fn(callback => {
      rafCallbacks.push(callback);
      return 1;
    });
    window.requestAnimationFrame = mockRequestAnimationFrame;

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Clear any existing handlers
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Remove event listeners
    window.removeEventListener('scroll', vi.fn());
    vi.restoreAllMocks();
  });

  describe('addScrollHandler', () => {
    it('should add a scroll handler function', () => {
      const handler = vi.fn();
      addScrollHandler(handler);

      // Trigger scroll
      window.dispatchEvent(new Event('scroll'));

      // Execute RAF callbacks
      rafCallbacks.forEach(cb => cb());

      expect(handler).toHaveBeenCalled();
    });

    it('should not add duplicate handlers', () => {
      const handler = vi.fn();
      addScrollHandler(handler);
      addScrollHandler(handler);

      window.dispatchEvent(new Event('scroll'));
      rafCallbacks.forEach(cb => cb());

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not add non-function handlers', () => {
      addScrollHandler(null);
      addScrollHandler(undefined);
      addScrollHandler('not a function');
      addScrollHandler(123);

      window.dispatchEvent(new Event('scroll'));
      rafCallbacks.forEach(cb => cb());

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('should handle multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      addScrollHandler(handler1);
      addScrollHandler(handler2);
      addScrollHandler(handler3);

      window.dispatchEvent(new Event('scroll'));
      rafCallbacks.forEach(cb => cb());

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });

    it('should use requestAnimationFrame for performance', () => {
      const handler = vi.fn();
      addScrollHandler(handler);

      window.dispatchEvent(new Event('scroll'));

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled(); // Not called until RAF executes

      rafCallbacks.forEach(cb => cb());
      expect(handler).toHaveBeenCalled();
    });

    it('should handle errors in handlers gracefully', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();

      addScrollHandler(errorHandler);
      addScrollHandler(normalHandler);

      window.dispatchEvent(new Event('scroll'));
      rafCallbacks.forEach(cb => cb());

      // Normal handler should still be called despite error
      expect(normalHandler).toHaveBeenCalled();
    });
  });

  describe('removeScrollHandler', () => {
    it('should remove a scroll handler', () => {
      const handler = vi.fn();
      addScrollHandler(handler);
      removeScrollHandler(handler);

      window.dispatchEvent(new Event('scroll'));
      rafCallbacks.forEach(cb => cb());

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not throw when removing non-existent handler', () => {
      const handler = vi.fn();
      expect(() => removeScrollHandler(handler)).not.toThrow();
    });

    it('should only remove the specified handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      addScrollHandler(handler1);
      addScrollHandler(handler2);
      addScrollHandler(handler3);
      removeScrollHandler(handler2);

      window.dispatchEvent(new Event('scroll'));
      rafCallbacks.forEach(cb => cb());

      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });
  });

  describe('initScrollManager', () => {
    it('should add scroll event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      initScrollManager();

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
        passive: true,
      });
    });

    it('should use passive event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      initScrollManager();

      const call = addEventListenerSpy.mock.calls.find(call => call[0] === 'scroll');
      expect(call[2]).toEqual({ passive: true });
    });
  });

  describe('scroll throttling', () => {
    it('should throttle rapid scroll events', () => {
      const handler = vi.fn();
      addScrollHandler(handler);

      // Trigger multiple scroll events rapidly
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('scroll'));
      }

      // Should only call RAF once (throttled)
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);

      // Execute RAF callback
      rafCallbacks.forEach(cb => cb());

      // Handler should be called once
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should allow new RAF after previous completes', () => {
      const handler = vi.fn();
      addScrollHandler(handler);

      // First scroll
      window.dispatchEvent(new Event('scroll'));
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);

      // Execute RAF
      rafCallbacks.forEach(cb => cb());
      rafCallbacks = [];

      // Second scroll should trigger new RAF
      window.dispatchEvent(new Event('scroll'));
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
    });
  });
});

