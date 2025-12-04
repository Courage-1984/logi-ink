/**
 * Animations Module
 * Handles scroll-triggered animations and reveal effects
 */

export function initAnimations() {
  // Cache DOM queries to avoid repeated lookups
  let animatedElements = null;
  let sectionTitles = null;
  let scrollRevealElements = null;
  let serviceCards = null;

  const cacheSelectors = () => {
    animatedElements = document.querySelectorAll('.fade-in-up');
    sectionTitles = document.querySelectorAll('.section-title');
    scrollRevealElements = document.querySelectorAll('.scroll-reveal-3d');
    serviceCards = document.querySelectorAll('.service-card');
  };

  // Scroll Animations Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all elements with fade-in-up class
  const observeFadeInElements = () => {
    if (!animatedElements || animatedElements.length === 0) return;

    // Batch getBoundingClientRect calls using requestAnimationFrame
    requestAnimationFrame(() => {
      const viewportHeight = window.innerHeight;
      // Batch all layout reads first
      const rects = Array.from(animatedElements).map(el => ({
        el,
        rect: el.getBoundingClientRect(),
      }));

      // Then apply changes (write phase)
      rects.forEach(({ el, rect }) => {
        const isVisible = rect.top < viewportHeight && rect.bottom > 0;
        if (isVisible) {
          el.classList.add('visible');
        }
        observer.observe(el);
      });
    });
  };

  // Text Reveal Animation on Scroll
  const textRevealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const text = entry.target;
          // Process text immediately for better perceived performance
          // (text processing is fast, no need to defer)
          const words = text.textContent.split(' ');
          text.innerHTML = words
            .map((word, i) => `<span style="animation-delay: ${i * 0.1}s">${word}</span>`)
            .join(' ');
          textRevealObserver.unobserve(text);
        }
      });
    },
    { threshold: 0.5 }
  );

  const observeTextReveal = () => {
    if (!sectionTitles || sectionTitles.length === 0) return;
    sectionTitles.forEach(title => {
      textRevealObserver.observe(title);
    });
  };

  // 3D Scroll Reveal
  const scrollRevealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  const observeScrollReveal = () => {
    if (!scrollRevealElements || scrollRevealElements.length === 0) return;
    scrollRevealElements.forEach(el => {
      scrollRevealObserver.observe(el);
    });
  };

  // Stagger animation for service cards
  const staggerCards = () => {
    if (!serviceCards || serviceCards.length === 0) return;
    serviceCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  };

  // Initialize all animations
  const initAll = () => {
    cacheSelectors();
    observeFadeInElements();
    observeTextReveal();
    observeScrollReveal();
    staggerCards();
  };

  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Add loading animation
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

  // Counting Animation for Stats Numbers
  initCountAnimation();
}

/**
 * Counting Animation
 * Animated numbers count up from 0 to target value when element comes into view
 */
function initCountAnimation() {
  const countElements = document.querySelectorAll('.count-number');

  if (countElements.length === 0) {
    return;
  }

  const countObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  countElements.forEach(element => {
    // Store original target and suffix
    const target = parseInt(element.getAttribute('data-target')) || 0;
    const suffix = element.getAttribute('data-suffix') || '';
    element.textContent = '0' + suffix;
    countObserver.observe(element);
  });
}

function animateCount(element) {
  const target = parseInt(element.getAttribute('data-target')) || 0;
  const suffix = element.getAttribute('data-suffix') || '';
  const duration = 2000; // 2 seconds
  const startTime = performance.now();
  const startValue = 0;

  // Easing function for smooth animation (ease-out)
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

    // Use requestAnimationFrame to avoid blocking main thread
    // Split work: only update text if value changed significantly (every 10ms)
    const timeSinceLastUpdate = currentTime - (updateCount.lastUpdateTime || startTime);
    if (timeSinceLastUpdate >= 10 || progress >= 1) {
      element.textContent = currentValue + suffix;
      updateCount.lastUpdateTime = currentTime;
    }

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      // Ensure final value is exact
      element.textContent = target + suffix;
      delete updateCount.lastUpdateTime;
    }
  }

  requestAnimationFrame(updateCount);
}
