/**
 * Scroll Module
 * Handles scroll-related effects: parallax, progress indicator, smooth scroll
 */

import { addScrollHandler } from './scroll-manager.js';

export function initScroll() {
  // Cache parallax elements to avoid repeated queries
  const parallaxElements = document.querySelectorAll('.hero-background');

  // Parallax Effect for Hero Section
  const parallaxHandler = () => {
    if (parallaxElements.length === 0) return;
    const scrolled = window.pageYOffset;
    const speed = 0.5;
    const translateY = scrolled * speed;

    // Batch DOM writes using requestAnimationFrame
    requestAnimationFrame(() => {
      parallaxElements.forEach(element => {
        element.style.transform = `translateY(${translateY}px)`;
      });
    });
  };
  addScrollHandler(parallaxHandler);

  // Scroll Progress Indicator
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    // Cache scroll height to avoid forced reflows
    let cachedScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    const updateScrollHeight = () => {
      cachedScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    };

    // Recalculate on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateScrollHeight, 100);
    });

    const progressHandler = () => {
      const scrolled = (window.pageYOffset / cachedScrollHeight) * 100;
      scrollProgress.style.width = scrolled + '%';
    };
    addScrollHandler(progressHandler);
  }

  // Smooth Scroll for Anchor Links (cache selectors)
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') {
        return;
      } // Skip empty anchors

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Back to Top Button
  const backToTopButton = document.querySelector('.back-to-top');

  if (backToTopButton) {
    const backToTopHandler = () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    };
    addScrollHandler(backToTopHandler);

    backToTopButton.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  // Scrollbar Expansion on Hover Near Right Edge
  // Expands scrollbar when mouse is within 30px of the right edge for easier grabbing
  let scrollbarExpandTimeout;
  const edgeThreshold = 30; // Distance from right edge in pixels

  document.addEventListener('mousemove', e => {
    const windowWidth = window.innerWidth;
    const mouseX = e.clientX;
    const distanceFromRight = windowWidth - mouseX;

    // Clear any existing timeout
    clearTimeout(scrollbarExpandTimeout);

    if (distanceFromRight <= edgeThreshold) {
      // Mouse is near the right edge - expand scrollbar
      document.documentElement.classList.add('scrollbar-expanded');
    } else {
      // Mouse is away from the edge - collapse scrollbar after a short delay
      scrollbarExpandTimeout = setTimeout(() => {
        document.documentElement.classList.remove('scrollbar-expanded');
      }, 150); // Small delay to prevent flickering when moving mouse quickly
    }
  });

  // Remove expanded class when mouse leaves the window
  document.addEventListener('mouseleave', () => {
    document.documentElement.classList.remove('scrollbar-expanded');
  });
}
