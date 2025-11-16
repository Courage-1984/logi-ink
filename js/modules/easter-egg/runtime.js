import { isDevelopmentEnv } from '../../utils/env.js';
import { createSunTexture, createMoonTexture, createPlanetTexture } from '../../utils/celestial-textures.js';

/**
 * Easter Egg Module
 * Handles the black hole vortex effect and Milky Way animation
 */

let milkyWayScene = null;
let milkyWayRenderer = null;
let milkyWayCamera = null;
let milkyWayAnimationId = null;
let isEasterEggActive = false;

// Interactive controls
let isMouseDown = false;
const mouseX = 0;
const mouseY = 0;
let cameraRotationX = 0;
let cameraRotationY = 0;
let cameraDistance = 150;
let lastMouseX = 0;
let lastMouseY = 0;
let raycaster = null;
let mouse2D = null;

// Celestial bodies
let sun = null;
let planets = [];
let moons = [];
let centeredPlanet = null; // Currently centered planet
let scaffoldingInitialized = false;

/**
 * Initialize the easter egg
 */
function ensureScaffolding() {
  if (scaffoldingInitialized) {
    return;
  }

  scaffoldingInitialized = true;

  let vortex = document.querySelector('.easter-egg-vortex');
  if (!vortex) {
    vortex = document.createElement('div');
    vortex.className = 'easter-egg-vortex';
    document.body.appendChild(vortex);
  }

  let milkyWayContainer = document.querySelector('.milky-way-scene');
  if (!milkyWayContainer) {
    milkyWayContainer = document.createElement('div');
    milkyWayContainer.className = 'milky-way-scene';
    document.body.appendChild(milkyWayContainer);
  }

  let menu = document.querySelector('.milky-way-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.className = 'milky-way-menu';
    menu.style.display = 'none';
    menu.style.visibility = 'hidden';
    menu.style.opacity = '0';
    menu.style.pointerEvents = 'none';
    menu.style.width = '0';
    menu.style.height = '0';
    menu.style.overflow = 'hidden';
    document.body.appendChild(menu);
  }

  let toggle = menu.querySelector('.milky-way-menu-toggle');
  if (!toggle) {
    toggle = document.createElement('div');
    toggle.className = 'milky-way-menu-toggle';
    toggle.setAttribute('aria-label', 'Milky Way Menu');
    menu.appendChild(toggle);
  }

  const ensureDot = (index, label, handler) => {
    let dot = toggle.children[index];
    if (!dot) {
      dot = document.createElement('span');
      toggle.appendChild(dot);
    }
    dot.setAttribute('aria-label', label);
    dot.setAttribute('data-tooltip', label);
    if (!dot.dataset.eeBound) {
      dot.dataset.eeBound = 'true';
      dot.addEventListener('click', event => {
        event.stopPropagation();
        handler();
      });
    }
  };

  ensureDot(0, 'Toggle Fullscreen', toggleFullscreen);
  ensureDot(1, 'Reset View', resetView);
  ensureDot(2, 'Exit Milky Way', exitMilkyWay);
}

/**
 * Activate the easter egg - start vortex effect
 */
