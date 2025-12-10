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

  if (!hamburger) {
    console.warn('Navigation: Hamburger button not found');
  }
  if (!navMenu) {
    console.warn('Navigation: Nav menu not found');
  }

  if (hamburger && navMenu) {
    // Ensure menu is initially hidden on mobile
    const isMobile = window.innerWidth <= 767;
    if (isMobile) {
      navMenu.classList.remove('active');
      navMenu.setAttribute('aria-hidden', 'true');
      // Force initial hidden state
      navMenu.style.left = '-100%';
    }

    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isActive = hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');

      // Force visibility on mobile when active - use requestAnimationFrame to ensure DOM update
      if (isActive && window.innerWidth <= 767) {
        // Immediately set styles, then use requestAnimationFrame for final polish
        navMenu.style.display = 'flex';
        navMenu.style.visibility = 'visible';
        navMenu.style.opacity = '1';
        navMenu.style.left = '0';
        navMenu.style.position = 'fixed';
        navMenu.style.zIndex = '99999';
        navMenu.style.width = '100vw';
        navMenu.style.top = '70px';
        navMenu.style.height = 'calc(100vh - 70px)';
        navMenu.style.background = 'var(--bg-primary)';
        navMenu.style.pointerEvents = 'auto';

        requestAnimationFrame(() => {
          // Force a reflow to ensure styles are applied
          navMenu.offsetHeight;
          // Debug log
          console.log('Mobile menu opened:', {
            left: window.getComputedStyle(navMenu).left,
            display: window.getComputedStyle(navMenu).display,
            visibility: window.getComputedStyle(navMenu).visibility,
            zIndex: window.getComputedStyle(navMenu).zIndex,
            opacity: window.getComputedStyle(navMenu).opacity
          });
        });
      } else if (!isActive && window.innerWidth <= 767) {
        requestAnimationFrame(() => {
          navMenu.style.left = '-100%';
          // Don't reset other styles immediately - let transition complete
          setTimeout(() => {
            navMenu.style.display = '';
            navMenu.style.visibility = '';
            navMenu.style.opacity = '';
            navMenu.style.position = '';
            navMenu.style.zIndex = '';
            navMenu.style.width = '';
            navMenu.style.top = '';
            navMenu.style.height = '';
          }, 300);
        });
      }

      // Update ARIA attributes for accessibility
      hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      navMenu.setAttribute('aria-hidden', isActive ? 'false' : 'true');

      // Prevent body scroll when menu is open on mobile
      if (isActive && window.innerWidth <= 767) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      // Trap focus when menu is open
      if (isActive) {
        navMenu.setAttribute('tabindex', '-1');
        // Small delay to ensure menu is visible before focusing
        setTimeout(() => {
          const firstLink = navMenu.querySelector('.nav-link');
          if (firstLink) {
            firstLink.focus();
          }
        }, 100);
      } else {
        navMenu.removeAttribute('tabindex');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Check if this is a dropdown parent link on mobile
        const dropdownItem = link.closest('.nav-item-dropdown');
        const isMobile = window.innerWidth <= 767;

        if (dropdownItem && isMobile) {
          // On mobile, toggle dropdown instead of navigating
          e.preventDefault();
          e.stopPropagation();

          // Close other dropdowns
          document.querySelectorAll('.nav-item-dropdown').forEach(item => {
            if (item !== dropdownItem) {
              item.classList.remove('active');
            }
          });

          // Toggle this dropdown
          const isDropdownActive = dropdownItem.classList.toggle('active');

          // Update ARIA attributes for dropdown
          const dropdownLink = dropdownItem.querySelector('.nav-link');
          if (dropdownLink) {
            dropdownLink.setAttribute('aria-expanded', isDropdownActive ? 'true' : 'false');
          }

          return;
        }

        // For non-dropdown links or desktop, navigate normally
        // Only close menu on mobile
        if (isMobile) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
          // Reset inline styles
          navMenu.style.display = '';
          navMenu.style.visibility = '';
          navMenu.style.opacity = '';
          navMenu.style.left = '';
          // Update ARIA attributes
          hamburger.setAttribute('aria-expanded', 'false');
          navMenu.setAttribute('aria-hidden', 'true');
          navMenu.removeAttribute('tabindex');
          // Restore body scroll
          document.body.style.overflow = '';
        }
      });
    });
  }

  // Dropdown Menu Toggle (Desktop & Mobile)
  // Desktop: Dropdown shows on hover via CSS
  // Mobile: Dropdown toggles on click (handled above in navLinks click handler)
  const dropdownItems = document.querySelectorAll('.nav-item-dropdown');

  // Store original parent for each dropdown menu (to restore later)
  const dropdownParents = new Map();

  // Move dropdown to body to escape navbar stacking context
  const moveDropdownToBody = (dropdownMenu, dropdownItem) => {
    if (!dropdownMenu || !dropdownItem) return;

    // Store original parent if not already stored
    if (!dropdownParents.has(dropdownMenu)) {
      dropdownParents.set(dropdownMenu, dropdownMenu.parentElement);
    }

    // Only move if not already in body
    if (dropdownMenu.parentElement !== document.body) {
      document.body.appendChild(dropdownMenu);
    }
  };

  // Restore dropdown to original parent
  const restoreDropdownToParent = (dropdownMenu) => {
    if (!dropdownMenu) return;

    const originalParent = dropdownParents.get(dropdownMenu);
    if (originalParent && dropdownMenu.parentElement === document.body) {
      originalParent.appendChild(dropdownMenu);
    }
  };

  // Position dropdown menu dynamically (for fixed positioning)
  const positionDropdown = (dropdownItem) => {
    const dropdownMenu = dropdownItem.querySelector('.dropdown-menu');
    if (!dropdownMenu) return;

    const link = dropdownItem.querySelector('.nav-link');
    if (!link) return;

    // Only move dropdown to body on desktop - keep in nav-menu on mobile
    if (window.innerWidth > 767) {
      moveDropdownToBody(dropdownMenu, dropdownItem);
      const linkRect = link.getBoundingClientRect();
      dropdownMenu.style.top = `${linkRect.bottom + 4}px`; // 4px = margin-top: 0.25rem
      dropdownMenu.style.left = `${linkRect.left}px`;
    } else {
      // On mobile, ensure dropdown stays in nav-menu
      restoreDropdownToParent(dropdownMenu);
    }
  };

  // Update dropdown positions on hover (desktop) and when active (mobile)
  dropdownItems.forEach(item => {
    const dropdownMenu = item.querySelector('.dropdown-menu');
    if (!dropdownMenu) return;

    let hoverTimeout;

    // Desktop: Show dropdown on hover and move to body
    item.addEventListener('mouseenter', () => {
      if (window.innerWidth > 767) {
        clearTimeout(hoverTimeout);
        item.classList.add('dropdown-open');
        dropdownMenu.classList.add('dropdown-open');
        positionDropdown(item);
      }
    });

    // Desktop: Hide dropdown on mouse leave
    const hideDropdown = () => {
      if (window.innerWidth > 767) {
        item.classList.remove('dropdown-open');
        dropdownMenu.classList.remove('dropdown-open');
        hoverTimeout = setTimeout(() => {
          restoreDropdownToParent(dropdownMenu);
        }, 300); // Wait for CSS transition to complete
      }
    };

    item.addEventListener('mouseleave', () => {
      if (window.innerWidth > 767) {
        // Small delay to allow moving to dropdown itself
        hoverTimeout = setTimeout(hideDropdown, 100);
      }
    });

    // Also handle dropdown menu hover to keep it visible
    dropdownMenu.addEventListener('mouseenter', () => {
      if (window.innerWidth > 767) {
        clearTimeout(hoverTimeout);
        item.classList.add('dropdown-open');
        dropdownMenu.classList.add('dropdown-open');
        moveDropdownToBody(dropdownMenu, item);
        positionDropdown(item);
      }
    });

    dropdownMenu.addEventListener('mouseleave', () => {
      if (window.innerWidth > 767) {
        hideDropdown();
      }
    });

    // Mobile: Keep dropdown in original parent (don't move to body)
    const observer = new MutationObserver(() => {
      if (window.innerWidth <= 767) {
        // On mobile, dropdowns should stay in their original parent
        // CSS handles the display with max-height and opacity
        // Don't move to body or use fixed positioning on mobile
        if (!item.classList.contains('active')) {
          // Ensure dropdown is restored to parent when inactive
          restoreDropdownToParent(dropdownMenu);
        }
        // When active, dropdown stays in nav-menu (position: static per CSS)
      }
    });
    observer.observe(item, { attributes: true, attributeFilter: ['class'] });

    // Also position on window resize
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth <= 767;
      if (isMobile) {
        // On mobile, always restore dropdown to parent
        restoreDropdownToParent(dropdownMenu);
      } else {
        // On desktop, position dropdown if active or hovered
        if (item.classList.contains('active') || item.matches(':hover')) {
          positionDropdown(item);
        } else {
          restoreDropdownToParent(dropdownMenu);
        }
      }
    });
  });

  // Close dropdowns and mobile menu when clicking outside on mobile
  document.addEventListener('click', (e) => {
    const isMobile = window.innerWidth <= 767;
    if (!isMobile) return;

    // Close mobile menu if clicking outside
    const clickedNavMenu = e.target.closest('.nav-menu');
    const clickedHamburger = e.target.closest('#hamburger, .hamburger');
    const clickedDropdown = e.target.closest('.nav-item-dropdown');

    if (!clickedNavMenu && !clickedHamburger) {
      // Clicked outside menu and hamburger - close menu
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('active');
      hamburger?.setAttribute('aria-expanded', 'false');
      navMenu?.setAttribute('aria-hidden', 'true');
      navMenu?.removeAttribute('tabindex');
      document.body.style.overflow = '';
    }

    // Close dropdowns if clicking outside them
    if (!clickedDropdown) {
      dropdownItems.forEach(item => {
        item.classList.remove('active');
      });
    }
  });

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
