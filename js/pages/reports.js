/**
 * Reports Page Module
 * Handles tab interactions and lazy-loading of CI report artefacts.
 * Inputs: tab buttons with data-tab-target and panels with data-report-* attributes.
 * Outputs: Embeds iframe or JSON content on demand, exposes retry handling for missing reports.
 */

const TAB_LIST_SELECTOR = '[data-report-tabs] .tab-button';
const PANEL_SELECTOR = '.tab-content';
const ACTIVE_CLASS = 'active';
const PLACEHOLDER_HIDDEN = 'report-placeholder--hidden';
const PLACEHOLDER_ERROR = 'report-placeholder--error';

/**
 * Entry point for the reports page.
 */
export function initReportsPage() {
  const tabButtons = Array.from(document.querySelectorAll(TAB_LIST_SELECTOR));
  const panels = Array.from(document.querySelectorAll(PANEL_SELECTOR));

  if (!tabButtons.length || !panels.length) {
    return;
  }

  // Normalise aria attributes and hook listeners
  tabButtons.forEach((button, index) => {
    button.setAttribute('tabindex', button.classList.contains(ACTIVE_CLASS) ? '0' : '-1');
    button.addEventListener('click', () => activateTab(button, tabButtons, panels, false));
    button.addEventListener('keydown', event => handleTabKeydown(event, index, tabButtons, panels));
  });

  // Hide non-active panels from assistive tech by default
  panels.forEach(panel => {
    if (!panel.classList.contains(ACTIVE_CLASS)) {
      panel.setAttribute('hidden', 'hidden');
    }
    attachRetryHandler(panel);
    attachCopyHandler(panel);
  });

  const initialPanel = panels.find(panel => panel.classList.contains(ACTIVE_CLASS));
  if (initialPanel) {
    void loadReport(initialPanel);
  }
}

function activateTab(targetButton, buttons, panels, shouldFocus = true) {
  const targetId = targetButton.dataset.tabTarget;
  const targetPanel = document.getElementById(targetId);
  if (!targetPanel) {
    return;
  }

  buttons.forEach(button => {
    button.classList.remove(ACTIVE_CLASS);
    button.setAttribute('aria-selected', 'false');
    button.setAttribute('tabindex', '-1');
  });

  panels.forEach(panel => {
    panel.classList.remove(ACTIVE_CLASS);
    panel.setAttribute('hidden', 'hidden');
  });

  targetButton.classList.add(ACTIVE_CLASS);
  targetButton.setAttribute('aria-selected', 'true');
  targetButton.setAttribute('tabindex', '0');
  if (shouldFocus) {
    targetButton.focus();
  }

  targetPanel.classList.add(ACTIVE_CLASS);
  targetPanel.removeAttribute('hidden');

  void loadReport(targetPanel);
}

function handleTabKeydown(event, currentIndex, buttons, panels) {
  const { key } = event;
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
    return;
  }

  event.preventDefault();

  let nextIndex = currentIndex;
  if (key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % buttons.length;
  } else if (key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
  } else if (key === 'Home') {
    nextIndex = 0;
  } else if (key === 'End') {
    nextIndex = buttons.length - 1;
  }

  const nextButton = buttons[nextIndex];
  if (nextButton) {
    activateTab(nextButton, buttons, panels);
  }
}

function attachRetryHandler(panel) {
  const retryButton = panel.querySelector('[data-report-retry]');
  if (!retryButton) {
    return;
  }

  retryButton.addEventListener('click', () => {
    const placeholder = panel.querySelector('.report-placeholder');
    const hintElement = panel.querySelector('.report-placeholder__hint');
    placeholder?.classList.remove(PLACEHOLDER_ERROR);
    if (hintElement && panel.dataset.reportHint) {
      hintElement.textContent = `${panel.dataset.reportHint} (retrying...)`;
    }
    panel.dataset.loaded = '';
    retryButton.setAttribute('hidden', 'hidden');
    void loadReport(panel);
  });
}

function attachCopyHandler(panel) {
  const copyButton = panel.querySelector('[data-report-copy]');
  const output = panel.querySelector('.report-json');

  if (!copyButton || !output) {
    return;
  }

  copyButton.addEventListener('click', async () => {
    if (!output.textContent) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output.textContent);
      copyButton.textContent = 'Copied!';
      copyButton.classList.add('btn-primary');
      setTimeout(() => {
        copyButton.textContent = 'Copy JSON';
        copyButton.classList.remove('btn-primary');
      }, 1500);
    } catch (error) {
      console.warn('Failed to copy JSON to clipboard', error);
      copyButton.textContent = 'Copy failed';
      copyButton.classList.add('btn-outline');
    }
  });
}

async function loadReport(panel) {
  if (!panel || panel.dataset.loaded === 'true' || panel.dataset.loading === 'true') {
    return;
  }

  const src = panel.dataset.reportSrc;
  const type = panel.dataset.reportType || 'iframe';
  const placeholder = panel.querySelector('.report-placeholder');
  const hintElement = panel.querySelector('.report-placeholder__hint');
  const retryButton = panel.querySelector('[data-report-retry]');
  const frame = panel.querySelector('.report-frame');
  const jsonOutput = panel.querySelector('.report-json');
  const copyButton = panel.querySelector('[data-report-copy]');

  if (!src) {
    return;
  }

  panel.dataset.loading = 'true';
  placeholder?.classList.remove(PLACEHOLDER_HIDDEN, PLACEHOLDER_ERROR);
  placeholder?.setAttribute('aria-hidden', 'false');

  try {
    const response = await fetch(src, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (type === 'iframe' && frame) {
      frame.src = src;
      frame.hidden = false;
    } else if (type === 'json' && jsonOutput) {
      const data = await response.json();
      jsonOutput.textContent = JSON.stringify(data, null, 2);
      jsonOutput.hidden = false;
      if (copyButton) {
        copyButton.hidden = false;
      }
    }

    placeholder?.classList.add(PLACEHOLDER_HIDDEN);
    placeholder?.setAttribute('aria-hidden', 'true');
    panel.dataset.loaded = 'true';
  } catch (error) {
    placeholder?.classList.remove(PLACEHOLDER_HIDDEN);
    placeholder?.classList.add(PLACEHOLDER_ERROR);
    placeholder?.setAttribute('aria-hidden', 'false');
    if (hintElement) {
      const baseHint = panel.dataset.reportHint || 'Report unavailable. Generate the artefact and try again.';
      hintElement.textContent = `${baseHint} (${error.message})`;
    }
    retryButton?.removeAttribute('hidden');
  } finally {
    panel.dataset.loading = 'false';
  }
}
