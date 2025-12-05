/**
 * Navigation Module
 * Handles navbar scroll effects and mobile menu toggle
 */

import { addScrollHandler } from './scroll-manager.js';

export function initNavigation() {
  // Apply Orbitron font to logo after it loads (prevents render blocking)
  const applyLogoFont = () => {
    const logoText = document.querySelector('.logo-text');
    if (!logoText) return;

    // Check if Orbitron font is loaded using Font Loading API
    if ('fonts' in document) {
      // Wait for fonts to be ready, then check if Orbitron is loaded
      document.fonts.ready.then(() => {
        // Check if Orbitron Black (900 weight) is loaded
        if (document.fonts.check('900 1rem "Orbitron"')) {
          logoText.classList.add('fonts-loaded');
        }
      });

      // Also try direct check after a short delay (font might load before ready fires)
      setTimeout(() => {
        if (document.fonts.check('900 1rem "Orbitron"')) {
          logoText.classList.add('fonts-loaded');
        }
      }, 100);
    } else {
      // Fallback: wait a bit then apply (for browsers without Font Loading API)
      setTimeout(() => {
        logoText.classList.add('fonts-loaded');
      }, 200);
    }
  };

  // Apply font immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLogoFont);
  } else {
    applyLogoFont();
  }

  // Navigation Scroll Effect
  const navbarScrollHandler = () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  addScrollHandler(navbarScrollHandler);

  // Mobile Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isActive = hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');

      // Update ARIA attributes for accessibility
      hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      navMenu.setAttribute('aria-hidden', isActive ? 'false' : 'true');

      // Trap focus when menu is open
      if (isActive) {
        navMenu.setAttribute('tabindex', '-1');
        const firstLink = navMenu.querySelector('.nav-link');
        if (firstLink) {
          firstLink.focus();
        }
      } else {
        navMenu.removeAttribute('tabindex');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Allow all nav links (including dropdown parents) to navigate
        // Dropdown parent links now navigate to their href (e.g., services.html)
        // Dropdown menu still works on hover (desktop) via CSS

        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        // Update ARIA attributes
        hamburger.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');
        navMenu.removeAttribute('tabindex');
      });
    });
  }

  // Dropdown Menu Toggle (Desktop & Mobile)
  // Note: Dropdown parent links now navigate on click (e.g., Services -> services.html)
  // Dropdown menu is shown on hover (desktop) via CSS
  // On mobile, the dropdown can be accessed via the dropdown links themselves
  const dropdownItems = document.querySelectorAll('.nav-item-dropdown');
  // Dropdown functionality is handled by CSS hover on desktop
  // No additional JavaScript needed - parent link navigates, dropdown shows on hover

  // Set active nav link based on current page
  const setActiveNavLinkByPage = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    // Get current page path (clean URL, no .html extension)
    const pathname = window.location.pathname;
    let currentPage = pathname.split('/').pop() || '';

    // Normalize: remove .html if present, handle empty as home
    if (currentPage.endsWith('.html')) {
      currentPage = currentPage.replace('.html', '');
    }
    if (currentPage === '' || currentPage === 'index') {
      currentPage = '/';
    }

    // Also check full pathname for exact matches
    const normalizedPathname = pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';

    // Normalize currentPage for use throughout this function
    let normalizedCurrentPage = currentPage;
    if (normalizedCurrentPage !== '/' && normalizedCurrentPage.startsWith('/')) {
      normalizedCurrentPage = normalizedCurrentPage.substring(1);
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      // Remove active class first
      link.classList.remove('active');

      // Normalize href for comparison (remove .html if present, handle leading slash)
      let normalizedHref = href;
      if (normalizedHref.endsWith('.html')) {
        normalizedHref = normalizedHref.replace('.html', '');
      }
      if (normalizedHref === '' || normalizedHref === 'index' || normalizedHref === 'index.html') {
        normalizedHref = '/';
      }
      // Remove leading slash for comparison if not root
      if (normalizedHref !== '/' && normalizedHref.startsWith('/')) {
        normalizedHref = normalizedHref.substring(1);
      }

      // Check if this link matches the current page
      // Match exact path, or if both are root
      const hrefMatches =
        normalizedHref === normalizedCurrentPage ||
        (normalizedHref === '/' && normalizedCurrentPage === '/') ||
        (normalizedHref === '/' && currentPage === '/') ||
        (normalizedHref === currentPage) ||
        (normalizedPathname === href || normalizedPathname === normalizedHref) ||
        (pathname === href);

      if (hrefMatches) {
        link.classList.add('active');
        // Also mark parent dropdown as active if this is a dropdown link
        const dropdownItem = link.closest('.nav-item-dropdown');
        if (dropdownItem) {
          dropdownItem.classList.add('active');
        }
      }
    });

    // Special handling for Services dropdown: mark Services link as active if on services page or any child page
    const servicesPages = ['services', 'pricing', 'seo-services'];
    const isOnServicesPage = servicesPages.some(page => {
      const normalized = normalizedPathname.replace(/^\//, '');
      return normalized === page || currentPage === page || normalizedCurrentPage === page;
    });

    if (isOnServicesPage) {
      const servicesLink = document.querySelector('.nav-item-dropdown > .nav-link[href="/services"]');
      const servicesDropdown = document.querySelector('.nav-item-dropdown');
      if (servicesLink) {
        servicesLink.classList.add('active');
      }
      if (servicesDropdown) {
        servicesDropdown.classList.add('active');
      }

      // Mark the specific dropdown link as active
      const dropdownLinks = document.querySelectorAll('.dropdown-link');
      dropdownLinks.forEach(dropdownLink => {
        dropdownLink.classList.remove('active');
        const href = dropdownLink.getAttribute('href') || '';

        // Normalize href for comparison
        let normalizedHref = href;
        if (normalizedHref.endsWith('.html')) {
          normalizedHref = normalizedHref.replace('.html', '');
        }
        if (normalizedHref.startsWith('/')) {
          normalizedHref = normalizedHref.substring(1);
        }

        // Check if this dropdown link matches the current page
        const matchesCurrentPage =
          normalizedHref === currentPage ||
          normalizedHref === normalizedCurrentPage ||
          normalizedHref === normalizedPathname.replace(/^\//, '') ||
          normalizedPathname === href ||
          pathname === href ||
          (normalizedHref === 'services' && (currentPage === 'services' || normalizedCurrentPage === 'services'));

        if (matchesCurrentPage) {
          dropdownLink.classList.add('active');
        }
      });
    }
  };

  // Active nav link highlighting based on scroll position with scroll-based color change
  // This only updates the scroll progress for the already-active link
  const sections = document.querySelectorAll('section[id]');
  const navLinks2 = document.querySelectorAll('.nav-link');

  // Cache section positions to avoid forced reflows
  let sectionPositions = [];
  let cachedWindowHeight = window.innerHeight;

  const updateSectionPositions = () => {
    sectionPositions = Array.from(sections).map(section => ({
      id: section.getAttribute('id'),
      top: section.offsetTop,
      height: section.clientHeight,
      bottom: section.offsetTop + section.clientHeight,
      element: section,
    }));
    cachedWindowHeight = window.innerHeight;
  };

  // Initial cache
  updateSectionPositions();

  // Recalculate on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSectionPositions, 100);
  });

  const updateActiveNavLink = () => {
    const scrollPosition = window.pageYOffset;
    const windowHeight = cachedWindowHeight;
    let current = '';
    let activeSection = null;
    let sectionScrollProgress = 0;

    // Find the current active section using cached positions
    sectionPositions.forEach(({ id, top, height, bottom, element }) => {
      const sectionBottom = bottom;

      // Check if section is in viewport
      if (scrollPosition >= top - 200 && scrollPosition < sectionBottom) {
        current = id;
        activeSection = element;

        // Calculate scroll progress within the active section
        // Progress goes from 0% when section enters viewport to 100% when fully scrolled
        const sectionStart = Math.max(0, top - 200);
        const sectionEnd = sectionBottom;
        const sectionRange = sectionEnd - sectionStart;

        if (sectionRange > 0) {
          const scrolledInSection = Math.max(0, scrollPosition - sectionStart);
          sectionScrollProgress = Math.min(100, (scrolledInSection / sectionRange) * 100);
        }
      }
    });

    // Handle home page (when at top of page)
    let currentPage = window.location.pathname.split('/').pop() || '';
    // Normalize: remove .html if present
    if (currentPage.endsWith('.html')) {
      currentPage = currentPage.replace('.html', '');
    }
    const isHomePage = currentPage === '' || currentPage === 'index';

    if (isHomePage && scrollPosition < 100 && !current) {
      // Use overall page scroll progress for home
      const documentHeight = document.documentElement.scrollHeight;
      const totalScrollRange = documentHeight - windowHeight;
      if (totalScrollRange > 0) {
        sectionScrollProgress = Math.min(100, (scrollPosition / totalScrollRange) * 100);
      }
    }

    // Update scroll progress for active nav link
    navLinks2.forEach(link => {
      // Remove scroll progress style
      link.style.setProperty('--scroll-progress', '0%');

      // Only update scroll progress if this link is active
      if (link.classList.contains('active')) {
        const href = link.getAttribute('href') || '';
        const normalizedHref = href.replace('.html', '') || '/';
        const isHomeLink =
          normalizedHref === '/' ||
          normalizedHref === 'index' ||
          (link.textContent && link.textContent.trim().toLowerCase() === 'home');

        // Update scroll progress for home page or section links
        if (
          href === `#${current}` ||
          (isHomeLink && isHomePage && scrollPosition < 100 && !current)
        ) {
          // Apply scroll-based color change from left to right (#ed12ff to cyan)
          link.style.setProperty('--scroll-progress', `${sectionScrollProgress}%`);
        }
      }
    });
  };

  // Set active link based on current page on load
  setActiveNavLinkByPage();

  // Re-check active states after navigation (for SPA-like behavior)
  window.addEventListener('popstate', () => {
    setActiveNavLinkByPage();
  });

  // Also check on hash change (for anchor links)
  window.addEventListener('hashchange', () => {
    setActiveNavLinkByPage();
  });

  // Add to scroll manager (already uses requestAnimationFrame)
  addScrollHandler(updateActiveNavLink);
  // Initial call for scroll progress
  updateActiveNavLink();
}
