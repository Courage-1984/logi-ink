/**
 * Unit Tests for js/pages/projects.js
 * Tests project modal functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initProjects } from '../../../js/pages/projects.js';

describe('projects.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initProjects', () => {
    it('should initialize without errors', () => {
      expect(() => initProjects()).not.toThrow();
    });

    it('should open project modal on button click', () => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      projectCard.setAttribute('data-project-id', 'ecommerce-platform');

      const viewButton = document.createElement('button');
      viewButton.className = 'project-details-btn';
      projectCard.appendChild(viewButton);

      const modal = document.createElement('div');
      modal.id = 'project-modal';
      modal.className = 'project-modal';
      modal.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modal);
      document.body.appendChild(projectCard);

      initProjects();

      viewButton.click();

      expect(modal.classList.contains('active')).toBe(true);
      expect(modal.getAttribute('aria-hidden')).toBe('false');
    });

    it('should close modal on Escape key', () => {
      const modal = document.createElement('div');
      modal.id = 'project-modal';
      modal.className = 'project-modal active';
      modal.setAttribute('aria-hidden', 'false');
      document.body.appendChild(modal);

      initProjects();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(modal.classList.contains('active')).toBe(false);
      expect(modal.getAttribute('aria-hidden')).toBe('true');
    });

    it('should close modal on close button click', () => {
      const modal = document.createElement('div');
      modal.id = 'project-modal';
      modal.className = 'project-modal active';
      document.body.appendChild(modal);

      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      modal.appendChild(closeButton);

      initProjects();

      closeButton.click();

      expect(modal.classList.contains('active')).toBe(false);
    });

    it('should populate modal with project details', () => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      projectCard.setAttribute('data-project-id', 'ecommerce-platform');

      const viewButton = document.createElement('button');
      viewButton.className = 'project-details-btn';
      projectCard.appendChild(viewButton);

      const modal = document.createElement('div');
      modal.id = 'project-modal';
      document.body.appendChild(modal);

      const titleElement = document.createElement('h2');
      titleElement.className = 'project-modal-title';
      modal.appendChild(titleElement);

      document.body.appendChild(projectCard);

      initProjects();

      viewButton.click();

      expect(titleElement.textContent).toContain('E-Commerce Platform');
    });

    it('should handle missing modal gracefully', () => {
      expect(() => initProjects()).not.toThrow();
    });

    it('should prevent body scroll when modal is open', () => {
      const modal = document.createElement('div');
      modal.id = 'project-modal';
      document.body.appendChild(modal);

      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      projectCard.setAttribute('data-project-id', 'ecommerce-platform');
      const viewButton = document.createElement('button');
      viewButton.className = 'project-details-btn';
      projectCard.appendChild(viewButton);
      document.body.appendChild(projectCard);

      initProjects();

      viewButton.click();

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal closes', () => {
      const modal = document.createElement('div');
      modal.id = 'project-modal';
      modal.className = 'project-modal active';
      document.body.style.overflow = 'hidden';
      document.body.appendChild(modal);

      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      modal.appendChild(closeButton);

      initProjects();

      closeButton.click();

      expect(document.body.style.overflow).toBe('');
    });
  });
});

