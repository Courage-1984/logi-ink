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

/**
 * Initialize the easter egg
 */
export function initEasterEgg() {
  // Prevent double initialization
  if (window.easterEggInitialized) {
    return;
  }
  window.easterEggInitialized = true;

  // Check if containers already exist (created by inline script)
  let vortex = document.querySelector('.easter-egg-vortex');
  let milkyWayContainer = document.querySelector('.milky-way-scene');

  // Create vortex container if it doesn't exist
  if (!vortex) {
    vortex = document.createElement('div');
    vortex.className = 'easter-egg-vortex';
    document.body.appendChild(vortex);
  }

  // Create Milky Way scene container if it doesn't exist
  if (!milkyWayContainer) {
    milkyWayContainer = document.createElement('div');
    milkyWayContainer.className = 'milky-way-scene';
    document.body.appendChild(milkyWayContainer);
  }

  // Create menu (3-dot menu) if it doesn't exist
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

    const toggle = document.createElement('div');
    toggle.className = 'milky-way-menu-toggle';
    toggle.setAttribute('aria-label', 'Milky Way Menu');

    // Create three dots with different colors and tooltips
    const dot1 = document.createElement('span');
    dot1.setAttribute('aria-label', 'Toggle Fullscreen');
    dot1.setAttribute('data-tooltip', 'Toggle Fullscreen');
    dot1.addEventListener('click', e => {
      e.stopPropagation();
      toggleFullscreen();
    });

    const dot2 = document.createElement('span');
    dot2.setAttribute('aria-label', 'Reset View');
    dot2.setAttribute('data-tooltip', 'Reset View');
    dot2.addEventListener('click', e => {
      e.stopPropagation();
      resetView();
    });

    const dot3 = document.createElement('span');
    dot3.setAttribute('aria-label', 'Exit Milky Way');
    dot3.setAttribute('data-tooltip', 'Exit Milky Way');
    dot3.addEventListener('click', e => {
      e.stopPropagation();
      exitMilkyWay();
    });

    toggle.appendChild(dot1);
    toggle.appendChild(dot2);
    toggle.appendChild(dot3);

    menu.appendChild(toggle);
    document.body.appendChild(menu);
  }

  // Setup trigger: Click logo 3 times quickly (within 2 seconds)
  let logoClickCount = 0;
  let logoClickTimer = null;
  const logo = document.querySelector('.logo');

  if (logo) {
    const logoLink = logo.querySelector('a');

    logo.addEventListener(
      'click',
      e => {
        // Always prevent default to handle the timing
        e.preventDefault();
        e.stopPropagation();

        logoClickCount++;
        clearTimeout(logoClickTimer);

        if (logoClickCount === 1) {
          logo.classList.add('easter-egg-ready');
        }

        if (logoClickCount >= 3) {
          // Three clicks - activate easter egg
          logoClickCount = 0;
          logo.classList.remove('easter-egg-ready');
          clearTimeout(logoClickTimer);
          activateEasterEgg();
        } else {
          // Set timer to navigate after 2 seconds if not 3 clicks
          logoClickTimer = setTimeout(() => {
            const count = logoClickCount; // Save count before reset
            logoClickCount = 0;
            logo.classList.remove('easter-egg-ready');
            // If only 1-2 clicks, navigate normally
            if (count < 3 && logoLink) {
              window.location.href = logoLink.href;
            }
          }, 2000);
        }
      },
      true
    ); // Use capture phase to intercept before link click
  }

  // Footer trigger: Clickable text in footer
  const footerBottom = document.querySelector('.footer-bottom');
  if (footerBottom) {
    const footerText = footerBottom.querySelector('p');
    if (footerText && !footerText.querySelector('.footer-easter-egg-trigger')) {
      // Add creative trigger text
      const triggerText = document.createElement('span');
      triggerText.className = 'footer-easter-egg-trigger';
      triggerText.textContent = 'Made among the stars';
      triggerText.setAttribute('aria-label', 'Easter Egg');
      triggerText.title = 'Click to explore';

      // Insert before the copyright text with separator
      // Order: triggerText, separator, existing content
      const separator = document.createTextNode(' • ');
      if (footerText.firstChild) {
        footerText.insertBefore(separator, footerText.firstChild);
        footerText.insertBefore(triggerText, separator);
      } else {
        footerText.appendChild(triggerText);
        footerText.appendChild(separator);
      }

      triggerText.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        activateEasterEgg();
      });
    }
  }
}

/**
 * Activate the easter egg - start vortex effect
 */
function activateEasterEgg() {
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
  }, 2000);
}

