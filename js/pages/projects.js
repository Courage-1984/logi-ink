/**
 * Projects Page Module
 * Handles project detail modal lifecycle and dynamic content population
 */

// Mapping of project IDs to their video file paths
const projectVideoPaths = {
  'ecommerce-platform': './assets/video/video-e-commerce-platform.mp4',
  'fintech-app': './assets/video/video-fintech-mobile-app.mp4',
  'startup-rebrand': './assets/video/video-tech-startup-rebrand.mp4',
  'corporate-website': './assets/video/video-corporate-website.mp4',
  'fitness-tracker': './assets/video/video-fitness-tracking-app.mp4',
  'marketing-campaign': './assets/video/video-marketing-campaign.mp4',
};

// Mapping of project IDs to their background image paths
const projectBackgroundPaths = {
  'ecommerce-platform': './assets/images/portfolio/backgrounds/background-e-commerce-platform.png',
  'fintech-app': './assets/images/portfolio/backgrounds/background-fintech-mobile-app.png',
  'startup-rebrand': './assets/images/portfolio/backgrounds/background-tech-startup-rebrand.png',
  'corporate-website': './assets/images/portfolio/backgrounds/background-corporate-website.png',
  'fitness-tracker': './assets/images/portfolio/backgrounds/background-fitness-tracking-app.png',
  'marketing-campaign': './assets/images/portfolio/backgrounds/background-marketing-campaign.png',
};

const projectDetails = {
  'ecommerce-platform': {
    title: 'E-Commerce Platform',
    category: 'Web Development',
    description:
      'A resilient commerce platform designed for scale with real-time inventory synchronisation, dynamic pricing rules, and a frictionless checkout experience optimised for global audiences.',
    tags: ['React', 'Node.js', 'MongoDB'],
    highlights: [
      'Modular microservice architecture with automated deployment pipelines',
      'AI-powered product recommendation engine and dynamic promotions',
      'Custom analytics dashboard that surfaces sales trends and customer cohorts in real time'
    ],
    results: [
      '28% increase in conversion rate within the first quarter after launch',
      'Reduced cart abandonment by 34% through UX refinements and payment optimisations',
      'Scaled seamlessly to support seasonal traffic spikes of 5x without downtime'
    ]
  },
  'fintech-app': {
    title: 'FinTech Mobile App',
    category: 'UI/UX Design',
    description:
      'End-to-end product design for a secure banking application, pairing frictionless user flows with motion design that builds trust across every interaction.',
    tags: ['Figma', 'Prototyping', 'Design System'],
    highlights: [
      'Crafted a token-driven design system ensuring parity across iOS and Android builds',
      'Interactive prototypes validated with target customers in moderated sessions',
      'Embedded micro-interactions that reinforce key security actions without adding friction'
    ],
    results: [
      'Customer onboarding time reduced from 6 minutes to under 3 minutes',
      'App Store rating improved from 3.8 to 4.6 within two months of relaunch',
      'Regulatory compliance accelerated with accessible, auditable UI components'
    ]
  },
  'startup-rebrand': {
    title: 'Tech Startup Rebrand',
    category: 'Brand Strategy',
    description:
      'A full-funnel rebrand aligning story, visuals, and messaging to position the startup as a category leader and investor-ready organisation.',
    tags: ['Rebranding', 'Identity', 'Strategy'],
    highlights: [
      'Developed a future-proof brand architecture and messaging framework',
      'Produced comprehensive visual identity guidelines across digital and print touchpoints',
      'Facilitated stakeholder workshops to anchor the brand in authentic core values'
    ],
    results: [
      'Secured Series B funding within 6 months of the rebrand launch',
      'Organic press mentions increased by 45% due to clearer positioning',
      'Website engagement time grew by 52% with the refreshed storytelling'
    ]
  },
  'corporate-website': {
    title: 'Corporate Website',
    category: 'Web Development',
    description:
      'A performance-first corporate web presence with a flexible CMS foundation, empowering the marketing team with rapid publishing workflows.',
    tags: ['WordPress', 'Custom Theme', 'SEO'],
    highlights: [
      'Custom Gutenberg blocks enabling modular landing page creation without engineering support',
      'Enterprise-grade security hardening and accessibility conformance (WCAG 2.1 AA)',
      'Integrated analytics and CRM automation for real-time lead attribution'
    ],
    results: [
      'Load times improved by 64%, supporting global audiences on mobile networks',
      'Lead generation doubled in the first quarter post-launch',
      'Empowered marketing teams to ship campaigns 3x faster with reusable content blocks'
    ]
  },
  'fitness-tracker': {
    title: 'Fitness Tracking App',
    category: 'Mobile App',
    description:
      'A cross-platform digital coach delivering personalised workout plans, social accountability, and real-time performance tracking.',
    tags: ['React Native', 'iOS', 'Android'],
    highlights: [
      'Biometric integrations with Apple Health and Google Fit for seamless data sync',
      'Gamified progress loops that improve adherence and retention',
      'Offline-first architecture ensuring workouts remain accessible on the go'
    ],
    results: [
      'User retention increased by 38% quarter-over-quarter',
      'Average session length grew by 22% thanks to motivational nudges',
      'Community challenges generated a 4x boost in weekly active users'
    ]
  },
  'marketing-campaign': {
    title: 'Marketing Campaign',
    category: 'Digital Marketing',
    description:
      'A multi-channel demand generation engine combining SEO, content, and paid media to deliver measurable growth.',
    tags: ['SEO', 'Content', 'Analytics'],
    highlights: [
      'Content hub strategy aligned with buyer journeys and high-intent keywords',
      'Marketing automation nurture streams tailored to behavioural segments',
      'Real-time dashboards tracking campaign ROI and attribution across channels'
    ],
    results: [
      '124% uplift in qualified organic traffic within six months',
      'Cost-per-acquisition reduced by 27% through optimisation cycles',
      'Marketing influenced pipeline grew by $2.1M year-over-year'
    ]
  }
};

