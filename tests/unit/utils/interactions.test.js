/**
 * Unit Tests for js/utils/interactions.js
 * Tests button hover effects, card interactions, and ripple effects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initInteractions } from '../../../js/utils/interactions.js';

describe('interactions.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initInteractions', () => {
    it('should initialize without errors', () => {
      expect(() => initInteractions()).not.toThrow();
    });

    it('should add scale effect to buttons on hover', () => {
      const button = document.createElement('button');
      button.className = 'btn';
      document.body.appendChild(button);

      initInteractions();

      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      expect(button.style.transform).toBe('scale(1.05)');
    });

    it('should reset button scale on mouse leave', () => {
      const button = document.createElement('button');
      button.className = 'btn';
      document.body.appendChild(button);

      initInteractions();

      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      expect(button.style.transform).toBe('scale(1.05)');

      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      expect(button.style.transform).toBe('scale(1)');
    });

    it('should add hover effect to service cards without mouse-tilt', () => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'service-card';
      document.body.appendChild(serviceCard);

      initInteractions();

      serviceCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      expect(serviceCard.style.transform).toContain('translateY(-10px)');
      expect(serviceCard.style.transform).toContain('scale(1.02)');
    });

    it('should not add hover effect to mouse-tilt-container cards', () => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'service-card mouse-tilt-container';
      document.body.appendChild(serviceCard);

      initInteractions();

      serviceCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      // Should not have fallback transform (mouse-tilt handles it)
      expect(serviceCard.style.transform).toBe('');
    });

    it('should show overlay on project card hover', () => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card-large';

      const overlay = document.createElement('div');
      overlay.className = 'project-overlay';
      overlay.style.opacity = '0';
      projectCard.appendChild(overlay);

      document.body.appendChild(projectCard);

      initInteractions();

      projectCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      expect(overlay.style.opacity).toBe('1');
    });

    it('should hide overlay on project card mouse leave', () => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card-large';

      const overlay = document.createElement('div');
      overlay.className = 'project-overlay';
      overlay.style.opacity = '1';
      projectCard.appendChild(overlay);

      document.body.appendChild(projectCard);

      initInteractions();

      projectCard.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      expect(overlay.style.opacity).toBe('0');
    });

    it('should create ripple effect on button click', () => {
      const button = document.createElement('button');
      button.className = 'btn';
      document.body.appendChild(button);

      initInteractions();

      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 200,
        bubbles: true,
      });

      button.dispatchEvent(clickEvent);

      const ripple = button.querySelector('.ripple');
      expect(ripple).toBeTruthy();
      expect(ripple.classList.contains('ripple')).toBe(true);
    });

    it('should position ripple at click location', () => {
      const button = document.createElement('button');
      button.className = 'btn';
      button.style.width = '200px';
      button.style.height = '50px';
      document.body.appendChild(button);

      // Mock getBoundingClientRect
      button.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 50,
      }));

      initInteractions();

      const clickEvent = new MouseEvent('click', {
        clientX: 50,
        clientY: 25,
        bubbles: true,
      });

      button.dispatchEvent(clickEvent);

      const ripple = button.querySelector('.ripple');
      expect(ripple).toBeTruthy();
      expect(ripple.style.left).toBeTruthy();
      expect(ripple.style.top).toBeTruthy();
    });

    it('should remove ripple after animation', () => {
      const button = document.createElement('button');
      button.className = 'btn';
      document.body.appendChild(button);

      initInteractions();

      button.dispatchEvent(
        new MouseEvent('click', {
          clientX: 100,
          clientY: 200,
          bubbles: true,
        })
      );

      const ripple = button.querySelector('.ripple');
      expect(ripple).toBeTruthy();

      // Fast-forward time
      vi.advanceTimersByTime(600);

      expect(button.querySelector('.ripple')).toBeNull();
    });

    it('should add ripple-magenta class for secondary buttons', () => {
      const button = document.createElement('button');
      button.className = 'btn btn-secondary';
      document.body.appendChild(button);

      button.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      }));

      initInteractions();

      button.dispatchEvent(
        new MouseEvent('click', {
          clientX: 50,
          clientY: 25,
          bubbles: true,
        })
      );

      const ripple = button.querySelector('.ripple');
      expect(ripple.classList.contains('ripple-magenta')).toBe(true);
    });

    it('should add ripple-green class for outline buttons', () => {
      const button = document.createElement('button');
      button.className = 'btn btn-outline';
      document.body.appendChild(button);

      button.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      }));

      initInteractions();

      button.dispatchEvent(
        new MouseEvent('click', {
          clientX: 50,
          clientY: 25,
          bubbles: true,
        })
      );

      const ripple = button.querySelector('.ripple');
      expect(ripple.classList.contains('ripple-green')).toBe(true);
    });

    it('should add ripple effect to service cards', () => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'service-card';
      document.body.appendChild(serviceCard);

      serviceCard.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 200,
      }));

      initInteractions();

      serviceCard.dispatchEvent(
        new MouseEvent('click', {
          clientX: 150,
          clientY: 100,
          bubbles: true,
        })
      );

      expect(serviceCard.classList.contains('ripple-container')).toBe(true);
      expect(serviceCard.querySelector('.ripple')).toBeTruthy();
    });

    it('should add ripple effect to project cards', () => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      document.body.appendChild(projectCard);

      projectCard.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
      }));

      initInteractions();

      projectCard.dispatchEvent(
        new MouseEvent('click', {
          clientX: 200,
          clientY: 150,
          bubbles: true,
        })
      );

      expect(projectCard.classList.contains('ripple-container')).toBe(true);
      expect(projectCard.querySelector('.ripple')).toBeTruthy();
    });

    it('should calculate ripple size from element dimensions', () => {
      const button = document.createElement('button');
      button.className = 'btn';
      button.style.width = '300px';
      button.style.height = '100px';
      document.body.appendChild(button);

      button.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 300,
        height: 100,
      }));

      initInteractions();

      button.dispatchEvent(
        new MouseEvent('click', {
          clientX: 150,
          clientY: 50,
          bubbles: true,
        })
      );

      const ripple = button.querySelector('.ripple');
      // Size should be max(width, height) = 300
      expect(ripple.style.width).toBe('300px');
      expect(ripple.style.height).toBe('300px');
    });
  });
});

