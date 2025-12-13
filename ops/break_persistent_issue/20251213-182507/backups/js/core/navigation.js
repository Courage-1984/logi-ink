/**
 * Navigation Module
 * Handles navbar scroll effects and mobile menu toggle
 */

import { addScrollHandler } from './scroll-manager.js';

export function initNavigation() {
  // Font is now loaded directly via CSS font stack with metric-matched fallback
  // No JavaScript font loading needed - prevents CLS with font metric matching

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
  console.log('[NAV DEBUG] Initializing navigation module...');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  console.log('[NAV DEBUG] Element check:', {
    hamburger: !!hamburger,
    navMenu: !!navMenu,
    navLinksCount: navLinks.length,
    windowWidth: window.innerWidth,
    isMobile: window.innerWidth <= 767
  });

  if (!hamburger) {
    console.error('[NAV DEBUG] ❌ Hamburger button not found!');
  }
  if (!navMenu) {
    console.error('[NAV DEBUG] ❌ Nav menu not found!');
  }

  if (hamburger && navMenu) {
    console.log('[NAV DEBUG] ✅ Both elements found, setting up click handler');

    // Log initial computed styles
    const initialStyles = window.getComputedStyle(navMenu);
    console.log('[NAV DEBUG] Initial navMenu computed styles:', {
      display: initialStyles.display,
      position: initialStyles.position,
      left: initialStyles.left,
      top: initialStyles.top,
      width: initialStyles.width,
      height: initialStyles.height,
      visibility: initialStyles.visibility,
      opacity: initialStyles.opacity,
      zIndex: initialStyles.zIndex,
      hasActiveClass: navMenu.classList.contains('active')
    });

    // Ensure menu is initially hidden on mobile
    const isMobile = window.innerWidth <= 767;
    console.log('[NAV DEBUG] Initial mobile check:', { isMobile, windowWidth: window.innerWidth });

    if (isMobile) {
      navMenu.classList.remove('active');
      navMenu.setAttribute('aria-hidden', 'true');
      // Force initial hidden state
      navMenu.style.left = '-100%';
      console.log('[NAV DEBUG] Set initial mobile hidden state');
    }

    hamburger.addEventListener('click', (e) => {
      console.log('[NAV DEBUG] ========== HAMBURGER CLICKED ==========');
      console.log('[NAV DEBUG] Event:', { type: e.type, target: e.target });

      e.preventDefault();
      e.stopPropagation();

      const wasActive = hamburger.classList.contains('active');
      const isActive = hamburger.classList.toggle('active');
      const menuWasActive = navMenu.classList.contains('active');
      const menuIsActive = navMenu.classList.toggle('active');

      console.log('[NAV DEBUG] Toggle state:', {
        hamburgerWasActive: wasActive,
        hamburgerIsActive: isActive,
        menuWasActive: menuWasActive,
        menuIsActive: menuIsActive,
        windowWidth: window.innerWidth,
        isMobile: window.innerWidth <= 767
      });

      // Log classes after toggle
      console.log('[NAV DEBUG] Classes after toggle:', {
        hamburgerClasses: Array.from(hamburger.classList),
        navMenuClasses: Array.from(navMenu.classList)
      });

      // Force visibility on mobile when active - use requestAnimationFrame to ensure DOM update
      if (isActive && window.innerWidth <= 767) {
        console.log('[NAV DEBUG] 🚀 Opening mobile menu...');

        // CRITICAL: The CSS .nav-menu.active rule should handle this, but we'll force it with inline styles
        // First, ensure the active class is applied (it should be from toggle above)
        if (!navMenu.classList.contains('active')) {
          navMenu.classList.add('active');
          console.log('[NAV DEBUG] ⚠️ Active class was missing, added it');
        }

        // CRITICAL: Move menu to body to escape all stacking contexts (like we do with dropdowns)
        const originalParent = navMenu.parentElement;
        if (navMenu.parentElement !== document.body) {
          console.log('[NAV DEBUG] 🔄 Moving menu to body to escape stacking context');
          document.body.appendChild(navMenu);
        }

        // CRITICAL: Disable ALL transitions first to prevent CSS from animating
        navMenu.style.setProperty('transition', 'none', 'important');
        navMenu.style.setProperty('-webkit-transition', 'none', 'important');
        navMenu.style.setProperty('-moz-transition', 'none', 'important');
        navMenu.style.setProperty('-o-transition', 'none', 'important');

        // Set ALL positioning styles IMMEDIATELY with !important
        navMenu.style.setProperty('left', '0', 'important');
        navMenu.style.setProperty('display', 'flex', 'important');
        navMenu.style.setProperty('visibility', 'visible', 'important');
        navMenu.style.setProperty('opacity', '1', 'important');
        navMenu.style.setProperty('position', 'fixed', 'important');
        navMenu.style.setProperty('z-index', '99999', 'important');
        navMenu.style.setProperty('width', '100vw', 'important');
        navMenu.style.setProperty('top', '70px', 'important');
        navMenu.style.setProperty('height', 'calc(100vh - 70px)', 'important');
        navMenu.style.setProperty('pointer-events', 'auto', 'important');
        navMenu.style.setProperty('transform', 'none', 'important');
        // CRITICAL: Force background color - menu might be transparent
        navMenu.style.setProperty('background', 'rgba(10, 10, 10, 0.98)', 'important');
        navMenu.style.setProperty('background-color', 'rgba(10, 10, 10, 0.98)', 'important');

        // Store original parent for restoration
        if (!navMenu.dataset.originalParent) {
          navMenu.dataset.originalParent = originalParent ? originalParent.tagName + '.' + originalParent.className : 'unknown';
        }

        // Batch all style reads/writes to avoid forced reflows
        // Use requestAnimationFrame to batch DOM reads after writes
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Apply style changes
            navMenu.style.setProperty('left', '0', 'important');
            navMenu.style.setProperty('transition', 'none', 'important');

            // Batch all geometric property reads in a single frame to avoid forced reflows
            requestAnimationFrame(() => {
              // Read all geometric properties at once (batched)
              const height = navMenu.offsetHeight;
              const computed = window.getComputedStyle(navMenu);
              const rect = navMenu.getBoundingClientRect();

              console.log('[NAV DEBUG] Inline styles set:', {
                display: navMenu.style.display,
                position: navMenu.style.position,
                left: navMenu.style.left,
                top: navMenu.style.top,
                width: navMenu.style.width,
                height: navMenu.style.height,
                zIndex: navMenu.style.zIndex,
                visibility: navMenu.style.visibility,
                opacity: navMenu.style.opacity
              });

              // Check which CSS rules are actually matching (including media queries)
              const stylesheet = document.styleSheets;
              let matchingRules = [];
              let mediaQueryRules = [];
              for (let sheet of stylesheet) {
                try {
                  const rules = sheet.cssRules || sheet.rules;
                  for (let rule of rules) {
                    // Check media queries
                    if (rule.media) {
                      for (let mediaRule of rule.cssRules || []) {
                        if (mediaRule.selectorText && navMenu.matches(mediaRule.selectorText)) {
                          mediaQueryRules.push({
                            selector: mediaRule.selectorText,
                            media: rule.media.mediaText,
                            left: mediaRule.style?.left,
                            position: mediaRule.style?.position,
                            cssText: mediaRule.cssText?.substring(0, 200)
                          });
                        }
                      }
                    }
                    // Check regular rules
                    if (rule.selectorText && navMenu.matches(rule.selectorText)) {
                      matchingRules.push({
                        selector: rule.selectorText,
                        left: rule.style?.left,
                        position: rule.style?.position,
                        cssText: rule.cssText?.substring(0, 200)
                      });
                    }
                  }
                } catch (e) {
                  // Cross-origin stylesheet, skip
                }
              }
              console.log('[NAV DEBUG] 🔍 Matching CSS rules:', matchingRules);
              console.log('[NAV DEBUG] 🔍 Matching media query rules:', mediaQueryRules);

              // Check if mobile media query is active
              const mobileMediaQuery = window.matchMedia('(max-width: 767px)');
              console.log('[NAV DEBUG] 🔍 Mobile media query active?', {
                matches: mobileMediaQuery.matches,
                media: mobileMediaQuery.media,
                windowWidth: window.innerWidth
              });

              console.log('[NAV DEBUG] ✅ After double requestAnimationFrame - Computed styles:', {
                display: computed.display,
                position: computed.position,
                left: computed.left,
                top: computed.top,
                width: computed.width,
                height: computed.height,
                visibility: computed.visibility,
                opacity: computed.opacity,
                zIndex: computed.zIndex,
                transform: computed.transform,
                transition: computed.transition,
                backgroundColor: computed.backgroundColor,
                background: computed.background
              });

              // Check if any element is covering the menu
              const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + 50);
              const coveringElements = elementsAtPoint.filter(el =>
                el !== navMenu &&
                !navMenu.contains(el) &&
                el !== document.body &&
                el !== document.documentElement
              );
              console.log('[NAV DEBUG] 🔍 Elements covering menu center point:', coveringElements.map(el => ({
                tag: el.tagName,
                class: el.className,
                id: el.id,
                zIndex: window.getComputedStyle(el).zIndex,
                position: window.getComputedStyle(el).position
              })));

              console.log('[NAV DEBUG] 🔍 Inline style left value:', navMenu.style.getPropertyValue('left'));
              console.log('[NAV DEBUG] 🔍 Inline style left priority:', navMenu.style.getPropertyPriority('left'));

              console.log('[NAV DEBUG] ✅ Bounding rect:', {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom,
                visible: rect.width > 0 && rect.height > 0
              });

              console.log('[NAV DEBUG] ✅ Element in viewport?', {
                inViewport: rect.left >= 0 && rect.top >= 0 && rect.width > 0 && rect.height > 0,
                offScreenLeft: rect.left < -rect.width,
                offScreenRight: rect.left > window.innerWidth
              });

              // Check if parent elements are hiding it
              let parent = navMenu.parentElement;
              let depth = 0;
              while (parent && depth < 5) {
                const parentStyles = window.getComputedStyle(parent);
                console.log(`[NAV DEBUG] Parent ${depth} (${parent.tagName}.${parent.className}):`, {
                  display: parentStyles.display,
                  visibility: parentStyles.visibility,
                  opacity: parentStyles.opacity,
                  overflow: parentStyles.overflow,
                  overflowX: parentStyles.overflowX,
                  overflowY: parentStyles.overflowY,
                  zIndex: parentStyles.zIndex,
                  position: parentStyles.position
                });
                parent = parent.parentElement;
                depth++;
              }
            });
          });
        });
      } else if (!isActive && window.innerWidth <= 767) {
        console.log('[NAV DEBUG] 🔒 Closing mobile menu...');
        requestAnimationFrame(() => {
          navMenu.style.setProperty('left', '-100%', 'important');
          console.log('[NAV DEBUG] Set left to -100%');
          // Don't reset other styles immediately - let transition complete
          setTimeout(() => {
            // Restore menu to original parent
            const originalParentSelector = navMenu.dataset.originalParent;
            if (originalParentSelector && navMenu.parentElement === document.body) {
              const navContainer = document.querySelector('.nav-container');
              if (navContainer) {
                navContainer.appendChild(navMenu);
                console.log('[NAV DEBUG] 🔄 Restored menu to nav-container');
              }
            }

            navMenu.style.removeProperty('display');
            navMenu.style.removeProperty('visibility');
            navMenu.style.removeProperty('opacity');
            navMenu.style.removeProperty('position');
            navMenu.style.removeProperty('z-index');
            navMenu.style.removeProperty('width');
            navMenu.style.removeProperty('top');
            navMenu.style.removeProperty('height');
            navMenu.style.removeProperty('left');
            navMenu.style.removeProperty('background');
            navMenu.style.removeProperty('background-color');
            navMenu.style.removeProperty('transition');
            console.log('[NAV DEBUG] Reset inline styles after transition');
          }, 300);
        });
      } else {
        console.log('[NAV DEBUG] ⚠️ Not mobile or not active - no mobile menu action');
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

    // First pass: Remove all active classes to prevent FOUC
    navLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('data-active-initialized');
    });

    // Second pass: Find the matching link and mark it as active (only ONE link should be active)
    let activeLinkFound = false;
    navLinks.forEach(link => {
      // Stop if we already found an active link (prevent multiple active states)
      if (activeLinkFound) return;

      const href = link.getAttribute('href') || '';

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

      // Check if this link matches the current page - use STRICT matching only
      // Match exact normalized paths to prevent multiple matches
      const hrefMatches =
        (normalizedHref === '/' && (normalizedCurrentPage === '/' || normalizedPathname === '/')) ||
        (normalizedHref !== '/' && (normalizedHref === normalizedCurrentPage || normalizedHref === normalizedPathname.replace(/^\//, '')));

      if (hrefMatches) {
        link.classList.add('active');
        link.setAttribute('data-active-initialized', 'true'); // Mark as initialized
        activeLinkFound = true; // Prevent multiple active links
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

  // Set active link based on current page on load - run IMMEDIATELY to prevent FOUC
  // Use synchronous execution to ensure it runs before first paint
  setActiveNavLinkByPage();
  // Mark all nav links as initialized (prevents hover flash)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.setAttribute('data-nav-initialized', 'true');
  });
  // Mark active link as initialized immediately after setting
  requestAnimationFrame(() => {
    document.querySelectorAll('.nav-link.active').forEach(link => {
      link.setAttribute('data-active-initialized', 'true');
    });
  });

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