export function activateEasterEgg() {
  ensureScaffolding();

  if (isEasterEggActive) {
    return;
  }

  isEasterEggActive = true;
  const vortex = document.querySelector('.easter-egg-vortex');
  const milkyWayContainer = document.querySelector('.milky-way-scene');

  // Scroll to top immediately
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Hide all UI elements immediately
  const allElementsToHide = document.querySelectorAll(
    '.navbar, .back-to-top, .scroll-progress, .cursor-follow, .cursor-dot, nav, section, header, footer, .hero, .services-preview, .featured-projects, .cta-section, .threejs-canvas, .grid-overlay, .particles, .fluid-shape, .scroll-indicator'
  );
  allElementsToHide.forEach(el => {
    if (
      el &&
      !el.classList.contains('easter-egg-vortex') &&
      !el.classList.contains('milky-way-scene') &&
      !el.classList.contains('milky-way-menu') &&
      !el.classList.contains('milky-way-loading')
    ) {
      el.style.display = 'none';
    }
  });

  // Prevent scrolling
  document.body.classList.add('easter-egg-active');

  // Create loading animation - ensure it's perfectly centered
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'milky-way-loading';
  loadingDiv.innerHTML = `
        <div class="milky-way-loading-spinner"></div>
        <div class="milky-way-loading-text">LOADING GALAXY</div>
    `;
  document.body.appendChild(loadingDiv);
  // Force centering with inline styles as backup
  loadingDiv.style.position = 'fixed';
  loadingDiv.style.top = '50%';
  loadingDiv.style.left = '50%';
  loadingDiv.style.transform = 'translate(-50%, -50%)';
  loadingDiv.style.zIndex = '999999';
  loadingDiv.classList.add('active');

  // Activate vortex
  vortex.classList.add('active');

  // Start loading Three.js immediately (don't wait for vortex)
  const threeJSPromise = import('../../utils/three-loader.js').then(module => {
    return module.loadThreeJS().then(THREE => {
      if (THREE) {
        window.THREE = THREE;
      }
      return THREE;
    });
  }).catch(error => {
    if (isDevelopmentEnv()) {
      console.warn('[Easter Egg] Three.js preload failed:', error);
    }
    return null;
  });

  // After vortex animation, hide all content and show Milky Way
  setTimeout(() => {
    // Hide loading
    loadingDiv.classList.remove('active');
    setTimeout(() => loadingDiv.remove(), 500);

    // Mark body as ready to hide all content
    document.body.classList.add('milky-way-ready');

    // Ensure Milky Way container is properly positioned
    if (milkyWayContainer) {
      milkyWayContainer.style.position = 'fixed';
      milkyWayContainer.style.top = '0';
      milkyWayContainer.style.left = '0';
      milkyWayContainer.style.width = '100vw';
      milkyWayContainer.style.height = '100vh';
      milkyWayContainer.classList.add('active');
    }

    const menu = document.querySelector('.milky-way-menu');
    if (menu) {
      menu.classList.add('active');
      // Force menu visibility with inline styles - use setTimeout to ensure it applies
      setTimeout(() => {
        menu.style.cssText = `
                    display: flex !important;
                    flex-direction: row !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    pointer-events: all !important;
                    width: auto !important;
                    height: auto !important;
                    overflow: visible !important;
                    position: fixed !important;
                    bottom: 2rem !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    top: auto !important;
                    right: auto !important;
                    z-index: 2147483647 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                `;

        // Force toggle visibility with horizontal dots
        const toggle = menu.querySelector('.milky-way-menu-toggle');
        if (toggle) {
          toggle.style.cssText = `
                        display: flex !important;
                        flex-direction: row !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        width: auto !important;
                        height: auto !important;
                        position: relative !important;
                        top: auto !important;
                        left: auto !important;
                        z-index: 1 !important;
                        pointer-events: all !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 12px !important;
                        padding: 0 !important;
                        border: none !important;
                        background: transparent !important;
                    `;

          // Force span visibility with different colors
          const spans = toggle.querySelectorAll('span');
          if (spans.length >= 3) {
            // First dot - Cyan
            spans[0].style.cssText = `
                            width: 12px !important;
                            height: 12px !important;
                            background: #00ffff !important;
                            border-radius: 50% !important;
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                            flex-shrink: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            cursor: pointer !important;
                            box-shadow: 0 0 15px #00ffff, 0 0 25px rgba(0, 255, 255, 0.5), 0 0 35px rgba(0, 255, 255, 0.4) !important;
                        `;

            // Second dot - Magenta
            spans[1].style.cssText = `
                            width: 12px !important;
                            height: 12px !important;
                            background: #ff00ff !important;
                            border-radius: 50% !important;
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                            flex-shrink: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            cursor: pointer !important;
                            box-shadow: 0 0 15px #ff00ff, 0 0 25px rgba(255, 0, 255, 0.5), 0 0 35px rgba(255, 0, 255, 0.4) !important;
                        `;

            // Third dot - Green
            spans[2].style.cssText = `
                            width: 12px !important;
                            height: 12px !important;
                            background: #00ff00 !important;
                            border-radius: 50% !important;
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                            flex-shrink: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            cursor: pointer !important;
                            box-shadow: 0 0 15px #00ff00, 0 0 25px rgba(0, 255, 0, 0.5), 0 0 35px rgba(0, 255, 0, 0.4) !important;
                        `;
          }
        }
      }, 100);
    }

    // Force cursor to be visible
    document.body.style.cursor = 'default';
    document.documentElement.style.cursor = 'default';
    milkyWayContainer.style.cursor = 'crosshair';

    // Override any cursor: none styles
    const style = document.createElement('style');
    style.id = 'milky-way-cursor-override';
    style.textContent = `
            @media (hover: hover) and (pointer: fine) {
                body.easter-egg-active.milky-way-ready html,
                body.easter-egg-active.milky-way-ready body,
                body.easter-egg-active.milky-way-ready html *,
                body.easter-egg-active.milky-way-ready body *,
                body.easter-egg-active.milky-way-ready * {
                    cursor: default !important;
                }
                .milky-way-scene.active canvas {
                    cursor: crosshair !important;
                }
            }
        `;
    document.head.appendChild(style);

    initMilkyWay();
  }, 1500); // Reduced from 2000ms to 1500ms for faster loading
}

/**
 * Initialize the 3D Milky Way animation using Three.js
 * Optimized for faster loading with progressive enhancement
 */
