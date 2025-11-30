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
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Remove active class first
      link.classList.remove('active');

      // Check if this link matches the current page
      if (href === currentPage || (currentPage === '' && (href === 'index.html' || href === '/'))) {
        link.classList.add('active');
      }
    });
  };

  // Active nav link highlighting based on scroll position with scroll-based color change
  // This only updates the scroll progress for the already-active link
  const sections = document.querySelectorAll('section[id]');
  const navLinks2 = document.querySelectorAll('.nav-link');

  const updateActiveNavLink = () => {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;
    let current = '';
    let activeSection = null;
    let sectionScrollProgress = 0;

    // Find the current active section
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionBottom = sectionTop + sectionHeight;

      // Check if section is in viewport
      if (scrollPosition >= sectionTop - 200 && scrollPosition < sectionBottom) {
        current = section.getAttribute('id');
        activeSection = section;

        // Calculate scroll progress within the active section
        // Progress goes from 0% when section enters viewport to 100% when fully scrolled
        const sectionStart = Math.max(0, sectionTop - 200);
        const sectionEnd = sectionBottom;
        const sectionRange = sectionEnd - sectionStart;

        if (sectionRange > 0) {
          const scrolledInSection = Math.max(0, scrollPosition - sectionStart);
          sectionScrollProgress = Math.min(100, (scrolledInSection / sectionRange) * 100);
        }
      }
    });

    // Handle home page (when at top of page)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isHomePage = currentPage === 'index.html' || currentPage === '';

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
        const href = link.getAttribute('href');
        const isHomeLink =
          href === 'index.html' ||
          href === '/' ||
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

  // Add to scroll manager (already uses requestAnimationFrame)
  addScrollHandler(updateActiveNavLink);
  // Initial call for scroll progress
  updateActiveNavLink();
}
