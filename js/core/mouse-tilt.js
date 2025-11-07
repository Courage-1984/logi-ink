/**
 * Mouse Tilt Module
 * Handles 3D tilt effects on interactive cards (desktop only)
 */

export function initMouseTilt() {
  // Prevent double initialization
  if (window.mouseTiltInitialized) {
    return;
  }
  window.mouseTiltInitialized = true;

  // Only enable on devices with hover capability (desktop)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }

  const tiltElements = document.querySelectorAll('.mouse-tilt-container');

  if (tiltElements.length === 0) {
    return;
  }

  tiltElements.forEach(element => {
    // Skip if already has tilt handlers attached
    if (element.dataset.tiltInitialized) {
      return;
    }
    element.dataset.tiltInitialized = 'true';
    element.addEventListener('mousemove', e => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Use legacy tilt intensity (/10) but with reasonable limits
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      // Limit tilt angles to prevent extreme tilting (max 10 degrees for medium effect)
      const maxTilt = 10;
      const clampedRotateX = Math.max(-maxTilt, Math.min(maxTilt, rotateX));
      const clampedRotateY = Math.max(-maxTilt, Math.min(maxTilt, rotateY));

      // Check if element has specific hover transform classes (matching legacy behavior)
      if (element.classList.contains('service-card')) {
        element.style.transform = `perspective(1000px) rotateX(${clampedRotateX}deg) rotateY(${clampedRotateY}deg) translateY(-10px) translateZ(20px)`;
        element.style.willChange = 'transform';
      } else if (
        element.classList.contains('project-card') ||
        element.classList.contains('project-card-large')
      ) {
        element.style.transform = `perspective(1000px) rotateX(${clampedRotateX}deg) rotateY(${clampedRotateY}deg) translateY(-5px) translateZ(15px)`;
        element.style.willChange = 'transform';
      } else {
        element.style.transform = `perspective(1000px) rotateX(${clampedRotateX}deg) rotateY(${clampedRotateY}deg) translateZ(20px)`;
        element.style.willChange = 'transform';
      }
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = '';
      element.style.willChange = '';
    });
  });
}