async function initMilkyWay() {
  const container = document.querySelector('.milky-way-scene');
  if (!container) {
    return;
  }

  // Try to use preloaded Three.js, otherwise load it
  let THREE = window.THREE;
  if (!THREE) {
    try {
      const { loadThreeJS } = await import('../../utils/three-loader.js');
      THREE = await loadThreeJS();
      if (!THREE) {
        return;
      }
      window.THREE = THREE;
    } catch (error) {
      if (isDevelopmentEnv()) {
        console.warn('[Easter Egg] Three.js loading failed:', error);
      }
      return;
    }
  }

  // Scene setup
  milkyWayScene = new THREE.Scene();

  // Camera setup
  milkyWayCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  milkyWayCamera.position.z = 100;

  // Renderer setup
  milkyWayRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  milkyWayRenderer.setSize(window.innerWidth, window.innerHeight);
  milkyWayRenderer.setPixelRatio(window.devicePixelRatio);

  // Ensure canvas is properly styled
  const canvas = milkyWayRenderer.domElement;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.zIndex = '99999'; /* Higher z-index to ensure it's above everything */
  canvas.style.pointerEvents = 'all'; /* Ensure canvas receives pointer events */
  canvas.style.background = 'transparent'; /* Transparent background */

  container.appendChild(canvas);

  // Create Milky Way galaxy
  createMilkyWayGalaxy();

  // Create celestial bodies (sun, planets, moons)
  createCelestialBodies();

  // Setup interactive controls
  setupInteractiveControls();

  // Handle window resize
  window.addEventListener('resize', onMilkyWayResize);

  // Handle fullscreen changes (F11 browser fullscreen)
  const handleFullscreenChange = () => {
    const menu = document.querySelector('.milky-way-menu');
    if (!menu) {
      return;
    }

    // Get the fullscreen element
    const fullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (menu.classList.contains('active')) {
      // If in fullscreen, move menu to fullscreen element or ensure it's visible
      if (fullscreenElement !== null) {
        // Try to move menu to fullscreen element if it's not already there
        if (fullscreenElement !== menu.parentElement) {
          fullscreenElement.appendChild(menu);
        }

        // Force menu to stay visible in fullscreen
        menu.style.cssText = `
                    display: flex !important;
                    flex-direction: row !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    pointer-events: all !important;
                    width: auto !important;
                    height: auto !important;
                    overflow: visible !important;
                    position: fixed !important;
                    bottom: 2rem !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    top: auto !important;
                    right: auto !important;
                    z-index: 2147483647 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                `;

        // Also ensure toggle is visible
        const toggle = menu.querySelector('.milky-way-menu-toggle');
        if (toggle) {
          toggle.style.cssText = `
                        display: flex !important;
                        flex-direction: row !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        width: auto !important;
                        height: auto !important;
                        position: relative !important;
                        pointer-events: all !important;
                        gap: 12px !important;
                        overflow: visible !important;
                    `;

          // Ensure dots are visible with proper colors
          const spans = toggle.querySelectorAll('span');
          spans.forEach((span, index) => {
            if (index === 0) {
              span.style.cssText = `
                                width: 12px !important;
                                height: 12px !important;
                                background: #00ffff !important;
                                border-radius: 50% !important;
                                display: block !important;
                                opacity: 1 !important;
                                visibility: visible !important;
                                cursor: pointer !important;
                                position: relative !important;
                                overflow: visible !important;
                            `;
            } else if (index === 1) {
              span.style.cssText = `
                                width: 12px !important;
                                height: 12px !important;
                                background: #ff00ff !important;
                                border-radius: 50% !important;
                                display: block !important;
                                opacity: 1 !important;
                                visibility: visible !important;
                                cursor: pointer !important;
                                position: relative !important;
                                overflow: visible !important;
                            `;
            } else if (index === 2) {
              span.style.cssText = `
                                width: 12px !important;
                                height: 12px !important;
                                background: #00ff00 !important;
                                border-radius: 50% !important;
                                display: block !important;
                                opacity: 1 !important;
                                visibility: visible !important;
                                cursor: pointer !important;
                                position: relative !important;
                                overflow: visible !important;
                            `;
            }
          });
        }
      } else {
        // Not in fullscreen - ensure menu is in body
        if (menu.parentElement !== document.body) {
          document.body.appendChild(menu);
        }
      }
    }
  };

  // Listen for fullscreen changes (F11) - multiple events for compatibility
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Also check immediately in case already in fullscreen
  setTimeout(handleFullscreenChange, 100);

  // Start animation loop
  animateMilkyWay();
}

/**
 * Create the Milky Way galaxy with spiral arms
 * Optimized for faster generation using chunked processing
 */
