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

  // Batch tilt updates using requestAnimationFrame
  const tiltUpdates = new Map();
  let tiltRafId = null;

  const processTiltUpdates = () => {
    tiltUpdates.forEach((data, element) => {
      const { rotateX, rotateY, cardType } = data;

      if (cardType === 'service-card') {
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) translateZ(20px)`;
      } else if (cardType === 'project-card' || cardType === 'project-card-large') {
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) translateZ(15px)`;
      } else {
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      }
      element.style.willChange = 'transform';
    });

    tiltUpdates.clear();
    tiltRafId = null;
  };

  // Cache tilt elements array
  const tiltElementsArray = Array.from(tiltElements);

  tiltElementsArray.forEach(element => {
    // Skip if already has tilt handlers attached
    if (element.dataset.tiltInitialized) {
      return;
    }
    element.dataset.tiltInitialized = 'true';

    // Determine card type once (cache)
    const cardType = element.classList.contains('service-card')
      ? 'service-card'
      : element.classList.contains('project-card-large')
        ? 'project-card-large'
        : element.classList.contains('project-card')
          ? 'project-card'
          : 'default';

    // Cache rect calculation to avoid repeated getBoundingClientRect calls
    let cachedRect = null;
    let rectCacheTimeout = null;

    const getCachedRect = () => {
      if (!cachedRect || !rectCacheTimeout) {
        cachedRect = element.getBoundingClientRect();
        // Invalidate cache after 100ms (element might have moved)
        clearTimeout(rectCacheTimeout);
        rectCacheTimeout = setTimeout(() => {
          cachedRect = null;
        }, 100);
      }
      return cachedRect;
    };

    element.addEventListener(
      'mousemove',
      e => {
      const rect = getCachedRect();
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

        tiltUpdates.set(element, {
          rotateX: clampedRotateX,
          rotateY: clampedRotateY,
          cardType,
        });

        if (!tiltRafId) {
          tiltRafId = requestAnimationFrame(processTiltUpdates);
        }
      },
      { passive: true }
    );

    element.addEventListener(
      'mouseleave',
      () => {
      element.style.transform = '';
      element.style.willChange = '';
        tiltUpdates.delete(element);
      },
      { passive: true }
    );
  });
}
