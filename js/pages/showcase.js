/**
 * Showcase Page Controller
 * Manages initialization and pause/resume of 40 Three.js background sections
 * Uses Intersection Observer to only run animations for visible sections
 */

import { initThreeJSShowcase, pauseShowcaseSection, resumeShowcaseSection } from '../core/three-hero.js';
import { isMobileDevice } from '../utils/env.js';

// Track which sections are initialized
const initializedSections = new Set();
// Track which section is currently visible
let activeSectionIndex = null;
// Store sections array for navigation
let sectionsArray = [];

/**
 * Initialize showcase page
 */
export function initShowcase() {
  if (isMobileDevice()) {
    // On mobile, hide all canvases
    const canvases = document.querySelectorAll('.showcase-section .threejs-canvas');
    canvases.forEach(canvas => {
      canvas.style.display = 'none';
      canvas.style.visibility = 'hidden';
    });
    return;
  }

  const sections = document.querySelectorAll('.showcase-section');
  if (sections.length === 0) return;

  sectionsArray = Array.from(sections);

  // Create Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const section = entry.target;
        const index = parseInt(section.dataset.bg) - 1; // Convert to 0-based index

        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Section is visible - initialize if not already, then resume
          if (!initializedSections.has(index)) {
            initSection(index + 1); // Pass 1-based index to initThreeJSShowcase
            initializedSections.add(index);
          } else {
            resumeShowcaseSection(index);
          }
          activeSectionIndex = index;
          updateNavigationButtons(index);
        } else {
          // Section is not visible - pause animation
          if (initializedSections.has(index)) {
            pauseShowcaseSection(index);
          }
          if (activeSectionIndex === index) {
            activeSectionIndex = null;
          }
        }
      });
    },
    {
      threshold: 0.5, // Trigger when 50% of section is visible
      rootMargin: '0px',
    }
  );

  // Observe all sections
  sections.forEach((section) => {
    observer.observe(section);
  });

  // Initialize the first visible section immediately (if any)
  const firstVisible = Array.from(sections).find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  });

  if (firstVisible) {
    const index = parseInt(firstVisible.dataset.bg) - 1;
    if (!initializedSections.has(index)) {
      initSection(index + 1);
      initializedSections.add(index);
      activeSectionIndex = index;
      updateNavigationButtons(index);
    }
  }

  // Initialize navigation buttons
  initNavigationButtons();
}

/**
 * Initialize a specific showcase section
 * @param {number} index - Section index (1-40)
 */
async function initSection(index) {
  try {
    await initThreeJSShowcase(index);
  } catch (error) {
    console.warn(`Failed to initialize showcase section #${index}:`, error);
  }
}

/**
 * Initialize navigation buttons
 */
function initNavigationButtons() {
  const upBtn = document.querySelector('.showcase-nav-up');
  const downBtn = document.querySelector('.showcase-nav-down');

  if (!upBtn || !downBtn) return;

  upBtn.addEventListener('click', () => {
    scrollToSection('prev');
  });

  downBtn.addEventListener('click', () => {
    scrollToSection('next');
  });

  // Update button states on initial load
  if (activeSectionIndex !== null) {
    updateNavigationButtons(activeSectionIndex);
  } else {
    // Find first visible section
    const firstVisible = sectionsArray.findIndex((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    if (firstVisible !== -1) {
      updateNavigationButtons(firstVisible);
    }
  }
}

/**
 * Update navigation button visibility based on current section
 * @param {number} currentIndex - Current section index (0-based)
 */
function updateNavigationButtons(currentIndex) {
  const upBtn = document.querySelector('.showcase-nav-up');
  const downBtn = document.querySelector('.showcase-nav-down');

  if (!upBtn || !downBtn) return;

  // Hide up button on first section (index 0)
  if (currentIndex === 0) {
    upBtn.classList.add('hidden');
    upBtn.disabled = true;
  } else {
    upBtn.classList.remove('hidden');
    upBtn.disabled = false;
  }

  // Hide down button on last section (index 39)
  if (currentIndex === sectionsArray.length - 1) {
    downBtn.classList.add('hidden');
    downBtn.disabled = true;
  } else {
    downBtn.classList.remove('hidden');
    downBtn.disabled = false;
  }
}

/**
 * Scroll to next or previous section with perfect viewport alignment
 * @param {string} direction - 'next' or 'prev'
 */
function scrollToSection(direction) {
  if (sectionsArray.length === 0) return;

  let targetIndex;

  if (direction === 'next') {
    // Find current section
    const currentIndex = activeSectionIndex !== null ? activeSectionIndex : findCurrentSectionIndex();
    targetIndex = Math.min(currentIndex + 1, sectionsArray.length - 1);
  } else {
    // Find current section
    const currentIndex = activeSectionIndex !== null ? activeSectionIndex : findCurrentSectionIndex();
    targetIndex = Math.max(currentIndex - 1, 0);
  }

  const targetSection = sectionsArray[targetIndex];
  if (!targetSection) return;

  // Calculate perfect scroll position (section top aligned with viewport top)
  const targetPosition = targetSection.offsetTop;

  // Smooth scroll to exact position
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/**
 * Find the index of the currently visible section
 * @returns {number} Section index (0-based) or -1 if not found
 */
function findCurrentSectionIndex() {
  for (let i = 0; i < sectionsArray.length; i++) {
    const section = sectionsArray[i];
    const rect = section.getBoundingClientRect();
    // Check if section is mostly visible (more than 50% in viewport)
    if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
      return i;
    }
  }
  // Fallback: find first section with top in viewport
  for (let i = 0; i < sectionsArray.length; i++) {
    const section = sectionsArray[i];
    const rect = section.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < window.innerHeight) {
      return i;
    }
  }
  return 0; // Default to first section
}

/**
 * Cleanup showcase page (dispose of all Three.js resources)
 */
export function cleanupShowcase() {
  // Pause all sections
  for (let i = 0; i < 40; i++) {
    pauseShowcaseSection(i);
  }
  initializedSections.clear();
  activeSectionIndex = null;
  sectionsArray = [];
}

