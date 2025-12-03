/**
 * Unit Tests for js/utils/toast.js
 * Tests toast notification functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { showToast } from '../../../js/utils/toast.js';

describe('toast.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('showToast', () => {
    it('should create and display a success toast', () => {
      const toast = showToast('Test message', 'success');

      expect(toast).toBeTruthy();
      expect(toast.classList.contains('toast')).toBe(true);
      expect(toast.classList.contains('success')).toBe(true);
      expect(toast.getAttribute('role')).toBe('alert');
      expect(toast.getAttribute('aria-live')).toBe('assertive');
      expect(document.body.contains(toast)).toBe(true);
    });

    it('should create and display an error toast', () => {
      const toast = showToast('Error message', 'error');

      expect(toast.classList.contains('error')).toBe(true);
      expect(toast.textContent).toContain('Error');
    });

    it('should remove existing toasts before showing new one', () => {
      const toast1 = showToast('First message');
      const toast2 = showToast('Second message');

      const toasts = document.querySelectorAll('.toast');
      expect(toasts.length).toBe(1);
      expect(toasts[0]).toBe(toast2);
    });

    it('should add show class after a short delay', () => {
      const toast = showToast('Test message');

      expect(toast.classList.contains('show')).toBe(false);

      vi.advanceTimersByTime(10);

      expect(toast.classList.contains('show')).toBe(true);
    });

    it('should auto-hide toast after duration', () => {
      const toast = showToast('Test message', 'success', 1000);

      vi.advanceTimersByTime(10);
      expect(toast.classList.contains('show')).toBe(true);

      vi.advanceTimersByTime(1000);
      expect(toast.classList.contains('show')).toBe(false);

      vi.advanceTimersByTime(300);
      expect(document.body.contains(toast)).toBe(false);
    });

    it('should not auto-hide when duration is 0', () => {
      const toast = showToast('Test message', 'success', 0);

      vi.advanceTimersByTime(10000);

      expect(document.body.contains(toast)).toBe(true);
    });

    it('should close toast when close button is clicked', () => {
      const toast = showToast('Test message');

      vi.advanceTimersByTime(10);
      expect(toast.classList.contains('show')).toBe(true);

      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.click();

      expect(toast.classList.contains('show')).toBe(false);

      vi.advanceTimersByTime(300);
      expect(document.body.contains(toast)).toBe(false);
    });

    it('should include correct icon for success toast', () => {
      const toast = showToast('Success message', 'success');

      expect(toast.innerHTML).toContain('Success');
      expect(toast.innerHTML).toContain('polyline');
    });

    it('should include correct icon for error toast', () => {
      const toast = showToast('Error message', 'error');

      expect(toast.innerHTML).toContain('Error');
      expect(toast.innerHTML).toContain('circle');
    });

    it('should display the message in toast body', () => {
      const message = 'This is a test message';
      const toast = showToast(message);

      expect(toast.textContent).toContain(message);
    });
  });
});