function createMilkyWayGalaxy() {
  const parameters = {
    count: 100000,
    size: 0.02,
    radius: 50,
    branches: 4,
    spin: 1,
    randomness: 0.5,
    randomnessPower: 3,
    insideColor: '#ff0080',
    outsideColor: '#00ffff',
  };

  // Create geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  // Optimized generation - pre-calculate random values
  const randomValues = new Float32Array(parameters.count * 4);
  for (let i = 0; i < randomValues.length; i++) {
    randomValues[i] = Math.random();
  }

  // Generate positions for spiral galaxy (optimized loop)
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const rIdx = i * 4;

    // Spiral position
    const radius = randomValues[rIdx] * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    // Add randomness (using pre-calculated values)
    const randomPowerX = Math.pow(randomValues[rIdx + 1], parameters.randomnessPower);
    const randomPowerY = Math.pow(randomValues[rIdx + 2], parameters.randomnessPower);
    const randomPowerZ = Math.pow(randomValues[rIdx + 3], parameters.randomnessPower);
    const randomSignX = (i % 3) === 0 ? 1 : -1;
    const randomSignY = (i % 5) === 0 ? 1 : -1;
    const randomSignZ = (i % 7) === 0 ? 1 : -1;

    const randomX = randomPowerX * randomSignX * parameters.randomness * radius;
    const randomY = randomPowerY * randomSignY * parameters.randomness * radius;
    const randomZ = randomPowerZ * randomSignZ * parameters.randomness * radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color mixing based on distance from center
    const colorMix = radius / parameters.radius;
    colors[i3] = colorInside.r + (colorOutside.r - colorInside.r) * colorMix;
    colors[i3 + 1] = colorInside.g + (colorOutside.g - colorInside.g) * colorMix;
    colors[i3 + 2] = colorInside.b + (colorOutside.b - colorInside.b) * colorMix;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Create material
  const material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  // Create points
  const points = new THREE.Points(geometry, material);
  milkyWayScene.add(points);

  // Add some bright stars in the center
  const centerStarsGeometry = new THREE.BufferGeometry();
  const centerStarsPositions = new Float32Array(1000 * 3);
  const centerStarsColors = new Float32Array(1000 * 3);

  for (let i = 0; i < 1000; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    centerStarsPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    centerStarsPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    centerStarsPositions[i3 + 2] = radius * Math.cos(phi);

    // Bright white/yellow for center
    const brightness = Math.random() * 0.5 + 0.5;
    centerStarsColors[i3] = brightness;
    centerStarsColors[i3 + 1] = brightness;
    centerStarsColors[i3 + 2] = brightness * 0.8;
  }

  centerStarsGeometry.setAttribute('position', new THREE.BufferAttribute(centerStarsPositions, 3));
  centerStarsGeometry.setAttribute('color', new THREE.BufferAttribute(centerStarsColors, 3));

  const centerStarsMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  const centerStars = new THREE.Points(centerStarsGeometry, centerStarsMaterial);
  milkyWayScene.add(centerStars);

  // Store for animation
  milkyWayScene.userData.galaxy = points;
  milkyWayScene.userData.centerStars = centerStars;
}

/**
 * Create celestial bodies (sun, planets, moons)
 */
