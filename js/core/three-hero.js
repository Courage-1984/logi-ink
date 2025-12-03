/**
 * Three.js Hero Background Module
 * Different Three.js animations for different hero sections
 * - index.html: Rotating particles
 * - services.html: Floating geometric shapes
 * - projects.html: Torus grid with scroll parallax
 */

import { loadThreeJS } from '../utils/three-loader.js';
import { isMobileDevice } from '../utils/env.js';

let heroScene = null;
let heroRenderer = null;
let heroCamera = null;
let heroAnimationId = null;

/**
 * Initialize Three.js Hero Background for index.html (particles)
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSHero(THREE) {
  const canvas = document.getElementById('threejs-hero-canvas');
  if (!canvas) return;

  // Disable Three.js on mobile devices for better performance
  if (isMobileDevice()) {
    return;
  }

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Limit pixel ratio on mobile (though we disable on mobile, keep this for tablets)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
      heroAnimationId = requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.001;
      particlesMesh.rotation.y += 0.001;
      renderer.render(scene, camera);
      // Mark canvas as loaded after first render
      if (!canvas.classList.contains('is-loaded')) {
        canvas.classList.add('is-loaded');
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    heroScene = scene;
    heroRenderer = renderer;
    heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js Hero animation failed to initialize:', error);
  }
}

/**
 * Initialize Three.js Services Background (floating geometric shapes)
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSServices(THREE) {
  const canvas = document.getElementById('threejs-services-canvas');
  if (!canvas) return;

  // Disable Three.js on mobile devices for better performance
  if (isMobileDevice()) {
    return;
  }

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Limit pixel ratio on mobile (though we disable on mobile, keep this for tablets)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
      heroAnimationId = requestAnimationFrame(animate);
      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.005;
        shape.rotation.y += 0.005;
        shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
      });
      renderer.render(scene, camera);
      // Mark canvas as loaded after first render
      if (!canvas.classList.contains('is-loaded')) {
        canvas.classList.add('is-loaded');
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    heroScene = scene;
    heroRenderer = renderer;
    heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js Services animation failed to initialize:', error);
  }
}

/**
 * Initialize Three.js Projects Background (torus grid with scroll parallax)
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSProjects(THREE) {
  const canvas = document.getElementById('threejs-projects-canvas');
  if (!canvas) return;

  // Disable Three.js on mobile devices for better performance
  if (isMobileDevice()) {
    return;
  }

  try {
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
      heroAnimationId = requestAnimationFrame(animate);
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
      // Mark canvas as loaded after first render
      if (!canvas.classList.contains('is-loaded')) {
        canvas.classList.add('is-loaded');
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    heroScene = scene;
    heroRenderer = renderer;
    heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js Projects animation failed to initialize:', error);
  }
}

/**
 * Initialize appropriate Three.js hero background based on page
 * Three.js loading is deferred by main.js, this function just initializes the animation
 */
export async function initThreeHero() {
  // Check mobile FIRST before doing anything else
  if (isMobileDevice()) {
    // Hide canvas elements on mobile
    const canvases = [
      document.getElementById('threejs-hero-canvas'),
      document.getElementById('threejs-services-canvas'),
      document.getElementById('threejs-projects-canvas')
    ].filter(Boolean);

    canvases.forEach(canvas => {
      if (canvas) {
        canvas.style.display = 'none';
        canvas.style.visibility = 'hidden';
      }
    });

    return; // Exit early on mobile
  }

  const heroCanvas = document.getElementById('threejs-hero-canvas');
  const servicesCanvas = document.getElementById('threejs-services-canvas');
  const projectsCanvas = document.getElementById('threejs-projects-canvas');

  if (!heroCanvas && !servicesCanvas && !projectsCanvas) return;

  // Double-check mobile before initializing (in case viewport changed)
  if (isMobileDevice()) {
    return;
  }

  try {
    // Dynamically import loadThreeJS only when needed
    const THREE = await loadThreeJS();
    if (!THREE) return;

    // Initialize appropriate animation and pass THREE object
    if (heroCanvas) {
      await initThreeJSHero(THREE);
    } else if (servicesCanvas) {
      await initThreeJSServices(THREE);
    } else if (projectsCanvas) {
      await initThreeJSProjects(THREE);
    }
  } catch (error) {
    console.warn('Three.js hero background failed to initialize:', error);
  }
}

/**
 * Clean up Three.js hero animations
 */
export function cleanupThreeHero() {
  if (heroAnimationId) {
    cancelAnimationFrame(heroAnimationId);
    heroAnimationId = null;
  }

  if (heroRenderer) {
    heroRenderer.dispose();
    heroRenderer = null;
  }

  if (heroScene) {
    // Dispose of all objects in scene
    heroScene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    heroScene = null;
  }

  heroCamera = null;
}

