/**
 * Projects Page Module
 * Handles project detail modal lifecycle and dynamic content population
 */

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

const responsiveAssets = {
  avif: {},
  webp: {},
};

const fallbackImageAssets = {};

const registerResponsiveAssets = (modules, format) => {
  Object.entries(modules).forEach(([path, url]) => {
    const match = path.match(/\/([^/]+)-([0-9]+w)\.(avif|webp)$/);
    if (!match) return;
    const [, base, size] = match;
    if (!responsiveAssets[format][base]) {
      responsiveAssets[format][base] = [];
    }
    responsiveAssets[format][base].push({
      size,
      numericSize: parseInt(size, 10),
      url,
    });
  });
};

registerResponsiveAssets(
  import.meta.glob('../../assets/images/responsive/portfolio/*-*.avif', {
    eager: true,
    import: 'default',
  }),
  'avif',
);

registerResponsiveAssets(
  import.meta.glob('../../assets/images/responsive/portfolio/*-*.webp', {
    eager: true,
    import: 'default',
  }),
  'webp',
);

Object.entries(
  import.meta.glob('../../assets/images/portfolio/*.png', {
    eager: true,
    import: 'default',
  }),
).forEach(([path, url]) => {
  const match = path.match(/\/([^/]+)\.png$/);
  if (!match) return;
  const [, base] = match;
  fallbackImageAssets[base] = url;
});

const buildResponsiveSrcset = (base, format) => {
  const entries = responsiveAssets[format][base];
  if (!entries || !entries.length) {
    return '';
  }
  return entries
    .slice()
    .sort((a, b) => a.numericSize - b.numericSize)
    .map(({ url, size }) => `${url} ${size}`)
    .join(', ');
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
        if (avifSrcset) {
          modalSourceAvif.srcset = avifSrcset;
          modalSourceAvif.setAttribute('sizes', PROJECT_MODAL_SIZES);
        } else {
          modalSourceAvif.removeAttribute('srcset');
          modalSourceAvif.removeAttribute('sizes');
        }

        if (webpSrcset) {
          modalSourceWebp.srcset = webpSrcset;
          modalSourceWebp.setAttribute('sizes', PROJECT_MODAL_SIZES);
        } else {
          modalSourceWebp.removeAttribute('srcset');
          modalSourceWebp.removeAttribute('sizes');
        }

        if (avifSrcset || webpSrcset) {
          modalImage.setAttribute('sizes', PROJECT_MODAL_SIZES);
        } else {
          modalImage.removeAttribute('sizes');
        }

        modalImage.dataset.base = responsiveBase;
        const mappedFallback = fallbackImageAssets[responsiveBase];
        modalImage.src = mappedFallback || currentSrc || fallbackSrc;
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

      modalImage.alt = imageEl.alt || `${details.title || 'Project'} preview`;
    } else {
      modalSourceAvif.removeAttribute('srcset');
      modalSourceAvif.removeAttribute('sizes');
      modalSourceWebp.removeAttribute('srcset');
      modalSourceWebp.removeAttribute('sizes');
      modalImage.removeAttribute('sizes');
      modalImage.removeAttribute('data-base');
      modalImage.removeAttribute('src');
      modalImage.alt = details.title || 'Project preview';
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
    updateMagnifierBackground();

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  triggers.forEach(trigger => {
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

  if (modalMedia && modalMagnifier) {
    const supportsFinePointer =
      typeof window.matchMedia === 'function' ? window.matchMedia('(pointer: fine)').matches : true;
    const lensSize = 150;

    const handlePointerMove = event => {
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

      modalMagnifier.style.left = `${clampedX - lensSize / 2}px`;
      modalMagnifier.style.top = `${clampedY - lensSize / 2}px`;
      modalMagnifier.style.backgroundPosition = `${backgroundPosX}% ${backgroundPosY}%`;
      modalMagnifier.style.backgroundSize = `${backgroundSizeX}px ${backgroundSizeY}px`;
    };

    const handlePointerEnter = event => {
      if (!supportsFinePointer) return;
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
}

