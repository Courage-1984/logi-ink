/**
 * Page Transitions Module
 * View Transitions API is enabled via CSS @view-transition { navigation: auto; }
 * The browser automatically handles smooth transitions between pages.
 *
 * CRITICAL: This module excludes navbar from View Transition snapshots to prevent
 * navbar flash during navigation. Based on MDN View Transition API documentation:
 * https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using
 */
export function initPageTransitions() {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    // pageswap: Fired when document is about to be unloaded (old page)
    // Exclude navbar from snapshot by setting view-transition-name: none BEFORE snapshot
    window.addEventListener('pageswap', async (event) => {
      if (!event.viewTransition) return;

      const navbar = document.querySelector('.navbar');
      if (navbar) {
        // CRITICAL: Exclude navbar from root snapshot by setting view-transition-name: none
        // This prevents the old page's navbar (with active states) from appearing in the transition
        navbar.style.viewTransitionName = 'none';
        console.log('[PAGESWAP] Excluded navbar from transition snapshot');

        // Remove view-transition-name after snapshot is captured to prevent bfcache persistence
        // MDN: "If we left them set, they would persist in the page state saved in bfcache"
        await event.viewTransition.ready; // Wait for snapshot to be captured
        navbar.style.viewTransitionName = '';
        console.log('[PAGESWAP] Cleared view-transition-name after snapshot');
      }
    });

    // pagereveal: Fired when new page is first rendered (new page)
    // Clear navbar states and exclude navbar from snapshot
    window.addEventListener('pagereveal', async (event) => {
      if (!event.viewTransition) return;

      const navbar = document.querySelector('.navbar');
      const navLinks = document.querySelectorAll('.nav-link');

      if (navbar) {
        // Exclude navbar from new page snapshot too
        navbar.style.viewTransitionName = 'none';

        // Clear all navbar states
        navbar.classList.remove('nav-initialized');
        navbar.style.visibility = 'hidden';
        navbar.style.opacity = '0';
      }

      // Clear all link states
      navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('data-active-initialized');
        link.removeAttribute('data-nav-initialized');
      });

      // Remove view-transition-name after snapshot is captured
      await event.viewTransition.ready;
      if (navbar) {
        navbar.style.viewTransitionName = '';
      }

      console.log('[PAGEREVEAL] Navbar excluded from transition, states cleared');
    });
  }

  // Note: The browser handles navigation automatically with View Transitions API
  // when @view-transition { navigation: auto; } is set in CSS
}