function createCelestialBodies() {
  // Use lower resolution textures initially for faster loading (0.5x = 1024x512)
  // Textures can be upgraded later if needed
  const initialTextureResolution = 0.5;

  // Create Sun at the center with texture
  const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
  const sunTexture = createSunTexture(initialTextureResolution);
  const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1.5,
  });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(0, 0, 0);
  milkyWayScene.add(sun);

  // Add glow effect to sun
  const sunGlowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
  const sunGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.3,
  });
  const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
  sun.add(sunGlow);

  // Create unique planets with interesting characteristics
  // Orbital inclinations are in degrees (realistic range: 0-7° for most planets)
  const planetConfigs = [
    {
      name: 'Pyro',
      size: 0.6,
      distance: 12,
      color: 0xff4500,
      speed: 0.004,
      moons: 0,
      emissive: 0xff6600,
      inclination: 6.3, // Similar to Mercury's inclination
    }, // Very fast, hot planet
    {
      name: 'Crystal',
      size: 0.8,
      distance: 18,
      color: 0x00ffff,
      speed: 0.003,
      moons: 2,
      emissive: 0x66ffff,
      inclination: 3.4, // Similar to Venus's inclination
    }, // Fast ice planet with moons
    {
      name: 'Terra',
      size: 0.9,
      distance: 25,
      color: 0x4a90e2,
      speed: 0.002,
      moons: 1,
      emissive: 0x6ab3ff,
      inclination: 0, // Reference plane (like Earth)
    }, // Earth-like
    {
      name: 'Vermillion',
      size: 0.7,
      distance: 32,
      color: 0xff1493,
      speed: 0.0015,
      moons: 3,
      emissive: 0xff69b4,
      inclination: 1.9, // Similar to Mars's inclination
    }, // Pink planet with many moons
    {
      name: 'Titan',
      size: 1.8,
      distance: 45,
      color: 0xffa500,
      speed: 0.001,
      moons: 5,
      emissive: 0xffb347,
      inclination: 1.3, // Similar to Jupiter's inclination
    }, // Large gas giant
    {
      name: 'Nebula',
      size: 1.4,
      distance: 58,
      color: 0x9370db,
      speed: 0.0008,
      moons: 4,
      emissive: 0xba90ff,
      inclination: 2.5, // Similar to Saturn's inclination
    }, // Purple gas giant
    {
      name: 'Aurora',
      size: 1.1,
      distance: 72,
      color: 0x00ff7f,
      speed: 0.0006,
      moons: 2,
      emissive: 0x40ff9f,
      inclination: 0.8, // Similar to Uranus's inclination
    }, // Green planet
    {
      name: 'Obsidian',
      size: 0.95,
      distance: 88,
      color: 0x2f4f4f,
      speed: 0.0004,
      moons: 1,
      emissive: 0x4a6a6a,
      inclination: 1.8, // Similar to Neptune's inclination
    }, // Dark planet
  ];

  planetConfigs.forEach((config, index) => {
    // Create planet with texture
    const planetGeometry = new THREE.SphereGeometry(config.size, 32, 32);

    // Generate procedural texture for planet (lower resolution for faster loading)
    const texture = createPlanetTexture(config.name, config.color, config.size, initialTextureResolution);

    const planetMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      color: config.color,
      emissive: config.emissive || config.color,
      emissiveIntensity: 0.2,
      shininess: 30,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    // Position planet in orbit with orbital inclination
    const angle = (index / planetConfigs.length) * Math.PI * 2;
    const inclination = (config.inclination || 0) * (Math.PI / 180); // Convert to radians

    // Calculate position in flat orbit plane
    const flatX = Math.cos(angle) * config.distance;
    const flatZ = Math.sin(angle) * config.distance;

    // Apply orbital inclination rotation around X-axis
    // This tilts the orbit up/down
    planet.position.x = flatX;
    planet.position.y = flatZ * Math.sin(inclination);
    planet.position.z = flatZ * Math.cos(inclination);

    planet.userData = {
      name: config.name,
      distance: config.distance,
      angle: angle,
      speed: config.speed,
      initialAngle: angle,
      size: config.size,
      inclination: inclination, // Store in radians
    };

    // Make planet clickable
    planet.userData.clickable = true;
    planet.cursor = 'pointer';

    milkyWayScene.add(planet);
    planets.push(planet);

    // Add moons to planets
    for (let m = 0; m < config.moons; m++) {
      const moonGeometry = new THREE.SphereGeometry(config.size * 0.3, 16, 16);
      // Create simple moon texture (lower resolution for faster loading)
      const moonTexture = createMoonTexture(initialTextureResolution);
      const moonMaterial = new THREE.MeshPhongMaterial({
        map: moonTexture,
        color: 0xcccccc,
        emissive: 0x444444,
        emissiveIntensity: 0.1,
      });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);

      const moonDistance = config.size * 1.5 + m * config.size * 0.5;
      const moonAngle = (m / config.moons) * Math.PI * 2;
      moon.position.x = moonDistance;
      moon.userData = {
        distance: moonDistance,
        angle: moonAngle,
        speed: config.speed * 1.5, // Moons orbit faster but still slower
        parentPlanet: planet,
      };

      planet.add(moon);
      moons.push(moon);
    }
  });

  // Add ambient light for planets
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  milkyWayScene.add(ambientLight);

  // Add point light from sun
  const sunLight = new THREE.PointLight(0xffff00, 1, 200);
  sunLight.position.set(0, 0, 0);
  milkyWayScene.add(sunLight);
}

/**
 * Setup interactive controls
 */