const PROJECT_MODAL_SIZES = '(max-width: 768px) 90vw, (max-width: 1280px) 70vw, 960px';

// Available responsive image sizes
const RESPONSIVE_SIZES = [320, 375, 480, 768, 1024];

/**
 * Build responsive srcset dynamically using static asset paths
 * This avoids bundling images into JavaScript (saves ~140 KB)
 */
const buildResponsiveSrcset = (base, format) => {
  const basePath = './assets/images/responsive/portfolio';
  const srcset = RESPONSIVE_SIZES.map(size => {
    const filename = `${base}-${size}w.${format}`;
    return `${basePath}/${filename} ${size}w`;
  }).join(', ');
  return srcset;
};

/**
 * Get fallback image path (PNG from portfolio directory)
 */
const getFallbackImagePath = (base) => {
  return `./assets/images/portfolio/${base}.png`;
};

const extractImageBase = imageEl => {
  if (!imageEl) return '';

  const directBase = imageEl.dataset.base || imageEl.getAttribute('data-base');
  if (directBase) {
    return directBase;
  }

  const src = imageEl.getAttribute('src') || '';
  const match = src.match(/\/?([^/]+?)(?:\.[a-z0-9]+)?$/i);
  return match ? match[1] : '';
};

export function initProjectsPage() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const modalContent = modal.querySelector('.project-modal__content');
  const modalImage = modal.querySelector('.project-modal__image');
  const modalVideo = modal.querySelector('#project-modal-video');
  const modalMagnifier = modal.querySelector('.project-modal__magnifier');
  const modalMedia = modal.querySelector('.project-modal__media');
  const modalSourceAvif = modal.querySelector('#project-modal-source-avif');
  const modalSourceWebp = modal.querySelector('#project-modal-source-webp');
  const modalCategory = modal.querySelector('.project-modal__category');
  const modalTitle = modal.querySelector('.project-modal__title');
  const modalDescription = modal.querySelector('.project-modal__description');
  const modalSummary = modal.querySelector('.project-modal__summary');
  const modalTags = modal.querySelector('.project-modal__tags');
  const modalHighlights = modal.querySelector('.project-modal__highlights');
  const modalResults = modal.querySelector('.project-modal__results');
  const closeButton = modal.querySelector('.modal-close');
  const mediaToggle = modal.querySelector('.project-modal__media-toggle');

  if (
    !modalContent ||
    !modalImage ||
    !modalCategory ||
    !modalTitle ||
    !modalDescription ||
    !modalSummary ||
    !modalTags ||
    !modalHighlights ||
    !modalResults ||
    !closeButton ||
    !modalSourceAvif ||
    !modalSourceWebp
  ) {
    return;
  }

  const triggers = document.querySelectorAll('.project-details-btn');
  if (!triggers.length) return;

  let activeProjectId = null;
  let lastFocusedElement = null;

  const updateMagnifierBackground = () => {
    if (!modalMagnifier || !modalMedia) return;
    const imageSrc = modalImage.currentSrc || modalImage.getAttribute('src') || '';
    modalMagnifier.style.backgroundImage = imageSrc ? `url("${imageSrc}")` : '';
  };

  modalImage.addEventListener('load', updateMagnifierBackground);

  const openModal = (projectId, card) => {
    const details = projectDetails[projectId] ?? {};
    const imageEl = card.querySelector('.project-image img');

    if (imageEl) {
      const responsiveBase = extractImageBase(imageEl);
      const fallbackSrc = imageEl.getAttribute('src') || '';
      const currentSrc = imageEl.currentSrc || fallbackSrc;

      if (responsiveBase) {
        const avifSrcset = buildResponsiveSrcset(responsiveBase, 'avif');
        const webpSrcset = buildResponsiveSrcset(responsiveBase, 'webp');

        modalSourceAvif.srcset = avifSrcset;
        modalSourceAvif.setAttribute('sizes', PROJECT_MODAL_SIZES);

        modalSourceWebp.srcset = webpSrcset;
        modalSourceWebp.setAttribute('sizes', PROJECT_MODAL_SIZES);

        modalImage.setAttribute('sizes', PROJECT_MODAL_SIZES);
        modalImage.dataset.base = responsiveBase;

        // Use fallback image path or current src
        const fallbackPath = getFallbackImagePath(responsiveBase);
        modalImage.src = fallbackPath || currentSrc || fallbackSrc;
      } else {
        modalSourceAvif.removeAttribute('srcset');
        modalSourceAvif.removeAttribute('sizes');
        modalSourceWebp.removeAttribute('srcset');
        modalSourceWebp.removeAttribute('sizes');
        modalImage.removeAttribute('sizes');
        modalImage.removeAttribute('data-base');
        modalImage.src = currentSrc || fallbackSrc;
      }

      if (!modalImage.src) {
        modalImage.src = fallbackSrc;
      }

      modalImage.alt = imageEl.alt || `${details.title || 'Project'} - ${details.category || 'Digital project'} by Logi-Ink in Pretoria, South Africa`;
    } else {
      modalSourceAvif.removeAttribute('srcset');
      modalSourceAvif.removeAttribute('sizes');
      modalSourceWebp.removeAttribute('srcset');
      modalSourceWebp.removeAttribute('sizes');
      modalImage.removeAttribute('sizes');
      modalImage.removeAttribute('data-base');
      modalImage.removeAttribute('src');
      modalImage.alt = `${details.title || 'Project'} - ${details.category || 'Digital project'} by Logi-Ink in Pretoria, South Africa`;
    }

    // Initialize video if available for this project
    const videoPath = projectVideoPaths[projectId];
    const backgroundPath = projectBackgroundPaths[projectId];
    const modalVideoBackground = document.getElementById('project-modal-video-background');

    if (modalVideo && videoPath) {
      // Wait for image to load, then set video poster to match for seamless alignment
      const setupVideo = () => {
        const imageSrc = modalImage.currentSrc || modalImage.getAttribute('src') || '';
        if (imageSrc && modalVideo) {
          modalVideo.poster = imageSrc;
        }

        // Set background image behind video
        if (modalVideoBackground && backgroundPath) {
          modalVideoBackground.src = backgroundPath;
        }

        modalVideo.src = videoPath;
        modalVideo.load();
        modalMedia.classList.add('has-video');

        // Reset video to start to match the first frame (which is the image)
        modalVideo.currentTime = 0;
        modalVideo.pause();

        // Image is default view (with magnifier), video is available via toggle
        modalMedia.classList.remove('show-video');

        // Update toggle button state (image is shown by default)
        if (mediaToggle) {
          mediaToggle.setAttribute('aria-pressed', 'false');
          mediaToggle.setAttribute('aria-label', 'Switch to video view');
        }
      };

      // If image is already loaded, setup video immediately
      if (modalImage.complete && modalImage.naturalWidth > 0) {
        setupVideo();
      } else {
        // Otherwise wait for image to load first
        modalImage.addEventListener('load', setupVideo, { once: true });
        // Fallback: setup video even if image load event doesn't fire
        setTimeout(setupVideo, 100);
      }
    } else {
      // No video available, hide video element and toggle button
      if (modalVideo) {
        modalVideo.src = '';
        modalVideo.pause();
      }
      const modalVideoBackground = document.getElementById('project-modal-video-background');
      if (modalVideoBackground) {
        modalVideoBackground.src = '';
      }
      modalMedia.classList.remove('has-video', 'show-video');
      if (mediaToggle) {
        mediaToggle.setAttribute('aria-pressed', 'false');
        mediaToggle.style.display = 'none';
      }
    }

    modalCategory.textContent = details.category || card.querySelector('.project-category')?.textContent || '';
    modalTitle.textContent = details.title || card.querySelector('h3')?.textContent || 'Project Details';
    modalSummary.textContent =
      details.description || card.querySelector('p')?.textContent || 'Stay tuned for a deeper dive into this project.';

    const tags = details.tags ?? Array.from(card.querySelectorAll('.project-tag')).map(tag => tag.textContent.trim());
    modalTags.innerHTML = '';
    tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'project-tag';
      tagEl.textContent = tag;
      modalTags.appendChild(tagEl);
    });

    const populateList = (container, items, fallback) => {
      container.innerHTML = '';
      const list = items && items.length ? items : [fallback];
      list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        container.appendChild(li);
      });
    };

    populateList(
      modalHighlights,
      details.highlights,
      'We’re preparing a full breakdown of the highlights for this engagement.'
    );
    populateList(modalResults, details.results, 'Results summary coming soon.');

    updateMagnifierBackground();

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      modalContent.focus();
    });

    activeProjectId = projectId;
  };

  const closeModal = () => {
    // Pause and cleanup video
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = '';
      modalVideo.currentTime = 0;
    }

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeProjectId = null;
    modalSourceAvif.removeAttribute('srcset');
    modalSourceAvif.removeAttribute('sizes');
    modalSourceWebp.removeAttribute('srcset');
    modalSourceWebp.removeAttribute('sizes');
    modalImage.removeAttribute('sizes');
    modalImage.removeAttribute('data-base');
    modalImage.removeAttribute('src');
    modalMedia.classList.remove('has-video', 'show-video');

    if (mediaToggle) {
      mediaToggle.setAttribute('aria-pressed', 'false');
      mediaToggle.style.display = '';
    }

    updateMagnifierBackground();

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  // Cache triggers to avoid repeated queries
  const triggerArray = Array.from(triggers);
  triggerArray.forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      const projectId = trigger.dataset.projectId || trigger.closest('.project-card')?.dataset.projectId;
      const card = trigger.closest('.project-card');
      if (!projectId || !card) {
        return;
      }

      openModal(projectId, card);
    });
  });

  closeButton.addEventListener('click', () => {
    closeModal();
  });

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    if (event.key === 'Tab') {
      const focusableSelectors =
        'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])';
      // Cache focusable elements query
      const focusable = Array.from(modal.querySelectorAll(focusableSelectors)).filter(
        element => element.offsetParent !== null
      );

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Toggle between image and video in modal
  if (mediaToggle && modalVideo) {
    mediaToggle.addEventListener('click', () => {
      if (!modalMedia.classList.contains('has-video')) return;

      const isShowingVideo = modalMedia.classList.contains('show-video');

      if (isShowingVideo) {
        // Switch to image - container stays as flex (no layout recalculation), just remove show-video class
        if (modalVideo) {
          modalVideo.pause();
          modalVideo.currentTime = 0; // Reset to first frame for seamless next transition
        }
        modalMedia.classList.remove('show-video');
        // Update magnifier background after image is visible
        requestAnimationFrame(() => {
          updateMagnifierBackground();
        });
        mediaToggle.setAttribute('aria-pressed', 'false');
        mediaToggle.setAttribute('aria-label', 'Switch to video view');
      } else {
        // Switch to video - reset to first frame for seamless transition from image
        if (modalVideo && modalVideo.src) {
          modalVideo.currentTime = 0;
          modalMedia.classList.add('show-video');
          modalVideo.play().catch(() => {
            // Silently handle autoplay restrictions - video still visible for user interaction
          });
          mediaToggle.setAttribute('aria-pressed', 'true');
          mediaToggle.setAttribute('aria-label', 'Switch to image view');
        }
      }
    });
  }

  if (modalMedia && modalMagnifier) {
    const supportsFinePointer =
      typeof window.matchMedia === 'function' ? window.matchMedia('(pointer: fine)').matches : true;
    const lensSize = 150;

    const handlePointerMove = event => {
      // Only enable magnifier when showing image, not video
      if (modalMedia.classList.contains('show-video')) {
        modalMedia.classList.remove('is-magnifying');
        return;
      }

      const rect = modalMedia.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const clampedX = Math.max(lensSize / 2, Math.min(rect.width - lensSize / 2, x));
      const clampedY = Math.max(lensSize / 2, Math.min(rect.height - lensSize / 2, y));

      const zoomFactor = 3;
      const backgroundSizeX = rect.width * zoomFactor;
      const backgroundSizeY = rect.height * zoomFactor;
      const backgroundPosX = ((clampedX / rect.width) * 100).toFixed(2);
      const backgroundPosY = ((clampedY / rect.height) * 100).toFixed(2);

      // Use transform for positioning to prevent layout shifts (GPU-accelerated)
      modalMagnifier.style.transform = `translate(${clampedX - lensSize / 2}px, ${clampedY - lensSize / 2}px)`;
      modalMagnifier.style.backgroundPosition = `${backgroundPosX}% ${backgroundPosY}%`;
      modalMagnifier.style.backgroundSize = `${backgroundSizeX}px ${backgroundSizeY}px`;
    };

    const handlePointerEnter = event => {
      if (!supportsFinePointer) return;
      // Only enable magnifier when showing image, not video
      if (modalMedia.classList.contains('show-video')) return;
      modalMedia.classList.add('is-magnifying');
      handlePointerMove(event);
    };

    const handlePointerLeave = () => {
      modalMedia.classList.remove('is-magnifying');
    };

    modalMedia.addEventListener('pointerenter', handlePointerEnter);
    modalMedia.addEventListener('pointermove', handlePointerMove);
    modalMedia.addEventListener('pointerleave', handlePointerLeave);
  }

  // Initialize hover videos for all project cards with videos
  initHoverVideos();
}

