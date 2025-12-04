/**
 * Page Transitions Module
 * Handles smooth fade in/out transitions when navigating between pages
 */

const TRANSITION_STORAGE_KEY = 'logiInk:pendingTransition';
const TRANSITION_DURATION = 400;
const TRANSITION_CLEANUP_DELAY = 600;

function setTransitionFlag() {
  try {
    sessionStorage.setItem(TRANSITION_STORAGE_KEY, '1');
  } catch (error) {
    // Ignore storage errors (e.g., Safari private mode)
  }
}

function clearTransitionFlag() {
  try {
    sessionStorage.removeItem(TRANSITION_STORAGE_KEY);
  } catch (error) {
    // Ignore storage errors
  }
}

function hasPendingTransition() {
  try {
    return sessionStorage.getItem(TRANSITION_STORAGE_KEY) === '1';
  } catch (error) {
    return false;
  }
}

function handleIncomingTransition() {
  const root = document.documentElement;
  const shouldAnimate = root.classList.contains('page-transition-preload') || hasPendingTransition();

  if (!shouldAnimate) {
    return;
  }

  clearTransitionFlag();

  requestAnimationFrame(() => {
    document.body.classList.add('page-transition-in');
    root.classList.remove('page-transition-preload');

    setTimeout(() => {
      document.body.classList.remove('page-transition-in');
    }, TRANSITION_CLEANUP_DELAY);
  });
}

export function initPageTransitions() {
  handleIncomingTransition();

  // Cache selector to avoid repeated queries
  const links = document.querySelectorAll('a[href]');

  // Handle navigation clicks (all internal links, not just .html)
  links.forEach(link => {
    const href = link.getAttribute('href') || '';

    // Skip external links, anchors, downloads, or custom targets
    if (link.hostname && link.hostname !== window.location.hostname && link.hostname !== '') {
      return;
    }
    if (href.startsWith('#') || link.hasAttribute('download')) {
      return;
    }
    if (link.getAttribute('target') && link.getAttribute('target') !== '_self') {
      return;
    }
    // Skip asset links (CSS, JS, images, etc.)
    if (href.startsWith('/assets/') || href.includes('.')) {
      return;
    }

    link.addEventListener('click', event => {
      // Get current path (clean URL)
      let currentPath = window.location.pathname.split('/').pop() || '';
      if (currentPath.endsWith('.html')) {
        currentPath = currentPath.replace('.html', '');
      }
      if (currentPath === '') {
        currentPath = '/';
      }

      // Normalize href for comparison
      let normalizedHref = href;
      if (normalizedHref.endsWith('.html')) {
        normalizedHref = normalizedHref.replace('.html', '');
      }
      if (normalizedHref === '' || normalizedHref === 'index.html') {
        normalizedHref = '/';
      }

      // Skip modified clicks, middle clicks, or same-page navigation
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        normalizedHref === currentPath ||
        (normalizedHref === '/' && currentPath === '/')
      ) {
        return;
      }

      event.preventDefault();

      setTransitionFlag();
      document.body.classList.add('page-transition-out');

      setTimeout(() => {
        window.location.href = href;
      }, TRANSITION_DURATION);
    });
  });

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-transition-out');
    handleIncomingTransition();
  });
}