function setupInteractiveControls() {
  const container = document.querySelector('.milky-way-scene');
  if (!container) {
    return;
  }

  // Mouse wheel for zoom (increased max zoom) - also exit planet focus when zooming out enough
  container.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      const delta = e.deltaY * 0.01;
      const oldDistance = cameraDistance;
      cameraDistance = Math.max(1, Math.min(1000, cameraDistance + delta));

      // If zoomed out far enough while focused on a planet, exit planet focus mode
      if (centeredPlanet && cameraDistance > 200) {
        centeredPlanet = null;
        // Reset to galaxy view
        cameraRotationX = 0;
        cameraRotationY = 0;
        cameraDistance = 150;
      }
    },
    { passive: false }
  );

  // Mouse down for drag rotation
  container.addEventListener('mousedown', e => {
    isMouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    container.style.cursor = 'grabbing';
  });

  // Mouse up
  document.addEventListener('mouseup', () => {
    isMouseDown = false;
    if (container) {
      container.style.cursor = 'grab';
    }
  });

  // Mouse move for rotation
  document.addEventListener('mousemove', e => {
    if (!isMouseDown || !isEasterEggActive) {
      return;
    }

    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    cameraRotationY += deltaX * 0.005;
    cameraRotationX += deltaY * 0.005;

    // Limit vertical rotation
    cameraRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotationX));

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  // Set initial cursor
  container.style.cursor = 'grab';

  // Initialize raycaster for planet clicking
  raycaster = new THREE.Raycaster();
  mouse2D = new THREE.Vector2();

  // Add click handler for planets and sun
  container.addEventListener('click', e => {
    if (!isEasterEggActive || isMouseDown) {
      return;
    }

    // Calculate mouse position in normalized device coordinates
    const rect = container.getBoundingClientRect();
    mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse2D, milkyWayCamera);

    // Check for sun intersection first (it's at center)
    const sunIntersects = sun ? raycaster.intersectObject(sun) : [];

    if (sunIntersects.length > 0) {
      centerOnPlanet(sun);
      return;
    }

    // Check for planet intersections
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
      const planet = intersects[0].object;
      centerOnPlanet(planet);
    }
  });
}

/**
 * Center camera on a planet with smooth animation
 */
let isAnimatingToPlanet = false;
let planetAnimationId = null;

