/**
 * Page Transitions Module
 * Handles smooth fade in/out transitions when navigating between pages
 */

export function initPageTransitions() {
  // Add fade-in class to body on page load
  document.body.classList.add('page-transition-in');

  // Remove fade-in class after animation completes
  setTimeout(() => {
    document.body.classList.remove('page-transition-in');
  }, 500);

  // Handle navigation clicks
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    // Skip external links and anchor links
    if (link.hostname && link.hostname !== window.location.hostname && link.hostname !== '') {
      return;
    }
    if (link.getAttribute('href').startsWith('#')) {
      return;
    }

    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';

      // Skip if it's the same page
      if (href === currentPath || (href === 'index.html' && currentPath === '')) {
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      // Add fade-out class
      document.body.classList.add('page-transition-out');

      // After fade-out animation, allow navigation
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });
  });
}
