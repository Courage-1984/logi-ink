/**
 * Hero Fullscreen Toggle Module
 * Allows users to view the Three.js background in fullscreen mode (like a live wallpaper)
 * Hides navbar, hero content, and other UI elements
 */

let isFullscreenMode = false;
let fullscreenButton = null;

/**
 * Initialize hero fullscreen toggle
 * Works on ALL hero sections, with or without Three.js backgrounds
 */
export function initHeroFullscreen() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  // Create fullscreen button (show on all hero sections)
  fullscreenButton = document.createElement('button');
  fullscreenButton.className = 'hero-fullscreen-toggle';
  fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen background');
  fullscreenButton.setAttribute('title', 'View background in fullscreen (Press ESC to exit)');
  fullscreenButton.textContent = '⛶'; // Unicode fullscreen character

  // Insert button into hero section
  heroSection.appendChild(fullscreenButton);

  // Toggle fullscreen on click
  fullscreenButton.addEventListener('click', toggleFullscreen);

  // Exit fullscreen on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreenMode) {
      exitFullscreen();
    }
  });

  // Handle window resize in fullscreen mode
  window.addEventListener('resize', () => {
    if (isFullscreenMode && window.heroRenderer) {
      window.heroRenderer.setSize(window.innerWidth, window.innerHeight);
      // Update camera aspect ratio if needed
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        const threeCanvas = heroSection.querySelector('.threejs-canvas');
        if (threeCanvas && window.heroCamera) {
          window.heroCamera.aspect = window.innerWidth / window.innerHeight;
          window.heroCamera.updateProjectionMatrix();
        }
      }
    }
  });

  // Exit fullscreen on click outside (optional - might be too sensitive)
  // document.addEventListener('click', (e) => {
  //   if (isFullscreenMode && !heroSection.contains(e.target)) {
  //     exitFullscreen();
  //   }
  // });
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
  if (isFullscreenMode) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}

/**
 * Enter fullscreen mode
 */
function enterFullscreen() {
  isFullscreenMode = true;
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  // Add fullscreen class to body for global styles
  document.body.classList.add('hero-fullscreen-active');
  heroSection.classList.add('hero-fullscreen');

  // Hide ALL UI elements (except cursor and fullscreen button)
  const navbar = document.querySelector('.navbar');
  const heroContent = heroSection.querySelector('.hero-content');
  const scrollIndicator = heroSection.querySelector('.scroll-indicator');
  const scrollProgress = document.querySelector('.scroll-progress');
  const skipLink = document.querySelector('.skip-link');
  const backToTop = document.querySelector('.back-to-top');
  const footer = document.querySelector('footer');
  const mainContent = document.querySelector('#main-content');
  const allSections = document.querySelectorAll('section:not(.hero)');
  const allContainers = document.querySelectorAll('.container');
  const ariaLiveRegion = document.querySelector('#aria-live-region');

  // Store original display states
  const elementsToHide = [
    navbar,
    heroContent,
    scrollIndicator,
    scrollProgress,
    skipLink,
    backToTop,
    footer,
    ariaLiveRegion,
    ...allSections,
    ...allContainers,
  ].filter(Boolean);

  // Hide main content sections (but keep the hero section visible)
  if (mainContent) {
    const mainSections = mainContent.querySelectorAll('section:not(.hero)');
    mainSections.forEach((section) => {
      section.setAttribute('data-original-display', window.getComputedStyle(section).display);
      section.style.display = 'none';
    });
  }

  elementsToHide.forEach((el) => {
    el.setAttribute('data-original-display', window.getComputedStyle(el).display);
    el.style.display = 'none';
  });

  // Update button to "exit fullscreen" character
  if (fullscreenButton) {
    fullscreenButton.classList.add('active');
    fullscreenButton.textContent = '⛶'; // Same character, but active state
    fullscreenButton.setAttribute('title', 'Exit fullscreen (Press ESC)');
  }

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Resize Three.js canvas to full viewport (if it exists)
  const threeCanvas = heroSection.querySelector('.threejs-canvas');
  if (threeCanvas && window.heroRenderer) {
    window.heroRenderer.setSize(window.innerWidth, window.innerHeight);
    // Update camera aspect ratio if needed
    if (window.heroCamera) {
      window.heroCamera.aspect = window.innerWidth / window.innerHeight;
      window.heroCamera.updateProjectionMatrix();
    }
  }
}

/**
 * Exit fullscreen mode
 */
function exitFullscreen() {
  isFullscreenMode = false;
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  // Remove fullscreen classes
  document.body.classList.remove('hero-fullscreen-active');
  heroSection.classList.remove('hero-fullscreen');

  // Restore ALL UI elements
  const navbar = document.querySelector('.navbar');
  const heroContent = heroSection.querySelector('.hero-content');
  const scrollIndicator = heroSection.querySelector('.scroll-indicator');
  const scrollProgress = document.querySelector('.scroll-progress');
  const skipLink = document.querySelector('.skip-link');
  const backToTop = document.querySelector('.back-to-top');
  const footer = document.querySelector('footer');
  const mainContent = document.querySelector('#main-content');
  const ariaLiveRegion = document.querySelector('#aria-live-region');

  const elementsToShow = [
    navbar,
    heroContent,
    scrollIndicator,
    scrollProgress,
    skipLink,
    backToTop,
    footer,
    ariaLiveRegion,
  ].filter(Boolean);

  // Restore main content sections
  if (mainContent) {
    const mainSections = mainContent.querySelectorAll('section:not(.hero)');
    mainSections.forEach((section) => {
      const originalDisplay = section.getAttribute('data-original-display');
      if (originalDisplay) {
        section.style.display = originalDisplay;
        section.removeAttribute('data-original-display');
      } else {
        section.style.display = '';
      }
    });
  }

  elementsToShow.forEach((el) => {
    const originalDisplay = el.getAttribute('data-original-display');
    if (originalDisplay) {
      el.style.display = originalDisplay;
      el.removeAttribute('data-original-display');
    } else {
      el.style.display = '';
    }
  });

  // Restore all sections and containers that were hidden
  const allSections = document.querySelectorAll('section:not(.hero)');
  const allContainers = document.querySelectorAll('.container');
  [...allSections, ...allContainers].forEach((el) => {
    const originalDisplay = el.getAttribute('data-original-display');
    if (originalDisplay !== null) {
      el.style.display = originalDisplay;
      el.removeAttribute('data-original-display');
    } else {
      el.style.display = '';
    }
  });

  // Update button back to "enter fullscreen" character
  if (fullscreenButton) {
    fullscreenButton.classList.remove('active');
    fullscreenButton.textContent = '⛶'; // Unicode fullscreen character
    fullscreenButton.setAttribute('title', 'View background in fullscreen (Press ESC to exit)');
  }

  // Restore body scroll
  document.body.style.overflow = '';

  // Resize Three.js canvas back to hero section size (if it exists)
  const threeCanvas = heroSection.querySelector('.threejs-canvas');
  if (threeCanvas && window.heroRenderer) {
    const heroRect = heroSection.getBoundingClientRect();
    window.heroRenderer.setSize(heroRect.width, heroRect.height);
    // Update camera aspect ratio if needed
    if (window.heroCamera) {
      window.heroCamera.aspect = heroRect.width / heroRect.height;
      window.heroCamera.updateProjectionMatrix();
    }
  }
}