function centerOnPlanet(planet) {
  if (!planet || isAnimatingToPlanet) {
    return;
  }

  // Cancel any existing animation
  if (planetAnimationId) {
    cancelAnimationFrame(planetAnimationId);
    planetAnimationId = null;
  }

  isAnimatingToPlanet = true;

  // Store initial camera state
  const startX = milkyWayCamera.position.x;
  const startY = milkyWayCamera.position.y;
  const startZ = milkyWayCamera.position.z;
  const startRotationX = cameraRotationX;
  const startRotationY = cameraRotationY;

  // Get planet position (sun is at 0,0,0, planets have userData with position)
  const initialPlanetPos = planet.position.clone();

  // Determine target distance based on size
  let baseDistance;
  if (planet === sun) {
    baseDistance = 15;
  } else if (planet.userData && planet.userData.size) {
    baseDistance = planet.userData.size * 8;
  } else {
    baseDistance = 20;
  }

  // Calculate current distance to planet
  const currentDistToPlanet = milkyWayCamera.position.distanceTo(initialPlanetPos);

  // ALWAYS start zoom from far away (8x target distance) for dramatic effect
  // If we're already closer, we'll still zoom from far to create smooth animation
  const zoomStartDistance = Math.max(currentDistToPlanet * 1.5, baseDistance * 8);
  const targetDistance = baseDistance;

  // Calculate direction from camera to planet
  const directionToPlanet = new THREE.Vector3();
  directionToPlanet.subVectors(initialPlanetPos, milkyWayCamera.position).normalize();

  // Calculate target rotation angles
  const targetRotationY = Math.atan2(initialPlanetPos.x, initialPlanetPos.z);
  const targetRotationX = 0; // Level view

  // Calculate the final target position (close to planet)
  const finalTargetPos = new THREE.Vector3(
    initialPlanetPos.x + Math.sin(targetRotationY) * Math.cos(targetRotationX) * targetDistance,
    initialPlanetPos.y + Math.sin(targetRotationX) * targetDistance,
    initialPlanetPos.z + Math.cos(targetRotationY) * Math.cos(targetRotationX) * targetDistance
  );

  let progress = 0;
  const duration = 3000; // 3 seconds for smooth zoom
  const startTime = Date.now();

  function animateCameraToPlanet() {
    if (!isEasterEggActive) {
      isAnimatingToPlanet = false;
      return;
    }

    progress = (Date.now() - startTime) / duration;
    if (progress > 1) {
      progress = 1;
    }

    // Smooth ease in-out for zoom effect
    const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Calculate current planet position (it's orbiting)
    const currentPlanetPos = planet.position.clone();

    // Interpolate distance smoothly from far to close
    const currentDistance = zoomStartDistance + (targetDistance - zoomStartDistance) * ease;

    // Interpolate camera rotation smoothly
    cameraRotationY = startRotationY + (targetRotationY - startRotationY) * ease;
    cameraRotationX = startRotationX + (targetRotationX - startRotationX) * ease;
    cameraDistance = currentDistance;

    // Calculate where camera should be at current distance from planet
    const currentTargetPos = new THREE.Vector3(
      currentPlanetPos.x + Math.sin(cameraRotationY) * Math.cos(cameraRotationX) * currentDistance,
      currentPlanetPos.y + Math.sin(cameraRotationX) * currentDistance,
      currentPlanetPos.z + Math.cos(cameraRotationY) * Math.cos(cameraRotationX) * currentDistance
    );

    // Smoothly interpolate camera position from start to current target
    // This creates the smooth zoom-in effect moving towards the planet
    milkyWayCamera.position.x = startX + (currentTargetPos.x - startX) * ease;
    milkyWayCamera.position.y = startY + (currentTargetPos.y - startY) * ease;
    milkyWayCamera.position.z = startZ + (currentTargetPos.z - startZ) * ease;

    // Always look at the planet as we zoom in
    milkyWayCamera.lookAt(currentPlanetPos);

    // Render the scene during animation
    if (milkyWayRenderer && milkyWayScene && milkyWayCamera) {
      milkyWayRenderer.render(milkyWayScene, milkyWayCamera);
    }

    if (progress < 1) {
      planetAnimationId = requestAnimationFrame(animateCameraToPlanet);
    } else {
      // Animation complete - set as centered
      centeredPlanet = planet;
      isAnimatingToPlanet = false;
      planetAnimationId = null;
    }
  }

  animateCameraToPlanet();
}

/**
 * Animate the Milky Way
 */
function animateMilkyWay() {
  if (!isEasterEggActive) {
    return;
  }

  milkyWayAnimationId = requestAnimationFrame(animateMilkyWay);

  // Rotate the galaxy (slower)
  if (milkyWayScene && milkyWayScene.userData.galaxy) {
    milkyWayScene.userData.galaxy.rotation.y += 0.0003;
  }

  // Rotate center stars (slower)
  if (milkyWayScene && milkyWayScene.userData.centerStars) {
    milkyWayScene.userData.centerStars.rotation.y += 0.0006;
    milkyWayScene.userData.centerStars.rotation.x += 0.0003;
  }

  // Rotate sun (slower)
  if (sun) {
    sun.rotation.y += 0.001;
  }

  // Animate planets in orbit
  planets.forEach(planet => {
    planet.userData.angle += planet.userData.speed;

    // Calculate position in flat orbit plane
    const flatX = Math.cos(planet.userData.angle) * planet.userData.distance;
    const flatZ = Math.sin(planet.userData.angle) * planet.userData.distance;

    // Apply orbital inclination rotation around X-axis
    const inclination = planet.userData.inclination || 0;
    planet.position.x = flatX;
    planet.position.y = flatZ * Math.sin(inclination);
    planet.position.z = flatZ * Math.cos(inclination);
    planet.rotation.y += 0.002; // Slower planet rotation
  });

  // Animate moons around their planets
  moons.forEach(moon => {
    moon.userData.angle += moon.userData.speed;
    const parentPlanet = moon.userData.parentPlanet;
    moon.position.x = Math.cos(moon.userData.angle) * moon.userData.distance;
    moon.position.z = Math.sin(moon.userData.angle) * moon.userData.distance;
  });

  // Update camera position based on interactive controls or centered planet
  if (milkyWayCamera) {
    // Don't update camera during planet animation - let the animation handle it
    if (isAnimatingToPlanet) {
      // Camera position is being animated, skip normal update but still render
      if (milkyWayRenderer && milkyWayScene && milkyWayCamera) {
        milkyWayRenderer.render(milkyWayScene, milkyWayCamera);
      }
      return;
    }

    if (centeredPlanet) {
      // If centered on a planet, keep looking at it (follow its orbit)
      const planetPos = centeredPlanet.position.clone();

      // Update camera position to maintain distance and rotation relative to planet
      const x =
        planetPos.x + Math.sin(cameraRotationY) * Math.cos(cameraRotationX) * cameraDistance;
      const y = planetPos.y + Math.sin(cameraRotationX) * cameraDistance;
      const z =
        planetPos.z + Math.cos(cameraRotationY) * Math.cos(cameraRotationX) * cameraDistance;

      milkyWayCamera.position.x = x;
      milkyWayCamera.position.y = y;
      milkyWayCamera.position.z = z;
      milkyWayCamera.lookAt(planetPos);

      // Auto-exit planet/sun focus if zoomed out too far
      let maxDistance;
      if (centeredPlanet === sun) {
        maxDistance = 50; // Sun exit distance
      } else {
        maxDistance = 200; // Planet exit distance
      }

      if (cameraDistance > maxDistance) {
        centeredPlanet = null;
        cameraRotationX = 0;
        cameraRotationY = 0;
        cameraDistance = 150;
      }
    } else {
      // Normal camera rotation around center
      const x = Math.sin(cameraRotationY) * Math.cos(cameraRotationX) * cameraDistance;
      const y = Math.sin(cameraRotationX) * cameraDistance;
      const z = Math.cos(cameraRotationY) * Math.cos(cameraRotationX) * cameraDistance;

      milkyWayCamera.position.x = x;
      milkyWayCamera.position.y = y;
      milkyWayCamera.position.z = z;
      milkyWayCamera.lookAt(0, 0, 0);
    }
  }

  if (milkyWayRenderer && milkyWayScene && milkyWayCamera) {
    milkyWayRenderer.render(milkyWayScene, milkyWayCamera);
  }
}

/**
 * Handle window resize for Milky Way
 */
function onMilkyWayResize() {
  if (!milkyWayCamera || !milkyWayRenderer) {
    return;
  }

  milkyWayCamera.aspect = window.innerWidth / window.innerHeight;
  milkyWayCamera.updateProjectionMatrix();
  milkyWayRenderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // Enter fullscreen
    const container = document.querySelector('.milky-way-scene');
    if (container) {
      container.requestFullscreen().catch(() => {
        // Fullscreen request failed - silently fail
      });
    }
  } else {
    // Exit fullscreen
    document.exitFullscreen().catch(() => {
      // Fullscreen exit failed - silently fail
    });
  }
}

