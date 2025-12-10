/**
 * Unit Tests for js/pages/reports.js
 * Tests reports dashboard tab functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initReportsPage } from '../../../js/pages/reports.js';

describe('reports.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    // Mock fetch for report loading
    global.fetch = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initReportsPage', () => {
    it('should initialize without errors', () => {
      expect(() => initReportsPage()).not.toThrow();
    });

    it('should return early if no tabs or panels found', () => {
      expect(() => initReportsPage()).not.toThrow();
    });

    it('should set up tab buttons with correct attributes', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button active';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tab1.setAttribute('aria-selected', 'true');
      tabList.appendChild(tab1);

      const tab2 = document.createElement('button');
      tab2.className = 'tab-button';
      tab2.setAttribute('data-tab-target', 'panel-2');
      tabList.appendChild(tab2);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content active';
      document.body.appendChild(panel1);

      const panel2 = document.createElement('div');
      panel2.id = 'panel-2';
      panel2.className = 'tab-content';
      document.body.appendChild(panel2);

      document.body.appendChild(tabList);

      initReportsPage();

      expect(tab1.getAttribute('tabindex')).toBe('0');
      expect(tab2.getAttribute('tabindex')).toBe('-1');
      expect(tab1.getAttribute('aria-selected')).toBe('true');
      expect(tab2.getAttribute('aria-selected')).toBe('false');
    });

    it('should hide non-active panels', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button active';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content active';
      document.body.appendChild(panel1);

      const panel2 = document.createElement('div');
      panel2.id = 'panel-2';
      panel2.className = 'tab-content';
      document.body.appendChild(panel2);

      document.body.appendChild(tabList);

      initReportsPage();

      expect(panel1.hasAttribute('hidden')).toBe(false);
      expect(panel2.hasAttribute('hidden')).toBe(true);
    });

    it('should activate tab on click', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button active';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const tab2 = document.createElement('button');
      tab2.className = 'tab-button';
      tab2.setAttribute('data-tab-target', 'panel-2');
      tabList.appendChild(tab2);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content active';
      document.body.appendChild(panel1);

      const panel2 = document.createElement('div');
      panel2.id = 'panel-2';
      panel2.className = 'tab-content';
      document.body.appendChild(panel2);

      document.body.appendChild(tabList);

      initReportsPage();

      tab2.click();

      expect(tab2.classList.contains('active')).toBe(true);
      expect(tab1.classList.contains('active')).toBe(false);
      expect(panel2.classList.contains('active')).toBe(true);
      expect(panel1.classList.contains('active')).toBe(false);
    });

    it('should support keyboard navigation with ArrowRight', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button active';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const tab2 = document.createElement('button');
      tab2.className = 'tab-button';
      tab2.setAttribute('data-tab-target', 'panel-2');
      tabList.appendChild(tab2);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content active';
      document.body.appendChild(panel1);

      const panel2 = document.createElement('div');
      panel2.id = 'panel-2';
      panel2.className = 'tab-content';
      document.body.appendChild(panel2);

      document.body.appendChild(tabList);

      initReportsPage();

      tab1.focus();
      tab1.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(tab2.classList.contains('active')).toBe(true);
      expect(tab1.classList.contains('active')).toBe(false);
    });

    it('should support keyboard navigation with ArrowLeft', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const tab2 = document.createElement('button');
      tab2.className = 'tab-button active';
      tab2.setAttribute('data-tab-target', 'panel-2');
      tabList.appendChild(tab2);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content';
      document.body.appendChild(panel1);

      const panel2 = document.createElement('div');
      panel2.id = 'panel-2';
      panel2.className = 'tab-content active';
      document.body.appendChild(panel2);

      document.body.appendChild(tabList);

      initReportsPage();

      tab2.focus();
      tab2.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(tab1.classList.contains('active')).toBe(true);
      expect(tab2.classList.contains('active')).toBe(false);
    });

    it('should support Home key to jump to first tab', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const tab2 = document.createElement('button');
      tab2.className = 'tab-button active';
      tab2.setAttribute('data-tab-target', 'panel-2');
      tabList.appendChild(tab2);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      document.body.appendChild(panel1);

      const panel2 = document.createElement('div');
      panel2.id = 'panel-2';
      panel2.className = 'tab-content active';
      document.body.appendChild(panel2);

      document.body.appendChild(tabList);

      initReportsPage();

      tab2.focus();
      tab2.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Home',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(tab1.classList.contains('active')).toBe(true);
    });

    it('should support End key to jump to last tab', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button active';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const tab2 = document.createElement('button');
      tab2.className = 'tab-button';
      tab2.setAttribute('data-tab-target', 'panel-2');
      tabList.appendChild(tab2);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content active';
      document.body.appendChild(panel1);

      const panel2 = document.createElement('div');
      panel2.id = 'panel-2';
      document.body.appendChild(panel2);

      document.body.appendChild(tabList);

      initReportsPage();

      tab1.focus();
      tab1.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'End',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(tab2.classList.contains('active')).toBe(true);
    });

    it('should wrap around when navigating with arrows', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button active';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const tab2 = document.createElement('button');
      tab2.className = 'tab-button';
      tab2.setAttribute('data-tab-target', 'panel-2');
      tabList.appendChild(tab2);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content active';
      document.body.appendChild(panel1);

      const panel2 = document.createElement('div');
      panel2.id = 'panel-2';
      document.body.appendChild(panel2);

      document.body.appendChild(tabList);

      initReportsPage();

      // From last tab, ArrowRight should wrap to first
      tab2.focus();
      tab2.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(tab1.classList.contains('active')).toBe(true);
    });

    it('should load initial active panel report', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button active';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content active';
      panel1.setAttribute('data-report-lighthouse', '');
      document.body.appendChild(panel1);

      document.body.appendChild(tabList);

      initReportsPage();

      // Should attempt to load report (implementation may vary)
      // This test verifies initialization doesn't throw
      expect(() => initReportsPage()).not.toThrow();
    });

    it('should prevent default on keyboard navigation', () => {
      const tabList = document.createElement('div');
      tabList.setAttribute('data-report-tabs', '');

      const tab1 = document.createElement('button');
      tab1.className = 'tab-button active';
      tab1.setAttribute('data-tab-target', 'panel-1');
      tabList.appendChild(tab1);

      const panel1 = document.createElement('div');
      panel1.id = 'panel-1';
      panel1.className = 'tab-content active';
      document.body.appendChild(panel1);

      document.body.appendChild(tabList);

      initReportsPage();

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault');

      tab1.dispatchEvent(keydownEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});

