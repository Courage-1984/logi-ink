// Navigation Scroll Effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Scroll Animations
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
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll(
    '.service-card, .project-card-large, .fade-in-up'
  );
  animatedElements.forEach(el => {
    el.classList.add('fade-in-up');
    observer.observe(el);
  });
});

// Parallax Effect for Hero Section (excluding Three.js canvas containers)
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.hero-background');

  parallaxElements.forEach(element => {
    // Skip parallax if this container has a Three.js canvas (let Three.js handle it)
    const hasThreeJS = element.querySelector('canvas.threejs-canvas');
    if (hasThreeJS) {
      // Don't apply CSS parallax to Three.js containers - Three.js handles parallax
      return;
    }

    const speed = 0.5;
    element.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

// Cursor Glow Effect (Optional - can be enhanced)
document.addEventListener('mousemove', e => {
  const cursor = document.querySelector('.cursor-glow');
  if (!cursor) return;

  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

// Add glow effect to buttons on hover
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', function () {
    this.style.transform = 'scale(1.05)';
  });

  btn.addEventListener('mouseleave', function () {
    this.style.transform = 'scale(1)';
  });
});

// Text Reveal Animation on Scroll
const textRevealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const text = entry.target;
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

document.querySelectorAll('.section-title').forEach(title => {
  textRevealObserver.observe(title);
});

// Service Card Hover Effects
document.querySelectorAll('.service-card').forEach(card => {
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

// Add loading animation
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

// Stagger animation for service cards
const staggerCards = () => {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
};

document.addEventListener('DOMContentLoaded', staggerCards);

// Active nav link highlighting based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks2 = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks2.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Back to Top Button
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    if (backToTopButton) {
      backToTopButton.classList.add('visible');
    }
  } else {
    if (backToTopButton) {
      backToTopButton.classList.remove('visible');
    }
  }
});

if (backToTopButton) {
  backToTopButton.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// Mouse Follow Effect
const cursorDot = document.querySelector('.cursor-dot');

if (cursorDot) {
  document.addEventListener('mousemove', e => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
  });

  // Scale cursor on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.transform = 'scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.transform = 'scale(1)';
    });
  });
}

// Mouse Tilt Effect (only on desktop)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const tiltElements = document.querySelectorAll('.mouse-tilt-container');

  tiltElements.forEach(element => {
    element.addEventListener('mousemove', e => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      // Check if element has specific hover transform classes
      if (element.classList.contains('service-card')) {
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) translateZ(20px)`;
      } else if (
        element.classList.contains('project-card') ||
        element.classList.contains('project-card-large')
      ) {
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) translateZ(15px)`;
      } else {
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      }
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = '';
    });
  });
}

// Scroll Progress Indicator
const scrollProgress = document.querySelector('.scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const windowHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
  });
}

// 3D Scroll Reveal
const scrollRevealElements = document.querySelectorAll('.scroll-reveal-3d');
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

scrollRevealElements.forEach(el => {
  scrollRevealObserver.observe(el);
});

// Counting Animation for Stats Numbers
function initCountAnimation() {
  const countElements = document.querySelectorAll('.count-number');

  if (countElements.length === 0) return;

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

    element.textContent = currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      // Ensure final value is exact
      element.textContent = target + suffix;
    }
  }

  requestAnimationFrame(updateCount);
}

// Initialize counting animation
document.addEventListener('DOMContentLoaded', () => {
  initCountAnimation();
});

// Ripple Effect Handler
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