/**
 * Reset camera view to default position
 */
function resetView() {
  // Cancel any planet animation
  if (planetAnimationId) {
    cancelAnimationFrame(planetAnimationId);
    planetAnimationId = null;
  }
  isAnimatingToPlanet = false;

  cameraRotationX = 0;
  cameraRotationY = 0;
  cameraDistance = 150;
  centeredPlanet = null; // Reset centered planet
}

/**
 * Exit the Milky Way and return to normal view
 */
function exitMilkyWay() {
  if (!isEasterEggActive) {
    return;
  }

  isEasterEggActive = false;

  // Stop animation
  if (milkyWayAnimationId) {
    cancelAnimationFrame(milkyWayAnimationId);
    milkyWayAnimationId = null;
  }

  // Clean up Three.js
  if (milkyWayRenderer) {
    const container = document.querySelector('.milky-way-scene');
    if (container && milkyWayRenderer.domElement) {
      container.removeChild(milkyWayRenderer.domElement);
    }
    milkyWayRenderer.dispose();
    milkyWayRenderer = null;
  }

  if (milkyWayScene) {
    // Dispose of geometries and materials
    milkyWayScene.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    milkyWayScene = null;
  }

  milkyWayCamera = null;

  // Remove cursor override style
  const cursorOverride = document.getElementById('milky-way-cursor-override');
  if (cursorOverride) {
    cursorOverride.remove();
  }

  // Clean up celestial bodies
  sun = null;
  planets = [];
  moons = [];

  // Reset interactive controls
  isMouseDown = false;
  cameraRotationX = 0;
  cameraRotationY = 0;
  cameraDistance = 150;

  // Cancel any planet animation
  if (planetAnimationId) {
    cancelAnimationFrame(planetAnimationId);
    planetAnimationId = null;
  }
  isAnimatingToPlanet = false;
  centeredPlanet = null;

  // Hide Milky Way
  const milkyWayContainer = document.querySelector('.milky-way-scene');
  if (milkyWayContainer) {
    milkyWayContainer.classList.remove('active');
    milkyWayContainer.style.cursor = '';
  }

  // Hide menu completely
  const menu = document.querySelector('.milky-way-menu');
  if (menu) {
    menu.classList.remove('active');
    menu.style.display = 'none';
    menu.style.visibility = 'hidden';
    menu.style.opacity = '0';
    menu.style.pointerEvents = 'none';
    menu.style.width = '0';
    menu.style.height = '0';
    menu.style.overflow = 'hidden';
  }

  // Exit fullscreen if active
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }

  // Remove milky-way-ready class to restore content
  document.body.classList.remove('milky-way-ready');

  // Reverse vortex effect
  const vortex = document.querySelector('.easter-egg-vortex');
  if (vortex) {
    vortex.classList.remove('active');
  }

  // Restore page
  setTimeout(() => {
    document.body.classList.remove('easter-egg-active');
    document.body.classList.remove('milky-way-ready');

    // Restore cursor
    document.body.style.cursor = '';

    // Restore all UI elements
    const allElements = document.querySelectorAll(
      '.navbar, .back-to-top, .scroll-progress, .cursor-follow, .cursor-dot, nav, section, header, footer, .hero, .services-preview, .featured-projects, .cta-section, .threejs-canvas, .grid-overlay, .particles, .fluid-shape, .scroll-indicator'
    );
    allElements.forEach(el => {
      if (el) {
        el.style.display = '';
        el.style.visibility = '';
        el.style.opacity = '';
        el.style.pointerEvents = '';
      }
    });

    // Reset all elements
    document
      .querySelectorAll('*:not(.easter-egg-vortex):not(.milky-way-scene):not(.milky-way-menu)')
      .forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = null;
      });
  }, 500);
}