/**
 * Initialize hover video functionality for all project cards with videos
 */
function initHoverVideos() {
  const projectCards = document.querySelectorAll('.project-card .project-hover-video');
  if (!projectCards.length) return;

  projectCards.forEach(video => {
    const card = video.closest('.project-card');
    if (!card) return;
    initCardHoverVideo(card, video);
  });
}

/**
 * Initialize hover video functionality for a single project card
 * @param {HTMLElement} card - The project card element
 * @param {HTMLVideoElement} video - The video element within the card
 */
function initCardHoverVideo(card, video) {
  if (!card || !video) return;

  // Ensure video is muted and ready for hover play
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  let isVideoReady = false;
  let isPlaying = false;

  const prepareVideo = () => {
    if (isVideoReady) return;

    // Preload video metadata for faster start
    video.load();

    // Mark as ready once metadata is loaded
    const handleLoadedMetadata = () => {
      isVideoReady = true;
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
  };

  const playVideo = async () => {
    if (isPlaying) return;

    try {
      // Ensure video is ready before playing
      if (!isVideoReady) {
        await new Promise((resolve) => {
          if (video.readyState >= 1) {
            resolve();
          } else {
            video.addEventListener('loadedmetadata', resolve, { once: true });
          }
        });
        isVideoReady = true;
      }

      // Reset video to start if it's at the end
      if (video.currentTime >= video.duration - 0.5) {
        video.currentTime = 0;
      }

      await video.play();
      isPlaying = true;
    } catch (error) {
      // Silently handle autoplay restrictions
      console.debug('Video play prevented:', error);
    }
  };

  const pauseVideo = () => {
    if (!isPlaying) return;

    video.pause();
    isPlaying = false;
  };

  // Prepare video when card enters viewport (lazy loading optimization)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prepareVideo();
          observer.disconnect();
        }
      });
    },
    { rootMargin: '200px' }
  );

  observer.observe(card);

  // Handle hover events
  const handleMouseEnter = () => {
    prepareVideo();
    playVideo();
  };

  const handleMouseLeave = () => {
    pauseVideo();
  };

  // Use mouse events for better control
  card.addEventListener('mouseenter', handleMouseEnter);
  card.addEventListener('mouseleave', handleMouseLeave);

  // Handle touch devices (optional, since hover doesn't work well on touch)
  // But we can prepare the video for potential interaction
  if ('ontouchstart' in window) {
    card.addEventListener('touchstart', prepareVideo, { once: true });
  }
}