/**
 * Initialize the 3D Milky Way animation using Three.js
 */
async function initMilkyWay() {
  const container = document.querySelector('.milky-way-scene');
  if (!container) {
    return;
  }

  // Load Three.js dynamically
  try {
    const { loadThreeJS } = await import('../utils/three-loader.js');
    const THREE = await loadThreeJS();
    if (!THREE) {
      // Three.js failed to load - gracefully degrade
      return;
    }
    // Make THREE available globally for the rest of the function
    window.THREE = THREE;
  } catch (error) {
    // Three.js loading failed - gracefully degrade
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Easter Egg] Three.js loading failed:', error);
    }
    return;
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

  // Generate positions for spiral galaxy
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Spiral position
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    // Add randomness
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color mixing based on distance from center
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
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
 * Create complex sun texture with detailed solar features
 */
function createSunTexture() {
  const canvas = document.createElement('canvas');
  const resolution = 1024; // Increased resolution for better detail
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');

  // Multi-layered radial gradient for deep sun core
  const coreGradient = ctx.createRadialGradient(
    resolution / 2,
    resolution / 2,
    0,
    resolution / 2,
    resolution / 2,
    (resolution / 2) * 0.8
  );
  coreGradient.addColorStop(0, '#ffffff'); // White hot core
  coreGradient.addColorStop(0.1, '#ffff88'); // Bright yellow
  coreGradient.addColorStop(0.25, '#ffcc00'); // Gold
  coreGradient.addColorStop(0.4, '#ff9900'); // Orange
  coreGradient.addColorStop(0.6, '#ff6600'); // Deep orange
  coreGradient.addColorStop(0.8, '#ff4400'); // Red-orange
  coreGradient.addColorStop(1, '#cc2200'); // Deep red

  ctx.fillStyle = coreGradient;
  ctx.fillRect(0, 0, resolution, resolution);

  // Add complex solar surface turbulence
  const turbulenceLayers = 8;
  for (let layer = 0; layer < turbulenceLayers; layer++) {
    const layerRadius = (resolution / 2) * (0.3 + layer * 0.1);
    const layerOpacity = 0.3 / (layer + 1);

    for (let i = 0; i < 50 + layer * 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * layerRadius;
      const x = resolution / 2 + Math.cos(angle) * dist;
      const y = resolution / 2 + Math.sin(angle) * dist;
      const radius = Math.random() * (15 - layer * 1.5) + 5;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const brightness = Math.random() * 0.3 + 0.7;
      gradient.addColorStop(
        0,
        `rgba(255, ${200 * brightness}, ${50 * brightness}, ${layerOpacity})`
      );
      gradient.addColorStop(1, `rgba(255, ${100 * brightness}, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add detailed solar flares with multiple layers
  const flareCount = 40;
  for (let i = 0; i < flareCount; i++) {
    const angle = (i / flareCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const baseRadius = resolution / 2 - 30;
    const flareLength = Math.random() * 40 + 20;

    // Main flare
    const x1 = resolution / 2 + Math.cos(angle) * baseRadius;
    const y1 = resolution / 2 + Math.sin(angle) * baseRadius;
    const x2 = resolution / 2 + Math.cos(angle) * (baseRadius + flareLength);
    const y2 = resolution / 2 + Math.sin(angle) * (baseRadius + flareLength);

    // Create gradient along flare
    const flareGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    flareGradient.addColorStop(0, `rgba(255, 255, 200, ${Math.random() * 0.4 + 0.3})`);
    flareGradient.addColorStop(0.5, `rgba(255, 200, 100, ${Math.random() * 0.3 + 0.2})`);
    flareGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');

    ctx.strokeStyle = flareGradient;
    ctx.lineWidth = Math.random() * 4 + 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Add secondary smaller flares
    if (Math.random() > 0.5) {
      const offsetAngle = angle + (Math.random() - 0.5) * 0.5;
      const x3 = resolution / 2 + Math.cos(offsetAngle) * (baseRadius + flareLength * 0.5);
      const y3 = resolution / 2 + Math.sin(offsetAngle) * (baseRadius + flareLength * 0.5);
      const x4 = resolution / 2 + Math.cos(offsetAngle) * (baseRadius + flareLength * 0.8);
      const y4 = resolution / 2 + Math.sin(offsetAngle) * (baseRadius + flareLength * 0.8);

      ctx.strokeStyle = `rgba(255, 220, 150, ${Math.random() * 0.3 + 0.2})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
    }
  }

  // Add plasma loops and arcs
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const startRadius = (resolution / 2) * (0.4 + Math.random() * 0.3);
    const endRadius = startRadius + Math.random() * 30;
    const arcAngle = (Math.random() - 0.5) * Math.PI * 0.5;

    ctx.strokeStyle = `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 100}, ${Math.random() * 0.4 + 0.2})`;
    ctx.lineWidth = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(
      resolution / 2,
      resolution / 2,
      (startRadius + endRadius) / 2,
      angle - arcAngle / 2,
      angle + arcAngle / 2
    );
    ctx.stroke();
  }

  // Add detailed sunspots with penumbra and umbra
  const sunspotCount = 15;
  for (let i = 0; i < sunspotCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * resolution * 0.35;
    const x = resolution / 2 + Math.cos(angle) * dist;
    const y = resolution / 2 + Math.sin(angle) * dist;
    const umbraRadius = Math.random() * 25 + 8; // Dark center
    const penumbraRadius = umbraRadius * (1.8 + Math.random() * 0.4); // Lighter outer ring

    // Penumbra (lighter outer ring)
    const penumbraGradient = ctx.createRadialGradient(x, y, umbraRadius, x, y, penumbraRadius);
    penumbraGradient.addColorStop(0, `rgba(200, 100, 0, ${Math.random() * 0.4 + 0.3})`);
    penumbraGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = penumbraGradient;
    ctx.beginPath();
    ctx.arc(x, y, penumbraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Umbra (dark center)
    const umbraGradient = ctx.createRadialGradient(x, y, 0, x, y, umbraRadius);
    umbraGradient.addColorStop(0, `rgba(100, 50, 0, ${Math.random() * 0.6 + 0.4})`);
    umbraGradient.addColorStop(1, `rgba(200, 100, 0, ${Math.random() * 0.3 + 0.2})`);
    ctx.fillStyle = umbraGradient;
    ctx.beginPath();
    ctx.arc(x, y, umbraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Add smaller spots around main spot
    for (let j = 0; j < 3; j++) {
      const spotAngle = Math.random() * Math.PI * 2;
      const spotDist = penumbraRadius + Math.random() * 10;
      const spotX = x + Math.cos(spotAngle) * spotDist;
      const spotY = y + Math.sin(spotAngle) * spotDist;
      const spotRadius = Math.random() * 5 + 2;

      ctx.fillStyle = `rgba(150, 75, 0, ${Math.random() * 0.4 + 0.3})`;
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add fine granular texture (solar granulation)
  const imageData = ctx.getImageData(0, 0, resolution, resolution);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % resolution;
    const y = Math.floor(i / 4 / resolution);
    const distFromCenter = Math.sqrt(
      Math.pow(x - resolution / 2, 2) + Math.pow(y - resolution / 2, 2)
    );

    // Only add granulation within sun radius
    if (distFromCenter < resolution / 2) {
      // Create granulation pattern
      const granuleSize = 8;
      const granuleX = Math.floor(x / granuleSize);
      const granuleY = Math.floor(y / granuleSize);
      const granuleValue = (Math.sin(granuleX * 0.5) * Math.cos(granuleY * 0.5) + 1) * 0.5;

      const brightness = 1 + (granuleValue - 0.5) * 0.15; // ±7.5% variation
      data[i] = Math.min(255, data[i] * brightness);
      data[i + 1] = Math.min(255, data[i + 1] * brightness * 0.9);
      data[i + 2] = Math.min(255, data[i + 2] * brightness * 0.8);
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  // Use ClampToEdgeWrapping to prevent seams on sphere
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Create detailed moon texture with complex crater details
 */
function createMoonTexture() {
  const canvas = document.createElement('canvas');
  const resolution = 512; // Increased resolution
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');

  // Base lunar surface with subtle gradient
  const baseGradient = ctx.createRadialGradient(
    resolution / 2,
    resolution / 2,
    0,
    resolution / 2,
    resolution / 2,
    resolution / 2
  );
  baseGradient.addColorStop(0, '#b0b0b0');
  baseGradient.addColorStop(0.7, '#888888');
  baseGradient.addColorStop(1, '#707070');

  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, resolution, resolution);

  // Add surface variations and maria (dark patches)
  const mariaCount = 8;
  for (let i = 0; i < mariaCount; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 80 + 40;

    const mariaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    mariaGradient.addColorStop(0, `rgba(80, 80, 80, ${Math.random() * 0.3 + 0.4})`);
    mariaGradient.addColorStop(0.7, `rgba(100, 100, 100, ${Math.random() * 0.2 + 0.2})`);
    mariaGradient.addColorStop(1, 'rgba(120, 120, 120, 0)');

    ctx.fillStyle = mariaGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add large craters with detailed rim and shadow
  const largeCraterCount = 8;
  for (let i = 0; i < largeCraterCount; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 35 + 20;
    const lightAngle = Math.random() * Math.PI * 2; // Direction of light

    // Crater rim (raised edge)
    const rimGradient = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius);
    rimGradient.addColorStop(0, `rgba(150, 150, 150, ${Math.random() * 0.3 + 0.4})`);
    rimGradient.addColorStop(1, `rgba(120, 120, 120, ${Math.random() * 0.2 + 0.3})`);
    ctx.fillStyle = rimGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Crater interior (dark center)
    const interiorRadius = radius * 0.7;
    const interiorGradient = ctx.createRadialGradient(x, y, 0, x, y, interiorRadius);
    interiorGradient.addColorStop(0, `rgba(60, 60, 60, ${Math.random() * 0.4 + 0.6})`);
    interiorGradient.addColorStop(0.5, `rgba(80, 80, 80, ${Math.random() * 0.3 + 0.5})`);
    interiorGradient.addColorStop(1, `rgba(100, 100, 100, ${Math.random() * 0.2 + 0.3})`);
    ctx.fillStyle = interiorGradient;
    ctx.beginPath();
    ctx.arc(x, y, interiorRadius, 0, Math.PI * 2);
    ctx.fill();

    // Add shadow on one side of crater
    const shadowOffsetX = Math.cos(lightAngle) * radius * 0.3;
    const shadowOffsetY = Math.sin(lightAngle) * radius * 0.3;
    const shadowGradient = ctx.createRadialGradient(
      x - shadowOffsetX,
      y - shadowOffsetY,
      0,
      x - shadowOffsetX,
      y - shadowOffsetY,
      radius * 0.8
    );
    shadowGradient.addColorStop(0, `rgba(40, 40, 40, ${Math.random() * 0.4 + 0.5})`);
    shadowGradient.addColorStop(1, 'rgba(80, 80, 80, 0)');
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(x - shadowOffsetX, y - shadowOffsetY, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Add central peak (some craters have them)
    if (Math.random() > 0.6) {
      const peakRadius = radius * 0.15;
      const peakGradient = ctx.createRadialGradient(x, y, 0, x, y, peakRadius);
      peakGradient.addColorStop(0, `rgba(140, 140, 140, ${Math.random() * 0.3 + 0.5})`);
      peakGradient.addColorStop(1, `rgba(100, 100, 100, ${Math.random() * 0.2 + 0.3})`);
      ctx.fillStyle = peakGradient;
      ctx.beginPath();
      ctx.arc(x, y, peakRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add medium craters
  const mediumCraterCount = 25;
  for (let i = 0; i < mediumCraterCount; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 15 + 8;
    const lightAngle = Math.random() * Math.PI * 2;

    // Rim
    ctx.fillStyle = `rgba(140, 140, 140, ${Math.random() * 0.3 + 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Interior
    const interiorRadius = radius * 0.7;
    const interiorGradient = ctx.createRadialGradient(x, y, 0, x, y, interiorRadius);
    interiorGradient.addColorStop(0, `rgba(70, 70, 70, ${Math.random() * 0.4 + 0.5})`);
    interiorGradient.addColorStop(1, `rgba(90, 90, 90, ${Math.random() * 0.2 + 0.3})`);
    ctx.fillStyle = interiorGradient;
    ctx.beginPath();
    ctx.arc(x, y, interiorRadius, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    const shadowOffsetX = Math.cos(lightAngle) * radius * 0.4;
    const shadowOffsetY = Math.sin(lightAngle) * radius * 0.4;
    ctx.fillStyle = `rgba(50, 50, 50, ${Math.random() * 0.3 + 0.4})`;
    ctx.beginPath();
    ctx.arc(x - shadowOffsetX, y - shadowOffsetY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add small craters
  const smallCraterCount = 80;
  for (let i = 0; i < smallCraterCount; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 6 + 2;

    // Small crater
    ctx.fillStyle = `rgba(90, 90, 90, ${Math.random() * 0.4 + 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Small shadow
    ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.3 + 0.3})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add tiny impact pits
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 2 + 0.5;

    ctx.fillStyle = `rgba(80, 80, 80, ${Math.random() * 0.5 + 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add surface texture and variations
  const imageData = ctx.getImageData(0, 0, resolution, resolution);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % resolution;
    const y = Math.floor(i / 4 / resolution);

    // Create surface roughness pattern
    const roughness = (Math.sin(x * 0.1) * Math.cos(y * 0.1) + 1) * 0.5;
    const variation = (Math.random() - 0.5) * 12;

    const brightness = 1 + (roughness - 0.5) * 0.1 + variation / 255;
    data[i] = Math.max(60, Math.min(180, data[i] * brightness));
    data[i + 1] = Math.max(60, Math.min(180, data[i + 1] * brightness));
    data[i + 2] = Math.max(60, Math.min(180, data[i + 2] * brightness));
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Create complex procedural planet texture using canvas
 */
function createPlanetTexture(name, color, size) {
  const canvas = document.createElement('canvas');
  const resolution = 1024; // Increased resolution for better detail
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');

  // Base color
  const baseColor = new THREE.Color(color);
  const r = Math.floor(baseColor.r * 255);
  const g = Math.floor(baseColor.g * 255);
  const b = Math.floor(baseColor.b * 255);

  // Create multi-stop gradient background for depth
  const gradient = ctx.createRadialGradient(
    resolution / 2,
    resolution / 2,
    0,
    resolution / 2,
    resolution / 2,
    resolution / 2
  );
  gradient.addColorStop(
    0,
    `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`
  );
  gradient.addColorStop(
    0.3,
    `rgb(${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)})`
  );
  gradient.addColorStop(0.6, `rgb(${r}, ${g}, ${b})`);
  gradient.addColorStop(
    0.85,
    `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`
  );
  gradient.addColorStop(
    1,
    `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`
  );

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, resolution, resolution);

  // Add planet-specific details based on name
  if (name === 'Pyro') {
    // Lava/volcanic texture with detailed features
    // Lava flows
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 30 + 10;

      const lavaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      lavaGradient.addColorStop(
        0,
        `rgba(255, ${150 + Math.random() * 50}, 0, ${Math.random() * 0.6 + 0.4})`
      );
      lavaGradient.addColorStop(
        0.5,
        `rgba(255, ${100 + Math.random() * 50}, 0, ${Math.random() * 0.4 + 0.3})`
      );
      lavaGradient.addColorStop(1, `rgba(200, 50, 0, 0)`);
      ctx.fillStyle = lavaGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Volcanic cracks and fissures
    for (let i = 0; i < 60; i++) {
      const startX = Math.random() * resolution;
      const startY = Math.random() * resolution;
      const length = Math.random() * 80 + 40;
      const angle = Math.random() * Math.PI * 2;
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;

      ctx.strokeStyle = `rgba(255, 50, 0, ${Math.random() * 0.5 + 0.3})`;
      ctx.lineWidth = Math.random() * 4 + 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Hot spots (glowing areas)
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 15 + 5;

      const hotSpotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      hotSpotGradient.addColorStop(0, `rgba(255, 255, 200, ${Math.random() * 0.7 + 0.3})`);
      hotSpotGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
      ctx.fillStyle = hotSpotGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Crystal') {
    // Ice crystal texture with complex formations
    // Large ice formations
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const size = Math.random() * 40 + 20;

      // Create hexagonal crystal pattern
      ctx.strokeStyle = `rgba(200, 255, 255, ${Math.random() * 0.6 + 0.4})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (j === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();

      // Add inner crystal structure
      const innerSize = size * 0.6;
      ctx.strokeStyle = `rgba(220, 255, 255, ${Math.random() * 0.5 + 0.3})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2;
        const px = x + Math.cos(angle) * innerSize;
        const py = y + Math.sin(angle) * innerSize;
        if (j === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Frost patterns
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const length = Math.random() * 30 + 10;
      const angle = Math.random() * Math.PI * 2;

      ctx.strokeStyle = `rgba(180, 240, 255, ${Math.random() * 0.4 + 0.3})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    // Ice cracks
    for (let i = 0; i < 50; i++) {
      const startX = Math.random() * resolution;
      const startY = Math.random() * resolution;
      const segments = Math.random() * 5 + 3;
      ctx.strokeStyle = `rgba(150, 200, 255, ${Math.random() * 0.5 + 0.3})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let currentX = startX;
      let currentY = startY;
      for (let j = 0; j < segments; j++) {
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 20 + 10;
        currentX += Math.cos(angle) * length;
        currentY += Math.sin(angle) * length;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }
  } else if (name === 'Terra') {
    // Earth-like continents with detailed terrain
    // Large continental masses
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 100 + 60;

      const continentGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      continentGradient.addColorStop(
        0,
        `rgba(${Math.max(0, r - 60)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 70)}, ${Math.random() * 0.3 + 0.6})`
      );
      continentGradient.addColorStop(
        0.7,
        `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 50)}, ${Math.random() * 0.2 + 0.4})`
      );
      continentGradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
      ctx.fillStyle = continentGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountain ranges
    for (let i = 0; i < 40; i++) {
      const startX = Math.random() * resolution;
      const startY = Math.random() * resolution;
      const length = Math.random() * 60 + 30;
      const angle = Math.random() * Math.PI * 2;

      ctx.strokeStyle = `rgba(${Math.max(0, r - 80)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 90)}, ${Math.random() * 0.4 + 0.4})`;
      ctx.lineWidth = Math.random() * 4 + 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      // Create jagged mountain line
      let currentX = startX;
      let currentY = startY;
      for (let j = 0; j < 8; j++) {
        const segmentAngle = angle + (Math.random() - 0.5) * 0.5;
        const segmentLength = length / 8;
        currentX += Math.cos(segmentAngle) * segmentLength;
        currentY += Math.sin(segmentAngle) * segmentLength;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }

    // Cloud layers
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 35 + 15;

      const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      cloudGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`);
      cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloudGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Water bodies (oceans)
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 80 + 40;

      const oceanGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      oceanGradient.addColorStop(
        0,
        `rgba(${r - 20}, ${g - 10}, ${b + 20}, ${Math.random() * 0.2 + 0.3})`
      );
      oceanGradient.addColorStop(1, 'rgba(100, 150, 200, 0)');
      ctx.fillStyle = oceanGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Vermillion') {
    // Pink clouds with atmospheric layers
    // Dense cloud layers
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 40 + 20;

      const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      cloudGradient.addColorStop(
        0,
        `rgba(255, ${150 + Math.random() * 50}, ${180 + Math.random() * 50}, ${Math.random() * 0.5 + 0.4})`
      );
      cloudGradient.addColorStop(
        0.7,
        `rgba(255, ${120 + Math.random() * 50}, ${150 + Math.random() * 50}, ${Math.random() * 0.3 + 0.2})`
      );
      cloudGradient.addColorStop(1, 'rgba(255, 100, 150, 0)');
      ctx.fillStyle = cloudGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cloud swirls
    for (let i = 0; i < 40; i++) {
      const centerX = Math.random() * resolution;
      const centerY = Math.random() * resolution;
      const radius = Math.random() * 60 + 30;

      ctx.strokeStyle = `rgba(255, 180, 220, ${Math.random() * 0.4 + 0.3})`;
      ctx.lineWidth = Math.random() * 8 + 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Atmospheric haze
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 100 + 50;

      const hazeGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      hazeGradient.addColorStop(0, `rgba(255, 150, 200, ${Math.random() * 0.15 + 0.1})`);
      hazeGradient.addColorStop(1, 'rgba(255, 100, 150, 0)');
      ctx.fillStyle = hazeGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Titan') {
    // Gas giant bands with complex turbulence
    // Main bands with varying widths
    let currentY = 0;
    while (currentY < resolution) {
      const bandHeight = Math.random() * (resolution / 15) + resolution / 25;
      const bandColor =
        Math.random() > 0.5
          ? `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.3 + 0.7})`
          : `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, ${Math.random() * 0.3 + 0.7})`;

      ctx.fillStyle = bandColor;
      ctx.fillRect(0, currentY, resolution, bandHeight);

      // Add subtle gradient within band
      const bandGradient = ctx.createLinearGradient(0, currentY, 0, currentY + bandHeight);
      bandGradient.addColorStop(0, `rgba(${r + 10}, ${g + 10}, ${b + 10}, 0.2)`);
      bandGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      bandGradient.addColorStop(1, `rgba(${r - 10}, ${g - 10}, ${b - 10}, 0.2)`);
      ctx.fillStyle = bandGradient;
      ctx.fillRect(0, currentY, resolution, bandHeight);

      currentY += bandHeight;
    }

    // Add storm systems (Great Red Spot-like)
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 80 + 50;

      // Outer storm ring
      const stormGradient = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius);
      stormGradient.addColorStop(
        0,
        `rgba(${r + 30}, ${g + 30}, ${b + 30}, ${Math.random() * 0.4 + 0.3})`
      );
      stormGradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
      ctx.fillStyle = stormGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner storm center
      const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.7);
      centerGradient.addColorStop(
        0,
        `rgba(${r - 20}, ${g - 20}, ${b - 20}, ${Math.random() * 0.5 + 0.4})`
      );
      centerGradient.addColorStop(
        1,
        `rgba(${r + 10}, ${g + 10}, ${b + 10}, ${Math.random() * 0.3 + 0.2})`
      );
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add turbulence and eddies
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 25 + 10;

      const eddyGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      eddyGradient.addColorStop(
        0,
        `rgba(${r + 20}, ${g + 20}, ${b + 20}, ${Math.random() * 0.3 + 0.2})`
      );
      eddyGradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
      ctx.fillStyle = eddyGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Nebula') {
    // Purple nebula swirls with complex patterns
    // Large nebula clouds
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 60 + 30;

      const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      nebulaGradient.addColorStop(
        0,
        `rgba(${150 + Math.random() * 50}, ${100 + Math.random() * 50}, ${180 + Math.random() * 50}, ${Math.random() * 0.5 + 0.4})`
      );
      nebulaGradient.addColorStop(
        0.6,
        `rgba(${120 + Math.random() * 40}, ${80 + Math.random() * 40}, ${150 + Math.random() * 40}, ${Math.random() * 0.3 + 0.2})`
      );
      nebulaGradient.addColorStop(1, 'rgba(100, 60, 120, 0)');
      ctx.fillStyle = nebulaGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swirling patterns
    for (let i = 0; i < 50; i++) {
      const centerX = Math.random() * resolution;
      const centerY = Math.random() * resolution;
      const startRadius = Math.random() * 40 + 20;
      const endRadius = startRadius + Math.random() * 60 + 30;

      ctx.strokeStyle = `rgba(180, 120, 220, ${Math.random() * 0.4 + 0.3})`;
      ctx.lineWidth = Math.random() * 6 + 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (startRadius + endRadius) / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Bright star-forming regions
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 20 + 10;

      const starGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      starGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.4})`);
      starGradient.addColorStop(0.5, `rgba(200, 150, 255, ${Math.random() * 0.4 + 0.3})`);
      starGradient.addColorStop(1, 'rgba(150, 100, 200, 0)');
      ctx.fillStyle = starGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Aurora') {
    // Green aurora-like streaks with complex patterns
    // Main aurora bands
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const width = Math.random() * 30 + 10;
      const height = Math.random() * 100 + 50;
      const angle = Math.random() * Math.PI * 0.3 - Math.PI * 0.15; // Mostly vertical

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const auroraGradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
      auroraGradient.addColorStop(0, `rgba(0, 255, ${150 + Math.random() * 50}, 0)`);
      auroraGradient.addColorStop(
        0.3,
        `rgba(0, 255, ${180 + Math.random() * 50}, ${Math.random() * 0.5 + 0.4})`
      );
      auroraGradient.addColorStop(
        0.7,
        `rgba(0, 255, ${150 + Math.random() * 50}, ${Math.random() * 0.5 + 0.4})`
      );
      auroraGradient.addColorStop(1, `rgba(0, 255, ${120 + Math.random() * 50}, 0)`);

      ctx.fillStyle = auroraGradient;
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.restore();
    }

    // Wavy aurora patterns
    for (let i = 0; i < 40; i++) {
      const startX = Math.random() * resolution;
      const startY = Math.random() * resolution;
      const length = Math.random() * 150 + 100;

      ctx.strokeStyle = `rgba(0, 255, ${150 + Math.random() * 50}, ${Math.random() * 0.5 + 0.4})`;
      ctx.lineWidth = Math.random() * 8 + 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      // Create wavy line
      let currentX = startX;
      let currentY = startY;
      for (let j = 0; j < 20; j++) {
        const waveOffset = Math.sin(j * 0.5) * 15;
        const stepX = Math.cos(Math.PI / 2) * (length / 20);
        const stepY = Math.sin(Math.PI / 2) * (length / 20) + waveOffset;
        currentX += stepX;
        currentY += stepY;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }

    // Glowing aurora particles
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 3 + 1;

      ctx.fillStyle = `rgba(0, 255, ${150 + Math.random() * 50}, ${Math.random() * 0.6 + 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Obsidian') {
    // Dark rocky texture with detailed surface
    // Large rock formations
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 50 + 20;

      const rockGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      rockGradient.addColorStop(
        0,
        `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, ${Math.random() * 0.4 + 0.6})`
      );
      rockGradient.addColorStop(
        1,
        `rgba(${Math.max(0, r - 10)}, ${Math.max(0, g - 10)}, ${Math.max(0, b - 10)}, ${Math.random() * 0.3 + 0.4})`
      );
      ctx.fillStyle = rockGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Surface cracks and fissures
    for (let i = 0; i < 120; i++) {
      const startX = Math.random() * resolution;
      const startY = Math.random() * resolution;
      const length = Math.random() * 60 + 30;
      const angle = Math.random() * Math.PI * 2;

      ctx.strokeStyle = `rgba(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)}, ${Math.random() * 0.5 + 0.4})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
      ctx.stroke();
    }

    // Small rock details
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 5 + 1;

      ctx.fillStyle = `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, ${Math.random() * 0.6 + 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mineral deposits (glowing spots)
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 8 + 3;

      const mineralGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      mineralGradient.addColorStop(
        0,
        `rgba(${r + 20}, ${g + 20}, ${b + 20}, ${Math.random() * 0.5 + 0.4})`
      );
      mineralGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = mineralGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add complex surface texture and detail
  const imageData = ctx.getImageData(0, 0, resolution, resolution);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % resolution;
    const y = Math.floor(i / 4 / resolution);

    // Create surface roughness pattern
    const roughness = (Math.sin(x * 0.05) * Math.cos(y * 0.05) + 1) * 0.5;
    const variation = (Math.random() - 0.5) * 25;

    const brightness = 1 + (roughness - 0.5) * 0.12 + variation / 255;
    data[i] = Math.max(0, Math.min(255, data[i] * brightness));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * brightness));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * brightness));
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Create celestial bodies (sun, planets, moons)
 */
function createCelestialBodies() {
  // Create Sun at the center with texture
  const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
  const sunTexture = createSunTexture();
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
  const planetConfigs = [
    {
      name: 'Pyro',
      size: 0.6,
      distance: 12,
      color: 0xff4500,
      speed: 0.004,
      moons: 0,
      emissive: 0xff6600,
    }, // Very fast, hot planet
    {
      name: 'Crystal',
      size: 0.8,
      distance: 18,
      color: 0x00ffff,
      speed: 0.003,
      moons: 2,
      emissive: 0x66ffff,
    }, // Fast ice planet with moons
    {
      name: 'Terra',
      size: 0.9,
      distance: 25,
      color: 0x4a90e2,
      speed: 0.002,
      moons: 1,
      emissive: 0x6ab3ff,
    }, // Earth-like
    {
      name: 'Vermillion',
      size: 0.7,
      distance: 32,
      color: 0xff1493,
      speed: 0.0015,
      moons: 3,
      emissive: 0xff69b4,
    }, // Pink planet with many moons
    {
      name: 'Titan',
      size: 1.8,
      distance: 45,
      color: 0xffa500,
      speed: 0.001,
      moons: 5,
      emissive: 0xffb347,
    }, // Large gas giant
    {
      name: 'Nebula',
      size: 1.4,
      distance: 58,
      color: 0x9370db,
      speed: 0.0008,
      moons: 4,
      emissive: 0xba90ff,
    }, // Purple gas giant
    {
      name: 'Aurora',
      size: 1.1,
      distance: 72,
      color: 0x00ff7f,
      speed: 0.0006,
      moons: 2,
      emissive: 0x40ff9f,
    }, // Green planet
    {
      name: 'Obsidian',
      size: 0.95,
      distance: 88,
      color: 0x2f4f4f,
      speed: 0.0004,
      moons: 1,
      emissive: 0x4a6a6a,
    }, // Dark planet
  ];

  planetConfigs.forEach((config, index) => {
    // Create planet with texture
    const planetGeometry = new THREE.SphereGeometry(config.size, 32, 32);

    // Generate procedural texture for planet
    const texture = createPlanetTexture(config.name, config.color, config.size);

    const planetMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      color: config.color,
      emissive: config.emissive || config.color,
      emissiveIntensity: 0.2,
      shininess: 30,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    // Position planet in orbit
    const angle = (index / planetConfigs.length) * Math.PI * 2;
    planet.position.x = Math.cos(angle) * config.distance;
    planet.position.z = Math.sin(angle) * config.distance;
    planet.userData = {
      name: config.name,
      distance: config.distance,
      angle: angle,
      speed: config.speed,
      initialAngle: angle,
      size: config.size,
    };

    // Make planet clickable
    planet.userData.clickable = true;
    planet.cursor = 'pointer';

    milkyWayScene.add(planet);
    planets.push(planet);

    // Add moons to planets
    for (let m = 0; m < config.moons; m++) {
      const moonGeometry = new THREE.SphereGeometry(config.size * 0.3, 16, 16);
      // Create simple moon texture
      const moonTexture = createMoonTexture();
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
    planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
    planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
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
