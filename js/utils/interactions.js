/**
 * Interactions Module
 * Handles button hover effects, card interactions, and ripple effects
 */

/**
 * Create a ripple effect on click
 * @param {Event} event - The click event
 * @param {HTMLElement} element - The element to create the ripple on
 */
function createRipple(event, element) {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');

  // Determine ripple color based on element class
  if (element.classList.contains('btn-secondary')) {
    ripple.classList.add('ripple-magenta');
  } else if (element.classList.contains('btn-outline')) {
    ripple.classList.add('ripple-green');
  } else {
    ripple.classList.add('ripple');
  }

  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

export function initInteractions() {
  // Add glow effect to buttons on hover
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.05)';
    });

    btn.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)';
    });
  });

  // Service Card Hover Effects
  // Apply to all service cards - mouse-tilt will override for mouse-tilt-container
  // Note: All cards should have mouse-tilt-container class for consistent mouse-following tilt effect
  document.querySelectorAll('.service-card:not(.mouse-tilt-container)').forEach(card => {
    // Only apply fallback transform if card doesn't have mouse-tilt
    // (Most cards should have mouse-tilt-container for mouse-following tilt)
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Project Card Animation
  document.querySelectorAll('.project-card-large').forEach(card => {
    card.addEventListener('mouseenter', function () {
      const overlay = this.querySelector('.project-overlay');
      if (overlay) {
        overlay.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', function () {
      const overlay = this.querySelector('.project-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
      }
    });
  });

  // Add ripple effect to buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.classList.add('ripple-container');
    btn.addEventListener('click', function (e) {
      createRipple(e, this);
    });
  });

  // Add ripple effect to cards
  document.querySelectorAll('.service-card, .project-card, .project-card-large').forEach(card => {
    card.classList.add('ripple-container');
    card.addEventListener('click', function (e) {
      createRipple(e, this);
    });
  });

  // Add ripple effect to form submissions
  document.querySelectorAll('.form-submit').forEach(btn => {
    btn.classList.add('ripple-container');
    btn.addEventListener('click', function (e) {
      createRipple(e, this);
    });
  });
}