// Three.js Hero Background (index.html)
function initThreeJSHero() {
  const canvas = document.getElementById('threejs-hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Create particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1000;
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6,
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    particlesMesh.rotation.x += 0.001;
    particlesMesh.rotation.y += 0.001;
    renderer.render(scene, camera);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', handleResize);
  animate();
}

// Three.js Services Background (services.html)
function initThreeJSServices() {
  const canvas = document.getElementById('threejs-services-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Create floating geometric shapes
  const shapes = [];
  const colors = [0x00ffff, 0xff00ff, 0x00ff00, 0x0066ff];

  for (let i = 0; i < 15; i++) {
    const geometry = new THREE.IcosahedronGeometry(Math.random() * 0.5 + 0.2, 0);
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(mesh);
    shapes.push(mesh);
  }

  camera.position.z = 10;

  function animate() {
    requestAnimationFrame(animate);
    shapes.forEach((shape, i) => {
      shape.rotation.x += 0.005;
      shape.rotation.y += 0.005;
      shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
    });
    renderer.render(scene, camera);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', handleResize);
  animate();
}

// Three.js Projects Background (projects.html)
function initThreeJSProjects() {
  const canvas = document.getElementById('threejs-projects-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Limit pixel ratio for better performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create grid of torus shapes - reduced for better performance
  const toruses = [];
  const gridSize = 4; // Reduced from 5 to 4
  const spacing = 2.5;

  // Store initial z positions for smooth animation
  const initialZPositions = [];

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const geometry = new THREE.TorusGeometry(0.3, 0.1, 8, 20);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const torus = new THREE.Mesh(geometry, material);
      const initialZ = (Math.random() - 0.5) * 3; // Store initial z
      torus.position.set((x - gridSize / 2) * spacing, (y - gridSize / 2) * spacing, initialZ);
      scene.add(torus);
      toruses.push(torus);
      initialZPositions.push(initialZ);
    }
  }

  camera.position.z = 8;
  const initialCameraY = 0;

  let time = 0;
  let scrollY = 0;
  let targetScrollY = 0;
  let smoothScrollY = 0;

  // Smooth scroll tracking with requestAnimationFrame
  function updateScroll() {
    // Smooth interpolation
    smoothScrollY += (targetScrollY - smoothScrollY) * 0.1;
    requestAnimationFrame(updateScroll);
  }

  // Scroll event handler - throttled for performance
  let scrollTimeout;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = requestAnimationFrame(() => {
        targetScrollY = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
      });
    },
    { passive: true }
  );

  // Start smooth scroll tracking
  updateScroll();

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01; // Slow, smooth time progression

    // Apply smooth parallax to camera position
    const parallaxOffset = smoothScrollY * 0.0005; // Subtle parallax effect
    camera.position.y = initialCameraY + parallaxOffset;

    // Subtle rotation based on scroll for depth effect
    const rotationOffset = smoothScrollY * 0.0001;
    camera.rotation.z = rotationOffset;

    toruses.forEach((torus, i) => {
      // Much slower rotation
      torus.rotation.x += 0.002;
      torus.rotation.y += 0.002;

      // Smooth, time-based z-position animation (no random in loop)
      const phase = i * 0.5; // Stagger animation per torus
      torus.position.z = initialZPositions[i] + Math.sin(time + phase) * 0.3;
    });

    renderer.render(scene, camera);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', handleResize);
  animate();
}

// Initialize Three.js on page load
function initThreeJS() {
  if (typeof THREE === 'undefined') {
    // Retry after a short delay if Three.js hasn't loaded yet
    setTimeout(initThreeJS, 100);
    return;
  }

  initThreeJSHero();
  initThreeJSServices();
  initThreeJSProjects();
}

// Wait for both DOM and Three.js to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThreeJS);
} else {
  // DOM is already ready, but Three.js might not be
  setTimeout(initThreeJS, 100);
}

// Initialize easter egg (inline version for legacy script.js)
// This will work regardless of module system
(function () {
  // Wait for DOM to be ready
  function initEasterEggInline() {
    // Check if already initialized by modular system
    if (window.easterEggInitialized) return;

    // Load easter egg module functionality
    // The module will handle all initialization including creating containers
    import('./js/core/easter-egg.js')
      .then(module => {
        if (module && module.initEasterEgg) {
          module.initEasterEgg();
        }
      })
      .catch(() => {
        console.warn('Easter egg module could not be loaded');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEasterEggInline);
  } else {
    initEasterEggInline();
  }
})();
