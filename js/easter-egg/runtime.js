import { isDevelopmentEnv, isMobileDevice } from '../utils/env.js';
import { initGPUCompute, isWebGPUAvailable } from './gpu-compute.js';
import {
  createSunTexture,
  createMoonTexture,
  createPlanetTexture,
  getNormalScaleForPlanet,
} from './celestial-textures.js';
import { generateMultiLayerGalaxy } from './galaxy-generator.js';
import { generateMultiLayerStarField, updateStarTwinkling } from './star-field.js';
import {
  setupDynamicLighting,
  updateLighting,
  addAtmospheresToPlanets,
  updateAtmospheres,
} from './lighting-atmosphere.js';
import {
  createAsteroidBelt,
  createComet,
  createSolarWind,
  createSpaceDust,
  createSpaceStation,
  updateAsteroidBelt,
  updateComet,
  updateSolarWind,
  updateSpaceStation,
} from './particle-effects.js';
import {
  createLagrangePointMarkers,
  updateLagrangePoints,
  updateCelestialMechanics,
  calculateRealisticRotationSpeed,
} from './celestial-mechanics.js';
import {
  setupPostProcessing,
  updatePostProcessing,
  resizePostProcessing,
  setDepthOfFieldFocus,
} from './post-processing.js';
import {
  initCameraControls,
  setCameraSpeed,
  getCameraSpeed,
  transitionToPreset,
  CameraPresets,
  createOrbitalControls,
  updateCameraVelocity,
  stopCameraAnimation,
} from './camera-controls.js';
import {
  createNebulaField,
  createStarFormingRegion,
  createDustCloud,
  createInterstellarMedium,
  updateNebula,
  updateStarFormingRegion,
} from './nebula-clouds.js';
import { initGalaxySettings, getSettingsState, cleanupGalaxySettings } from './galaxy-settings.js';

/**
 * Easter Egg Module
 * Handles the black hole vortex effect and Milky Way animation
 */

let milkyWayScene = null;
let milkyWayRenderer = null;
let milkyWayCamera = null;
let milkyWayAnimationId = null;
let isEasterEggActive = false;
let ambientAudio = null;

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

// Settings values (will be updated from settings UI)
let scrollSensitivity = 0.025;
let rotationSensitivity = 0.005;
let autoRotateGalaxy = false;
let autoRotateSpeed = 0.002;
let galaxyRotationSpeedMultiplier = 1.0;
let planetRotationSpeedMultiplier = 1.0;
let orbitalSpeedMultiplier = 1.0;

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

  // Hide main content and structural elements (navbar, footer) using a single wrapper approach
  // Navbar and footer are outside #main-content, so they need to be hidden explicitly
  const mainContent = document.getElementById('main-content');
  const navbar = document.querySelector('.navbar, #navbar, nav.navbar');
  const footer = document.querySelector('footer');

  // Hide main content
  if (mainContent) {
    // Store original display style for restoration
    if (!mainContent.dataset.originalDisplay) {
      mainContent.dataset.originalDisplay = mainContent.style.display || '';
    }
    mainContent.style.display = 'none';
  }

  // Hide navbar (outside main-content)
  if (navbar) {
    if (!navbar.dataset.originalDisplay) {
      navbar.dataset.originalDisplay = navbar.style.display || '';
    }
    navbar.style.display = 'none';
  }

  // Hide footer (outside main-content)
  if (footer) {
    if (!footer.dataset.originalDisplay) {
      footer.dataset.originalDisplay = footer.style.display || '';
    }
    footer.style.display = 'none';
  }

  // Fallback: hide other top-level elements if main-content doesn't exist
  if (!mainContent) {
    const fallbackElements = document.querySelectorAll('body > *:not(.easter-egg-vortex):not(.milky-way-scene):not(.milky-way-menu):not(.milky-way-loading)');
    fallbackElements.forEach(el => {
      if (el && el.id !== 'aria-live-region') {
        if (!el.dataset.originalDisplay) {
          el.dataset.originalDisplay = el.style.display || '';
        }
        el.style.display = 'none';
      }
    });
  }

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
  const threeJSPromise = import('../utils/three-loader.js').then(module => {
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

    // Initialize galaxy settings UI
    initGalaxySettings(milkyWayContainer || document.body);

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

    // Hide system cursor and show only custom cursor dot
    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';
    milkyWayContainer.style.cursor = 'none';

    // Override to hide system cursor and ensure custom cursor dot is visible
    const style = document.createElement('style');
    style.id = 'milky-way-cursor-override';
    style.textContent = `
            @media (hover: hover) and (pointer: fine) {
                body.easter-egg-active.milky-way-ready html,
                body.easter-egg-active.milky-way-ready body,
                body.easter-egg-active.milky-way-ready html *,
                body.easter-egg-active.milky-way-ready body *,
                body.easter-egg-active.milky-way-ready * {
                    cursor: none !important;
                }
                .milky-way-scene.active canvas {
                    cursor: none !important;
                }
                /* Ensure custom cursor dot is visible in galaxy mode */
                body.easter-egg-active.milky-way-ready .cursor-dot {
                    opacity: 1 !important;
                    z-index: 999999 !important;
                }
            }
        `;
    document.head.appendChild(style);

    initMilkyWay();
    initAmbientAudio();
  }, 1500); // Reduced from 2000ms to 1500ms for faster loading
}

/**
 * Get the base path for asset URLs
 * Uses Vite's import.meta.env.BASE_URL when available, otherwise defaults to root
 */
function getBasePath() {
  // Vite provides BASE_URL that respects the base config
  // In production builds, this is replaced at build time
  let baseUrl = '/';

  if (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  }

  // Ensure it ends with / for proper path joining (unless it's empty)
  if (baseUrl && !baseUrl.endsWith('/')) {
    baseUrl = `${baseUrl}/`;
  }

  // If baseUrl is empty or just '/', return '/'
  // This works for both dev (/) and preview (/)
  return baseUrl || '/';
}

/**
 * Initialize ambient audio for the galaxy scene
 */
function initAmbientAudio() {
  // Check if audio already exists
  if (ambientAudio) {
    return;
  }

  // Get base path to handle deployments with base paths (e.g., GitHub Pages)
  const basePath = getBasePath();
  // Use absolute path from base to ensure audio works from any page
  // This handles clean URLs, subdirectories, different page locations, and base paths
  const audioPath = `${basePath}assets/audio/space-ambience-optimized.ogg`;

  try {
    ambientAudio = new Audio(audioPath);
    ambientAudio.loop = true;
    ambientAudio.volume = 0.3; // Set to 30% volume for ambient background
    ambientAudio.preload = 'auto';

    // Play audio when user interacts (required by browser autoplay policies)
    const playAudio = () => {
      if (ambientAudio && isEasterEggActive) {
        ambientAudio.play().catch((error) => {
          if (isDevelopmentEnv()) {
            console.warn('[Easter Egg] Audio playback failed:', error);
          }
        });
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', playAudio);
      document.removeEventListener('touchstart', playAudio);
      document.removeEventListener('keydown', playAudio);
    };

    // Try to play immediately (may fail due to autoplay policy)
    // Also try to play when galaxy scene is ready
    const tryPlayAudio = () => {
      if (ambientAudio && isEasterEggActive) {
        ambientAudio.play().catch(() => {
          // If autoplay fails, wait for user interaction
          document.addEventListener('click', playAudio, { once: true });
          document.addEventListener('touchstart', playAudio, { once: true });
          document.addEventListener('keydown', playAudio, { once: true });
        });
      }
    };

    tryPlayAudio();

    // Also try to play when galaxy scene is fully loaded (after a short delay)
    setTimeout(tryPlayAudio, 2000);
  } catch (error) {
    if (isDevelopmentEnv()) {
      console.warn('[Easter Egg] Audio initialization failed:', error);
    }
  }
}

/**
 * Stop ambient audio
 */
function stopAmbientAudio() {
  if (ambientAudio) {
    ambientAudio.pause();
    ambientAudio.currentTime = 0;
  }
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
      const { loadThreeJS } = await import('../utils/three-loader.js');
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
  milkyWayCamera.position.set(0, 0, 150);
  milkyWayCamera.lookAt(0, 0, 0);

  // Renderer setup
  // Check for WebGPU support first (better performance for compute shaders)
  let useWebGPURenderer = false;
  if (isWebGPUAvailable() && THREE.WebGPURenderer) {
    try {
      milkyWayRenderer = new THREE.WebGPURenderer({
        antialias: true,
        alpha: true,
      });
      useWebGPURenderer = true;
      if (isDevelopmentEnv()) {
        console.log('[Easter Egg] Using WebGPU renderer for better performance');
      }
    } catch (error) {
      if (isDevelopmentEnv()) {
        console.warn('[Easter Egg] WebGPU renderer failed, falling back to WebGL:', error);
      }
      useWebGPURenderer = false;
    }
  }

  // Fallback to WebGL renderer
  if (!milkyWayRenderer) {
    milkyWayRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
  }

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

  // Initialize GPU compute system (for particle updates)
  milkyWayScene.userData.gpuCompute = null;
  try {
    const gpuCompute = await initGPUCompute(THREE, milkyWayRenderer);
    if (gpuCompute && gpuCompute.available) {
      milkyWayScene.userData.gpuCompute = gpuCompute;
      if (isDevelopmentEnv()) {
        console.log(`[Easter Egg] GPU compute initialized: ${gpuCompute.type}`);
      }
    }
  } catch (error) {
    if (isDevelopmentEnv()) {
      console.warn('[Easter Egg] GPU compute initialization failed, using CPU fallback:', error);
    }
    // Continue with CPU-based updates
  }

  // Initialize camera controls
  initCameraControls(THREE);

  // Setup post-processing (optional - requires three/addons/postprocessing)
  // Note: Post-processing may not be available if addons aren't loaded
  // Disable by default to ensure standard rendering works
  milkyWayScene.userData.postProcessing = null;
  try {
    const postProcessing = setupPostProcessing(THREE, milkyWayRenderer, milkyWayScene, milkyWayCamera, {
      enableBloom: false, // Disabled by default - enable if addons are available
      enableDepthOfField: false,
      enableColorGrading: false,
      enableMotionBlur: false,
    });
    // Only use post-processing if it was successfully created
    if (postProcessing && postProcessing.composer) {
      milkyWayScene.userData.postProcessing = postProcessing;
    }
  } catch (error) {
    if (isDevelopmentEnv()) {
      console.warn('[Easter Egg] Post-processing not available:', error);
    }
    // Ensure postProcessing is null so standard rendering is used
    milkyWayScene.userData.postProcessing = null;
  }

  // Create Milky Way galaxy
  createMilkyWayGalaxy();

  // Create background star field with multiple layers
  createStarField();

  // Create celestial bodies (sun, planets, moons)
  createCelestialBodies();

  // Create nebula and space clouds
  createNebulaAndClouds();

  // Create particle effects (asteroid belts, comets, solar wind, space dust, space stations)
  createParticleEffects();

  // Create orbital trajectory visualization (initially hidden)
  createOrbitalTrajectories();

  // Initialize default settings in scene userData
  milkyWayScene.userData.starTwinklingEnabled = true;
  milkyWayScene.userData.atmospheresEnabled = true;
  milkyWayScene.userData.nebulasEnabled = true;
  milkyWayScene.userData.starFormingRegionsEnabled = true;
  milkyWayScene.userData.dustCloudsEnabled = true;
  if (milkyWayScene.userData.postProcessing) {
    milkyWayScene.userData.postProcessing.enabled = true;
  }

  // Debug: Log scene contents
  if (isDevelopmentEnv()) {
    console.log('[Easter Egg] Scene initialized:', {
      galaxyLayers: milkyWayScene.userData.galaxyLayers?.length || 0,
      starLayers: milkyWayScene.userData.starLayers?.length || 0,
      planets: milkyWayScene.userData.planets?.length || 0,
      cameraPosition: milkyWayCamera.position,
    });
  }

  // Setup interactive controls
  setupInteractiveControls();

  // Handle window resize
  window.addEventListener('resize', onMilkyWayResize);

  // Setup settings event listeners (after all effects are created)
  // Delay to ensure all scene objects are initialized
  // Use a longer delay and verify objects exist before applying settings
  setTimeout(() => {
    setupSettingsListeners();

    // Verify critical objects exist before applying settings
    const verifyObjects = () => {
      return milkyWayScene &&
        milkyWayScene.userData.galaxyLayers &&
        milkyWayScene.userData.starLayers &&
        milkyWayScene.userData.planets &&
        milkyWayScene.userData.centerStars &&
        milkyWayScene.userData.particleEffects;
    };

    // Retry applying settings if objects aren't ready yet
    const applySettingsWithRetry = (retries = 3) => {
      if (verifyObjects() || retries === 0) {
        const currentSettings = getSettingsState();
        Object.keys(currentSettings).forEach(setting => {
          applySetting(setting, currentSettings[setting]);
        });
      } else {
        setTimeout(() => applySettingsWithRetry(retries - 1), 100);
      }
    };

    applySettingsWithRetry();
  }, 500);

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
      if (fullscreenElement !== null && fullscreenElement !== undefined) {
        // Try to move menu to fullscreen element if it's not already there
        if (fullscreenElement !== menu.parentElement && fullscreenElement.appendChild) {
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
 * Create the Milky Way galaxy with enhanced spiral arms using density wave theory
 * Features multiple star layers rotating at different speeds
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

  // Generate multiple galaxy layers with different rotation speeds
  // THREE should be available as window.THREE at this point
  const galaxyLayers = generateMultiLayerGalaxy(window.THREE || THREE, parameters, 3);

  // Store galaxy layers for animation
  milkyWayScene.userData.galaxyLayers = [];

  galaxyLayers.forEach((layerData, index) => {
    // Create material for this layer
    const material = new THREE.PointsMaterial({
      size: parameters.size * (1 - index * 0.1),
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      opacity: 1 - index * 0.15, // Slightly more transparent for outer layers
      transparent: true,
    });

    // Create points from geometry
    const points = new THREE.Points(layerData.geometry, material);
    milkyWayScene.add(points);

    // Store layer data for animation
    milkyWayScene.userData.galaxyLayers.push({
      points,
      rotationSpeed: layerData.rotationSpeed,
      densityWaveSpeed: layerData.densityWaveSpeed,
    });
  });

  // Add bright stars in the center (galactic core)
  const centerStarsGeometry = new THREE.BufferGeometry();
  const centerStarsPositions = new Float32Array(2000 * 3);
  const centerStarsColors = new Float32Array(2000 * 3);
  const centerStarsSizes = new Float32Array(2000);

  for (let i = 0; i < 2000; i++) {
    const i3 = i * 3;
    const radius = Math.pow(Math.random(), 2) * 5; // Denser at center
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    centerStarsPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    centerStarsPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    centerStarsPositions[i3 + 2] = radius * Math.cos(phi);

    // Bright white/yellow for center, with brightness variation
    const brightness = Math.random() * 0.4 + 0.6;
    centerStarsColors[i3] = brightness;
    centerStarsColors[i3 + 1] = brightness;
    centerStarsColors[i3 + 2] = brightness * 0.8;

    // Variable size
    centerStarsSizes[i] = 0.08 + Math.random() * 0.12;
  }

  centerStarsGeometry.setAttribute('position', new THREE.BufferAttribute(centerStarsPositions, 3));
  centerStarsGeometry.setAttribute('color', new THREE.BufferAttribute(centerStarsColors, 3));
  centerStarsGeometry.setAttribute('size', new THREE.BufferAttribute(centerStarsSizes, 1));

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
  milkyWayScene.userData.centerStars = centerStars;
}

/**
 * Create background star field with multiple layers
 */
function createStarField() {
  // Generate multiple star layers (near, mid, far)
  // THREE should be available as window.THREE at this point
  const starLayers = generateMultiLayerStarField(window.THREE || THREE, {
    count: 50000,
    size: 0.05,
  });

  // Store star layers for animation
  milkyWayScene.userData.starLayers = [];

  starLayers.forEach((layerData, index) => {
    // Create material for this layer
    const material = new THREE.PointsMaterial({
      size: layerData.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      opacity: 0.8 - index * 0.2, // More transparent for far layers
      transparent: true,
    });

    // Create points from geometry
    const points = new THREE.Points(layerData.geometry, material);
    milkyWayScene.add(points);

    // Store layer data for animation
    milkyWayScene.userData.starLayers.push({
      points,
      name: layerData.name,
    });
  });
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
  const sunTextureResult = createSunTexture(initialTextureResolution, THREE, {
    generateNormalMap: true,
    normalStrength: 0.5, // Subtle for sun
  });
  // Handle both old format (texture) and new format ({map, normalMap})
  const sunTexture = sunTextureResult.map || sunTextureResult;
  const sunNormalMap = sunTextureResult.normalMap || null;
  // Use MeshStandardMaterial which supports emissive and normal maps
  const sunMaterialOptions = {
    map: sunTexture,
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1.5,
  };
  if (sunNormalMap) {
    sunMaterialOptions.normalMap = sunNormalMap;
    sunMaterialOptions.normalScale = new THREE.Vector2(0.5, 0.5); // Subtle normal scale for sun
  }
  const sunMaterial = new THREE.MeshStandardMaterial(sunMaterialOptions);
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
    // Create planet with texture - using LOD for performance optimization
    // High detail geometry (32 segments) for close-up views
    const planetGeometryHigh = new THREE.SphereGeometry(config.size, 32, 32);
    // Low detail geometry (16 segments) for distant views
    const planetGeometryLow = new THREE.SphereGeometry(config.size, 16, 16);

    // Generate procedural texture for planet (lower resolution for faster loading)
    const textureResult = createPlanetTexture(config.name, config.color, initialTextureResolution, THREE, {
      generateNormalMap: true,
    });
    // Handle both old format (texture) and new format ({map, normalMap})
    const texture = textureResult.map || textureResult;
    const normalMap = textureResult.normalMap || null;
    const normalScale = normalMap ? getNormalScaleForPlanet(config.name) : undefined;

    const planetMaterialOptions = {
      map: texture,
      color: config.color,
      emissive: config.emissive || config.color,
      emissiveIntensity: 0.2,
      shininess: 30,
    };
    if (normalMap) {
      planetMaterialOptions.normalMap = normalMap;
      planetMaterialOptions.normalScale = new THREE.Vector2(normalScale, normalScale);
    }
    const planetMaterial = new THREE.MeshPhongMaterial(planetMaterialOptions);

    // Create LOD system for planet (high detail <50 units, low detail >50 units)
    const planetLOD = new THREE.LOD();
    const planetHigh = new THREE.Mesh(planetGeometryHigh, planetMaterial);
    const planetLow = new THREE.Mesh(planetGeometryLow, planetMaterial);
    planetLOD.addLevel(planetHigh, 0); // High detail when <50 units
    planetLOD.addLevel(planetLow, 50); // Low detail when >50 units
    const planet = planetLOD;

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

    // Store moon data for InstancedMesh (optimization: single draw call for all moons)
    // Moons will be created after all planets are processed
    planet.userData.moonConfigs = [];
    for (let m = 0; m < config.moons; m++) {
      const moonDistance = config.size * 1.5 + m * config.size * 0.5;
      const moonAngle = (m / config.moons) * Math.PI * 2;
      planet.userData.moonConfigs.push({
        distance: moonDistance,
        angle: moonAngle,
        speed: config.speed * 1.5, // Moons orbit faster but still slower
        parentPlanet: planet,
        size: config.size * 0.3,
      });
    }
  });

  // Create InstancedMesh for all moons (optimization: reduces 18+ draw calls to 1)
  // Count total moons first
  let totalMoons = 0;
  planets.forEach(planet => {
    if (planet.userData.moonConfigs) {
      totalMoons += planet.userData.moonConfigs.length;
    }
  });

  if (totalMoons > 0) {
    // Create shared geometry and material for all moons
    const moonGeometry = new THREE.SphereGeometry(1, 16, 16); // Base size 1, will be scaled per instance
    const moonTextureResult = createMoonTexture(initialTextureResolution, THREE, {
      generateNormalMap: true,
      normalStrength: 1.5, // Stronger for craters
    });
    // Handle both old format (texture) and new format ({map, normalMap})
    const moonTexture = moonTextureResult.map || moonTextureResult;
    const moonNormalMap = moonTextureResult.normalMap || null;
    const moonMaterialOptions = {
      map: moonTexture,
      color: 0xcccccc,
      emissive: 0x444444,
      emissiveIntensity: 0.1,
    };
    if (moonNormalMap) {
      moonMaterialOptions.normalMap = moonNormalMap;
      moonMaterialOptions.normalScale = new THREE.Vector2(1.5, 1.5); // Strong normal scale for craters
    }
    const moonMaterial = new THREE.MeshPhongMaterial(moonMaterialOptions);

    // Create InstancedMesh for all moons
    const moonInstances = new THREE.InstancedMesh(moonGeometry, moonMaterial, totalMoons);
    moonInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Will be updated every frame

    // Store moon instance data for animation
    milkyWayScene.userData.moonInstances = moonInstances;
    milkyWayScene.userData.moonData = [];

    // Initialize moon instances and store data
    const dummy = new THREE.Object3D();
    let moonIndex = 0;

    planets.forEach(planet => {
      if (planet.userData.moonConfigs) {
        planet.userData.moonConfigs.forEach(moonConfig => {
          // Calculate initial moon position relative to planet
          const moonX = Math.cos(moonConfig.angle) * moonConfig.distance;
          const moonZ = Math.sin(moonConfig.angle) * moonConfig.distance;

          // Get planet world position
          const planetWorldPos = new THREE.Vector3();
          planet.getWorldPosition(planetWorldPos);

          // Set transform for this instance
          dummy.position.set(
            planetWorldPos.x + moonX,
            planetWorldPos.y,
            planetWorldPos.z + moonZ
          );
          dummy.scale.set(moonConfig.size, moonConfig.size, moonConfig.size);
          dummy.updateMatrix();
          moonInstances.setMatrixAt(moonIndex, dummy.matrix);

          // Store moon data for animation
          milkyWayScene.userData.moonData.push({
            index: moonIndex,
            distance: moonConfig.distance,
            angle: moonConfig.angle,
            speed: moonConfig.speed,
            parentPlanet: moonConfig.parentPlanet,
            size: moonConfig.size,
          });

          moonIndex++;
        });
      }
    });

    moonInstances.instanceMatrix.needsUpdate = true;
    milkyWayScene.add(moonInstances);
  }

  // Setup dynamic lighting with shadows
  const lights = setupDynamicLighting(THREE, milkyWayScene, sun, planets, milkyWayRenderer);
  milkyWayScene.userData.lights = lights;
  // Store lights for easy access in settings
  milkyWayScene.userData.ambientLightObj = lights.ambientLight;
  milkyWayScene.userData.directionalLight = lights.sunDirectionalLight;

  // Add atmospheric glow to planets
  const atmosphereConfigs = {
    Terra: { color: 0x66aaff, intensity: 0.4 },
    Crystal: { color: 0x88ccff, intensity: 0.3 },
    Aurora: { color: 0x66ff88, intensity: 0.35 },
    Nebula: { color: 0xaa88ff, intensity: 0.3 },
  };
  // Pass initial camera position to prevent first-frame atmosphere glitch
  addAtmospheresToPlanets(THREE, planets, atmosphereConfigs, milkyWayCamera.position.clone());
  // Ensure all atmospheres are visible by default
  planets.forEach(planet => {
    const atmosphere = planet.userData.atmosphereMesh;
    if (atmosphere) {
      atmosphere.visible = true;
    }
  });

  // Store planets for lighting updates
  milkyWayScene.userData.planets = planets;
  milkyWayScene.userData.sun = sun;

  // Add realistic rotation speeds to planets
  planets.forEach(planet => {
    if (!planet.userData.rotationSpeed) {
      planet.userData.rotationSpeed = calculateRealisticRotationSpeed(
        planet.userData.size,
        planet.userData.distance
      );
    }
  });

  // Add Lagrange point markers to larger planets
  const largePlanets = planets.filter(p => p.userData.size >= 1.0);
  milkyWayScene.userData.lagrangeGroups = [];
  largePlanets.forEach(planet => {
    const lagrangeGroup = createLagrangePointMarkers(THREE, planet, sun);
    lagrangeGroup.visible = false; // Hidden by default (toggleable)
    milkyWayScene.add(lagrangeGroup);
    milkyWayScene.userData.lagrangeGroups.push(lagrangeGroup);
  });
}

/**
 * Create orbital trajectory visualization
 * Draws orbital paths for planets and moons
 */
function createOrbitalTrajectories() {
  if (!milkyWayScene || !THREE) {
    return;
  }

  const planets = milkyWayScene.userData.planets;
  const sun = milkyWayScene.userData.sun;

  if (!planets || planets.length === 0 || !sun) {
    return;
  }

  try {

  // Store trajectory lines
  milkyWayScene.userData.orbitalTrajectories = {
    planetTrajectories: [],
    moonTrajectories: [],
  };

  // Create planet orbital trajectories
  planets.forEach(planet => {
    const distance = planet.userData.distance;
    const inclination = planet.userData.inclination || 0;
    const segments = 128; // Number of segments for smooth circle

    // Create geometry for orbital path
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const flatX = Math.cos(angle) * distance;
      const flatZ = Math.sin(angle) * distance;
      // Apply orbital inclination
      const x = flatX;
      const y = flatZ * Math.sin(inclination);
      const z = flatZ * Math.cos(inclination);
      points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      opacity: 0.3,
      transparent: true,
      linewidth: 1,
    });

    const trajectory = new THREE.Line(geometry, material);
    trajectory.visible = false; // Hidden by default
    trajectory.userData.isOrbitalTrajectory = true;
    trajectory.userData.planet = planet;
    milkyWayScene.add(trajectory);
    milkyWayScene.userData.orbitalTrajectories.planetTrajectories.push(trajectory);

    // Create moon orbital trajectories
    if (planet.userData.moonConfigs) {
      planet.userData.moonConfigs.forEach(moonConfig => {
        const moonDistance = moonConfig.distance;
        const moonSegments = 64;

        const moonPoints = [];
        for (let i = 0; i <= moonSegments; i++) {
          const angle = (i / moonSegments) * Math.PI * 2;
          moonPoints.push(new THREE.Vector3(
            Math.cos(angle) * moonDistance,
            0,
            Math.sin(angle) * moonDistance
          ));
        }

        const moonGeometry = new THREE.BufferGeometry().setFromPoints(moonPoints);
        const moonMaterial = new THREE.LineBasicMaterial({
          color: 0x00ff88,
          opacity: 0.2,
          transparent: true,
          linewidth: 1,
        });

        const moonTrajectory = new THREE.Line(moonGeometry, moonMaterial);
        moonTrajectory.visible = false; // Hidden by default
        moonTrajectory.userData.isMoonTrajectory = true;
        moonTrajectory.userData.planet = planet;
        moonTrajectory.userData.moonConfig = moonConfig;
        milkyWayScene.add(moonTrajectory);
        milkyWayScene.userData.orbitalTrajectories.moonTrajectories.push(moonTrajectory);
      });
    }
  });
  } catch (error) {
    if (isDevelopmentEnv()) {
      console.warn('[Easter Egg] Failed to create orbital trajectories:', error);
    }
    // Don't break the scene if trajectory creation fails
  }
}

/**
 * Update orbital trajectory positions (for moons, which orbit around planets)
 */
function updateOrbitalTrajectories() {
  if (!milkyWayScene || !milkyWayScene.userData.orbitalTrajectories) {
    return;
  }

  const { moonTrajectories } = milkyWayScene.userData.orbitalTrajectories;

  // Update moon trajectory positions to follow their parent planets
  moonTrajectories.forEach(trajectory => {
    if (!trajectory.visible) {
      return;
    }

    const planet = trajectory.userData.planet;
    if (!planet) {
      return;
    }

    // Get planet's world position
    const planetWorldPos = new THREE.Vector3();
    planet.getWorldPosition(planetWorldPos);

    // Update trajectory position to match planet
    trajectory.position.copy(planetWorldPos);
  });
}

/**
 * Create particle effects (asteroid belts, comets, solar wind, space dust, space stations)
 */
function createParticleEffects() {
  const planets = milkyWayScene.userData.planets;
  const sun = milkyWayScene.userData.sun;

  if (!planets || !sun) {
    return;
  }

  // Store particle effects for animation
  milkyWayScene.userData.particleEffects = {
    asteroidBelts: [],
    comets: [],
    solarWind: null,
    spaceDust: null,
    spaceStations: [],
  };

  // Add asteroid belt to one planet (Titan - the largest)
  const titanPlanet = planets.find(p => p.userData.name === 'Titan');
  if (titanPlanet) {
    const asteroidBelt = createAsteroidBelt(THREE, titanPlanet, {
      count: 2000,
      innerRadius: titanPlanet.userData.size * 1.8,
      outerRadius: titanPlanet.userData.size * 2.5,
      size: 0.02,
    });
    asteroidBelt.visible = true; // Ensure visible by default
    milkyWayScene.userData.particleEffects.asteroidBelts.push(asteroidBelt);
  }

  // Create 2-3 rare comets
  const cometCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < cometCount; i++) {
    const comet = createComet(THREE, milkyWayScene, {
      size: 0.15,
      trailLength: 50,
      color: 0x88ccff,
      speed: 0.015 + Math.random() * 0.01,
      orbitRadius: 80 + Math.random() * 40,
      orbitAngle: Math.random() * Math.PI * 2,
    });
    // Ensure comet core and trail are visible
    if (comet.core) comet.core.visible = true;
    if (comet.trail) comet.trail.visible = true;
    milkyWayScene.userData.particleEffects.comets.push(comet);
  }

  // Create solar wind from sun
  const solarWind = createSolarWind(THREE, sun, {
    count: 5000,
    size: 0.01,
    speed: 0.05,
    spread: 0.3,
  });
  solarWind.visible = true; // Ensure visible by default
  milkyWayScene.userData.particleEffects.solarWind = solarWind;

  // Create space dust
  const spaceDust = createSpaceDust(THREE, milkyWayScene, {
    count: 10000,
    size: 0.005,
    radius: 200,
  });
  spaceDust.visible = true; // Ensure visible by default
  milkyWayScene.userData.particleEffects.spaceDust = spaceDust;

  // Add space stations to a few planets
  const stationPlanets = planets.filter((p, i) => i % 3 === 0 && p.userData.name !== 'Pyro');
  stationPlanets.forEach(planet => {
    const station = createSpaceStation(THREE, planet, {
      distance: planet.userData.size * 2.5,
      size: 0.1,
    });
    station.visible = true; // Ensure visible by default
    milkyWayScene.userData.particleEffects.spaceStations.push(station);
  });
}

/**
 * Create nebula and space clouds
 */
function createNebulaAndClouds() {
  // Create interstellar medium (subtle fog effect)
  createInterstellarMedium(THREE, milkyWayScene, {
    color: 0x000000,
    density: 0.00005, // Very subtle
  });

  // Create nebula field (3-4 nebulas)
  const nebulas = createNebulaField(THREE, milkyWayScene, 3);
  nebulas.forEach(nebula => {
    nebula.visible = true; // Ensure visible by default
  });
  milkyWayScene.userData.nebulas = nebulas;

  // Create 1-2 star-forming regions (moved far from central galaxy)
  milkyWayScene.userData.starFormingRegions = [];
  for (let i = 0; i < 2; i++) {
    const angle = (i / 2) * Math.PI * 2;
    const distance = 200 + Math.random() * 100; // Moved from 50-80 to 200-300 units away
    const position = new THREE.Vector3(
      Math.cos(angle) * distance,
      (Math.random() - 0.5) * 40,
      Math.sin(angle) * distance
    );

    const region = createStarFormingRegion(THREE, milkyWayScene, {
      position: position,
      size: 3 + Math.random() * 2,
      color: 0xff88ff,
      intensity: 1.5 + Math.random() * 0.5,
    });
    region.visible = true; // Ensure visible by default
    if (region.userData.core && region.userData.core.material) {
      region.userData.baseIntensity = region.userData.core.material.emissiveIntensity;
    }
    milkyWayScene.userData.starFormingRegions.push(region);
  }

  // Create dust clouds
  milkyWayScene.userData.dustClouds = [];
  for (let i = 0; i < 2; i++) {
    const angle = (i / 2) * Math.PI * 2 + Math.PI / 4;
    const distance = 70 + Math.random() * 20;
    const position = new THREE.Vector3(
      Math.cos(angle) * distance,
      (Math.random() - 0.5) * 25,
      Math.sin(angle) * distance
    );

    const dustCloud = createDustCloud(THREE, milkyWayScene, {
      count: 6000,
      size: 0.04,
      radius: 25 + Math.random() * 15,
      position: position,
      color: 0x666666,
      density: 0.2 + Math.random() * 0.1,
    });
    dustCloud.visible = true; // Ensure visible by default
    milkyWayScene.userData.dustClouds.push(dustCloud);
  }
}

/**
 * Setup settings event listeners
 */
function setupSettingsListeners() {
  document.addEventListener('galaxy-setting-changed', (e) => {
    const { setting, value } = e.detail;
    if (isDevelopmentEnv()) {
      console.log('[Galaxy Settings] Setting changed:', setting, '=', value);
    }

    // Update local variables for settings that need them (before applying)
    if (setting === 'scrollSensitivity') {
      scrollSensitivity = value;
    } else if (setting === 'rotationSensitivity') {
      rotationSensitivity = value;
    } else if (setting === 'autoRotateGalaxy') {
      autoRotateGalaxy = value;
    } else if (setting === 'galaxyRotationSpeed') {
      galaxyRotationSpeedMultiplier = value;
    } else if (setting === 'planetRotationSpeed') {
      planetRotationSpeedMultiplier = value;
    } else if (setting === 'orbitalSpeed') {
      orbitalSpeedMultiplier = value;
    }

    applySetting(setting, value);
  });

  // Apply initial settings
  const initialState = getSettingsState();
  if (isDevelopmentEnv()) {
    console.log('[Galaxy Settings] Applying initial settings:', initialState);
  }
  Object.keys(initialState).forEach(setting => {
    // Update local variables for settings that need them
    if (setting === 'scrollSensitivity') {
      scrollSensitivity = initialState[setting];
    } else if (setting === 'rotationSensitivity') {
      rotationSensitivity = initialState[setting];
    } else if (setting === 'autoRotateGalaxy') {
      autoRotateGalaxy = initialState[setting];
    } else if (setting === 'galaxyRotationSpeed') {
      galaxyRotationSpeedMultiplier = initialState[setting];
    } else if (setting === 'planetRotationSpeed') {
      planetRotationSpeedMultiplier = initialState[setting];
    } else if (setting === 'orbitalSpeed') {
      orbitalSpeedMultiplier = initialState[setting];
    }
    // Apply the setting
    applySetting(setting, initialState[setting]);
  });
}

/**
 * Apply a setting change
 */
function applySetting(setting, value) {
  if (!milkyWayScene) {
    if (isDevelopmentEnv()) {
      console.warn('[Galaxy Settings] Cannot apply setting:', setting, '- scene not initialized');
    }
    return;
  }

  if (isDevelopmentEnv()) {
    console.log('[Galaxy Settings] Applying setting:', setting, '=', value, typeof value);
  }

  switch (setting) {
    case 'showOrbitalTrajectories':
      if (milkyWayScene.userData.orbitalTrajectories) {
        const { planetTrajectories, moonTrajectories } = milkyWayScene.userData.orbitalTrajectories;
        [...planetTrajectories, ...moonTrajectories].forEach(trajectory => {
          trajectory.visible = value;
        });
      }
      break;

    case 'showLagrangePoints':
      if (milkyWayScene.userData.lagrangeGroups) {
        milkyWayScene.userData.lagrangeGroups.forEach(group => {
          group.visible = value;
        });
      }
      break;

    case 'showSolarWind':
      if (milkyWayScene.userData.particleEffects?.solarWind) {
        milkyWayScene.userData.particleEffects.solarWind.visible = value;
      }
      break;

    case 'showAsteroidBelts':
      if (milkyWayScene.userData.particleEffects?.asteroidBelts) {
        milkyWayScene.userData.particleEffects.asteroidBelts.forEach(belt => {
          belt.visible = value;
        });
      }
      break;

    case 'showComets':
      if (milkyWayScene.userData.particleEffects?.comets) {
        milkyWayScene.userData.particleEffects.comets.forEach(comet => {
          if (comet.core) comet.core.visible = value;
          if (comet.trail) comet.trail.visible = value;
        });
      }
      break;

    case 'showSpaceDust':
      if (milkyWayScene && milkyWayScene.userData.particleEffects?.spaceDust) {
        milkyWayScene.userData.particleEffects.spaceDust.visible = value;
        if (isDevelopmentEnv()) {
          console.log('[Galaxy Settings] Space dust visibility:', value);
        }
      } else if (isDevelopmentEnv()) {
        console.warn('[Galaxy Settings] Cannot toggle space dust - not found', {
          scene: !!milkyWayScene,
          particleEffects: !!milkyWayScene?.userData?.particleEffects,
          spaceDust: !!milkyWayScene?.userData?.particleEffects?.spaceDust
        });
      }
      break;

    case 'showSpaceStations':
      if (milkyWayScene && milkyWayScene.userData.particleEffects?.spaceStations) {
        let visibleCount = 0;
        milkyWayScene.userData.particleEffects.spaceStations.forEach(station => {
          if (station) {
            station.visible = value;
            if (value) visibleCount++;
          }
        });
        if (isDevelopmentEnv()) {
          console.log('[Galaxy Settings] Space stations visibility:', value, 'count:', milkyWayScene.userData.particleEffects.spaceStations.length);
        }
      } else if (isDevelopmentEnv()) {
        console.warn('[Galaxy Settings] Cannot toggle space stations - not found', {
          scene: !!milkyWayScene,
          particleEffects: !!milkyWayScene?.userData?.particleEffects,
          spaceStations: !!milkyWayScene?.userData?.particleEffects?.spaceStations
        });
      }
      break;

    case 'showNebulas':
      milkyWayScene.userData.nebulasEnabled = value;
      if (milkyWayScene.userData.nebulas) {
        milkyWayScene.userData.nebulas.forEach(nebula => {
          nebula.visible = value;
        });
      }
      // Also toggle star-forming regions and dust clouds (they're part of nebula effects)
      if (milkyWayScene.userData.starFormingRegions) {
        milkyWayScene.userData.starFormingRegionsEnabled = value;
        milkyWayScene.userData.starFormingRegions.forEach(region => {
          region.visible = value;
        });
      }
      if (milkyWayScene.userData.dustClouds) {
        milkyWayScene.userData.dustCloudsEnabled = value;
        milkyWayScene.userData.dustClouds.forEach(cloud => {
          cloud.visible = value;
        });
      }
      break;

    case 'showStarTwinkling':
      // This is handled in the animation loop
      if (milkyWayScene) {
        milkyWayScene.userData.starTwinklingEnabled = value;
        if (isDevelopmentEnv()) {
          console.log('[Galaxy Settings] Star twinkling:', value);
        }
      }
      break;

    case 'showAtmospheres':
      // Toggle visibility of atmosphere meshes
      milkyWayScene.userData.atmospheresEnabled = value;
      if (milkyWayScene.userData.planets) {
        milkyWayScene.userData.planets.forEach(planet => {
          const atmosphere = planet.userData.atmosphereMesh;
          if (atmosphere) {
            atmosphere.visible = value;
          }
        });
      }
      break;

    case 'showPostProcessing':
      if (milkyWayScene.userData.postProcessing) {
        milkyWayScene.userData.postProcessing.enabled = value;
      }
      break;

    // Camera & Controls
    case 'autoRotateGalaxy':
      autoRotateGalaxy = value;
      if (isDevelopmentEnv()) {
        console.log('[Galaxy Settings] Auto-rotate galaxy:', value, 'variable set to:', autoRotateGalaxy);
      }
      break;

    case 'scrollSensitivity':
      scrollSensitivity = value;
      break;

    case 'rotationSensitivity':
      rotationSensitivity = value;
      break;

    case 'showMoons':
      if (milkyWayScene && milkyWayScene.userData.moonInstances) {
        milkyWayScene.userData.moonInstances.visible = value;
        if (isDevelopmentEnv()) {
          console.log('[Galaxy Settings] Moons visibility:', value, 'moonInstances exists:', !!milkyWayScene.userData.moonInstances);
        }
      } else if (isDevelopmentEnv()) {
        console.warn('[Galaxy Settings] Cannot toggle moons - moonInstances not found', {
          scene: !!milkyWayScene,
          moonInstances: !!milkyWayScene?.userData?.moonInstances
        });
      }
      break;

    // Animation Speed
    case 'galaxyRotationSpeed':
      galaxyRotationSpeedMultiplier = value;
      break;

    case 'planetRotationSpeed':
      planetRotationSpeedMultiplier = value;
      break;

    case 'orbitalSpeed':
      orbitalSpeedMultiplier = value;
      break;

    // Visual Quality
    case 'showStarField':
      if (milkyWayScene && milkyWayScene.userData.starLayers && Array.isArray(milkyWayScene.userData.starLayers)) {
        let visibleCount = 0;
        milkyWayScene.userData.starLayers.forEach(layer => {
          if (layer && layer.points) {
            layer.points.visible = value;
            if (value) visibleCount++;
          }
        });
        if (isDevelopmentEnv()) {
          console.log('[Galaxy Settings] Star field visibility:', value, 'layers:', milkyWayScene.userData.starLayers.length, 'visible:', visibleCount);
        }
      } else if (isDevelopmentEnv()) {
        console.warn('[Galaxy Settings] Cannot toggle star field - starLayers not found', {
          scene: !!milkyWayScene,
          starLayers: !!milkyWayScene?.userData?.starLayers,
          isArray: Array.isArray(milkyWayScene?.userData?.starLayers)
        });
      }
      break;

    case 'galaxyCoreBrightness':
      if (milkyWayScene && milkyWayScene.userData.centerStars) {
        const centerStars = milkyWayScene.userData.centerStars;
        const material = centerStars.material;
        if (material) {
          // Update opacity based on brightness (0-2 range)
          material.opacity = Math.min(1, value);
          material.transparent = value < 1;
          // Also update color intensity
          if (material.color) {
            material.color.setRGB(value, value, value * 0.8);
          }
          if (isDevelopmentEnv()) {
            console.log('[Galaxy Settings] Core brightness:', value, 'opacity:', material.opacity);
          }
        }
      } else if (isDevelopmentEnv()) {
        console.warn('[Galaxy Settings] Cannot update core brightness - centerStars not found', {
          scene: !!milkyWayScene,
          centerStars: !!milkyWayScene?.userData?.centerStars
        });
      }
      break;

    case 'showShadows':
      const THREE = window.THREE;
      if (milkyWayRenderer && THREE) {
        milkyWayRenderer.shadowMap.enabled = value;
        if (value) {
          milkyWayRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        if (isDevelopmentEnv()) {
          console.log('[Galaxy Settings] Shadows:', value, 'renderer shadowMap enabled:', milkyWayRenderer.shadowMap.enabled);
        }
      } else if (isDevelopmentEnv()) {
        console.warn('[Galaxy Settings] Cannot toggle shadows - renderer or THREE not available', {
          renderer: !!milkyWayRenderer,
          THREE: !!THREE
        });
      }
      // Update all objects to cast/receive shadows
      if (milkyWayScene) {
        let meshCount = 0;
        milkyWayScene.traverse((object) => {
          if (object.isMesh) {
            object.castShadow = value;
            object.receiveShadow = value;
            meshCount++;
          }
        });
        if (isDevelopmentEnv()) {
          console.log('[Galaxy Settings] Updated shadow settings for', meshCount, 'meshes');
        }
      }
      break;

    case 'antialiasing':
      // Note: Antialiasing can only be changed on renderer creation
      // This setting is stored but requires renderer recreation to take effect
      if (milkyWayScene) {
        milkyWayScene.userData.antialiasingEnabled = value;
      }
      break;

    // Lighting
    case 'sunGlowIntensity':
      const sunObj = milkyWayScene.userData.sun;
      if (sunObj && sunObj.material) {
        sunObj.material.emissiveIntensity = value;
      }
      // Also update sun glow mesh
      if (sunObj && sunObj.children.length > 0) {
        const sunGlow = sunObj.children[0];
        if (sunGlow && sunGlow.material) {
          sunGlow.material.opacity = value * 0.2;
        }
      }
      break;

    case 'ambientLight':
      if (milkyWayScene.userData.ambientLightObj) {
        milkyWayScene.userData.ambientLightObj.intensity = value;
      } else if (milkyWayScene.userData.lights && milkyWayScene.userData.lights.ambientLight) {
        // Fallback to lights object
        milkyWayScene.userData.lights.ambientLight.intensity = value;
      }
      break;

    case 'showDirectionalLight':
      if (milkyWayScene) {
        if (milkyWayScene.userData.directionalLight) {
          milkyWayScene.userData.directionalLight.visible = value;
          if (isDevelopmentEnv()) {
            console.log('[Galaxy Settings] Directional light visibility:', value, 'from userData.directionalLight');
          }
        } else if (milkyWayScene.userData.lights && milkyWayScene.userData.lights.sunDirectionalLight) {
          // Fallback to lights object
          milkyWayScene.userData.lights.sunDirectionalLight.visible = value;
          if (isDevelopmentEnv()) {
            console.log('[Galaxy Settings] Directional light visibility:', value, 'from lights.sunDirectionalLight');
          }
        } else if (isDevelopmentEnv()) {
          console.warn('[Galaxy Settings] Cannot toggle directional light - not found', {
            directionalLight: !!milkyWayScene.userData.directionalLight,
            lights: !!milkyWayScene.userData.lights,
            sunDirectionalLight: !!milkyWayScene.userData.lights?.sunDirectionalLight
          });
        }
      }
      break;

    // Performance
    case 'particleDensity':
      // Store multiplier for particle effects
      if (milkyWayScene) {
        milkyWayScene.userData.particleDensityMultiplier = value;
      }
      break;

    case 'lodDistance':
      // Update LOD switching distance for planets
      if (milkyWayScene && milkyWayScene.userData.planets) {
        milkyWayScene.userData.planets.forEach(planet => {
          if (planet.type === 'LOD' || planet.isLOD) {
            // Update LOD levels
            if (planet.levels && Array.isArray(planet.levels)) {
              planet.levels.forEach((level, index) => {
                if (index === 0) {
                  level.distance = 0;
                } else {
                  level.distance = value;
                }
              });
            }
          }
        });
      }
      break;

    // UI/Information
    case 'showPlanetLabels':
      // Store setting for label rendering
      if (milkyWayScene) {
        milkyWayScene.userData.showPlanetLabels = value;
      }
      break;

    case 'showDistanceInfo':
      // Store setting for distance info rendering
      if (milkyWayScene) {
        milkyWayScene.userData.showDistanceInfo = value;
      }
      break;

    case 'showGridOverlay':
      // Create or toggle grid overlay
      if (milkyWayScene) {
        const THREE = window.THREE;
        if (value && !milkyWayScene.userData.gridHelper && THREE) {
          const gridHelper = new THREE.GridHelper(200, 20, 0x00ffff, 0x008888);
          gridHelper.material.opacity = 0.3;
          gridHelper.material.transparent = true;
          milkyWayScene.add(gridHelper);
          milkyWayScene.userData.gridHelper = gridHelper;
          if (isDevelopmentEnv()) {
            console.log('[Galaxy Settings] Grid overlay created');
          }
        } else if (!value && milkyWayScene.userData.gridHelper) {
          milkyWayScene.remove(milkyWayScene.userData.gridHelper);
          milkyWayScene.userData.gridHelper = null;
          if (isDevelopmentEnv()) {
            console.log('[Galaxy Settings] Grid overlay removed');
          }
        } else if (milkyWayScene.userData.gridHelper) {
          milkyWayScene.userData.gridHelper.visible = value;
          if (isDevelopmentEnv()) {
            console.log('[Galaxy Settings] Grid overlay visibility:', value);
          }
        } else if (isDevelopmentEnv()) {
          console.warn('[Galaxy Settings] Cannot create grid overlay - THREE not available', {
            THREE: !!THREE
          });
        }
      }
      break;
  }
}

/**
 * Setup interactive controls
 */
function setupInteractiveControls() {
  const container = document.querySelector('.milky-way-scene');
  if (!container) {
    return;
  }

  // Mouse wheel for zoom (increased sensitivity and max zoom) - also exit planet focus when zooming out enough
  container.addEventListener(
    'wheel',
    e => {
      // Don't prevent default if the wheel event is over the settings panel
      // This allows scrolling within the settings panel
      const settingsPanel = document.querySelector('.galaxy-settings-panel');
      if (settingsPanel && (settingsPanel.contains(e.target) || e.target.closest('.galaxy-settings-panel'))) {
        return; // Let the settings panel handle the scroll
      }

      e.preventDefault();
      const delta = e.deltaY * scrollSensitivity; // Use setting value
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

  // Mouse/pointer down for drag rotation
  // Use pointer events for better cross-browser compatibility
  const handlePointerDown = (e) => {
    // Don't handle events from settings panel
    const settingsPanel = document.querySelector('.galaxy-settings-panel');
    if (settingsPanel && (settingsPanel.contains(e.target) || e.target.closest('.galaxy-settings-panel'))) {
      return; // Let the settings panel handle its own interactions
    }

    // Only handle primary button (left mouse button)
    if (e.button !== 0 && e.pointerType === 'mouse') {
      return;
    }
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    isMouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    mouseDownX = e.clientX; // Store for click detection
    mouseDownY = e.clientY; // Store for click detection
    // Visual feedback through custom cursor dot (system cursor is hidden)
    const cursorDot = document.querySelector('.cursor-dot');
    if (cursorDot) {
      cursorDot.style.transform = 'scale(2)';
    }
  };

  container.addEventListener('mousedown', handlePointerDown);
  container.addEventListener('pointerdown', handlePointerDown);

  // Mouse/pointer up - handle on document to catch mouseup even if mouse leaves container
  const handlePointerUp = (e) => {
    // Only handle primary button (left mouse button) or if it's not a mouse event
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }
    // Always reset isMouseDown, even if button check fails (safety measure)
    if (isMouseDown) {
      isMouseDown = false;
      // Reset custom cursor dot scale
      const cursorDot = document.querySelector('.cursor-dot');
      if (cursorDot) {
        cursorDot.style.transform = 'scale(1)';
      }
    }
  };

  document.addEventListener('mouseup', handlePointerUp);
  document.addEventListener('pointerup', handlePointerUp);
  // Also handle mouseleave to reset state if mouse leaves window
  document.addEventListener('mouseleave', handlePointerUp);
  container.addEventListener('mouseleave', (e) => {
    // Only reset if mouse actually left (not just moved to child element)
    if (!container.contains(e.relatedTarget)) {
      handlePointerUp(e);
    }
  });

  // Mouse/pointer move for rotation
  const handlePointerMove = (e) => {
    if (!isMouseDown || !isEasterEggActive) {
      return;
    }

    // Don't handle events from settings panel
    const settingsPanel = document.querySelector('.galaxy-settings-panel');
    if (settingsPanel && (settingsPanel.contains(e.target) || e.target.closest('.galaxy-settings-panel'))) {
      // Reset drag state if mouse moves over settings panel
      isMouseDown = false;
      const cursorDot = document.querySelector('.cursor-dot');
      if (cursorDot) {
        cursorDot.style.transform = 'scale(1)';
      }
      return;
    }

    // Only prevent default if we're actually dragging (mouse button is down)
    // Check if buttons property indicates left button is pressed
    if (e.buttons === undefined || (e.buttons & 1) === 1) {
      e.preventDefault();
    } else {
      // Mouse button is not actually pressed, reset state (Chrome fix)
      isMouseDown = false;
      const cursorDot = document.querySelector('.cursor-dot');
      if (cursorDot) {
        cursorDot.style.transform = 'scale(1)';
      }
      return;
    }

    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    cameraRotationY += deltaX * rotationSensitivity; // Use setting value
    cameraRotationX += deltaY * rotationSensitivity; // Use setting value

    // Limit vertical rotation
    cameraRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotationX));

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  };

  document.addEventListener('mousemove', handlePointerMove);
  document.addEventListener('pointermove', handlePointerMove);

  // Custom cursor dot will provide visual feedback (system cursor is hidden)

  // Initialize raycaster for planet clicking
  raycaster = new THREE.Raycaster();
  mouse2D = new THREE.Vector2();

  // Add click handler for planets and sun
  // Use a small threshold to distinguish clicks from drags
  let mouseDownX = 0;
  let mouseDownY = 0;
  const CLICK_THRESHOLD = 5; // pixels - if mouse moved more than this, it's a drag, not a click

  container.addEventListener('click', e => {
    if (!isEasterEggActive) {
      return;
    }

    // Check if this was actually a drag (mouse moved significantly)
    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - mouseDownX, 2) + Math.pow(e.clientY - mouseDownY, 2)
    );
    if (moveDistance > CLICK_THRESHOLD) {
      // This was a drag, not a click
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
    // Since planets are now LOD objects, we need to check recursively (includes children)
    const intersects = raycaster.intersectObjects(planets, true); // true = recursive (check children)

    if (intersects.length > 0) {
      // Get the actual planet object (might be LOD or child mesh)
      let planet = intersects[0].object;

      // If we hit a child mesh of LOD, traverse up to find the LOD parent
      // This is necessary because LOD objects have child meshes that are actually hit by the raycaster
      while (planet && planet.type !== 'LOD' && planet.parent) {
        if (planet.parent.type === 'LOD') {
          planet = planet.parent;
          break;
        }
        planet = planet.parent;
      }

      // Ensure we have a valid planet (should be LOD or sun)
      if (planet && (planet.type === 'LOD' || planet === sun)) {
        centerOnPlanet(planet);
      }
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
  // For LOD objects, we need to get the world position
  const initialPlanetPos = new THREE.Vector3();
  planet.getWorldPosition(initialPlanetPos);

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
    // For LOD objects, get world position
    const currentPlanetPos = new THREE.Vector3();
    planet.getWorldPosition(currentPlanetPos);

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
let animationTime = 0;

function animateMilkyWay() {
  if (!isEasterEggActive) {
    return;
  }

  // Ensure scene, camera, and renderer exist before proceeding
  if (!milkyWayScene || !milkyWayCamera || !milkyWayRenderer) {
    return;
  }

  milkyWayAnimationId = requestAnimationFrame(animateMilkyWay);

  // Update animation time for twinkling
  animationTime += 0.016; // Approximate frame time (60fps)

  // Auto-rotate camera if enabled
  if (autoRotateGalaxy && !centeredPlanet && !isAnimatingToPlanet) {
    cameraRotationY += autoRotateSpeed;
  }

  // Rotate multiple galaxy layers at different speeds (differential rotation)
  if (milkyWayScene && milkyWayScene.userData.galaxyLayers) {
    milkyWayScene.userData.galaxyLayers.forEach(layer => {
      layer.points.rotation.y += layer.rotationSpeed * galaxyRotationSpeedMultiplier;
    });
  }

  // Rotate center stars (galactic core)
  if (milkyWayScene && milkyWayScene.userData.centerStars) {
    milkyWayScene.userData.centerStars.rotation.y += 0.0006 * galaxyRotationSpeedMultiplier;
    milkyWayScene.userData.centerStars.rotation.x += 0.0003 * galaxyRotationSpeedMultiplier;
  }

  // Update star field twinkling (GPU-accelerated when available, otherwise CPU with optimizations)
  // On mobile, skip twinkling updates entirely to prevent glitchy/fast animations
  // Also check if twinkling is enabled in settings
  if (milkyWayScene && milkyWayScene.userData.starLayers && milkyWayScene.userData.starTwinklingEnabled !== false) {
    const isMobile = isMobileDevice();
    if (!isMobile) {
      const gpuCompute = milkyWayScene.userData.gpuCompute;

      // Try GPU compute if available (WebGPU or WebGL2 transform feedback)
      if (gpuCompute && gpuCompute.updateStarTwinkling) {
        // GPU-accelerated update
        milkyWayScene.userData.starLayers.forEach(layer => {
          gpuCompute.updateStarTwinkling(layer.points, animationTime, false);
        });
      } else {
        // CPU-based update with frame skipping optimization
        // Store frame counter in scene userData
        if (!milkyWayScene.userData.starTwinkleFrameCounter) {
          milkyWayScene.userData.starTwinkleFrameCounter = 0;
        }
        milkyWayScene.userData.starTwinkleFrameCounter++;

        // Update every 2 frames (reduces CPU load by 50% with minimal visual impact)
        if (milkyWayScene.userData.starTwinkleFrameCounter % 2 === 0) {
          milkyWayScene.userData.starLayers.forEach(layer => {
            updateStarTwinkling(layer.points, animationTime, undefined, false);
          });
        }
      }
    }
    // On mobile, skip twinkling entirely (stars remain static)
  }

  // Update lighting based on sun position
  if (milkyWayScene && milkyWayScene.userData.lights && milkyWayScene.userData.sun) {
    updateLighting(milkyWayScene.userData.sun, milkyWayScene.userData.lights);
  }

  // Update atmospheric glows based on camera (if enabled in settings)
  if (milkyWayScene && milkyWayCamera && milkyWayScene.userData.planets && milkyWayScene.userData.atmospheresEnabled !== false) {
    updateAtmospheres(milkyWayCamera, milkyWayScene.userData.planets);
  }

  // Update orbital trajectories (for moons that orbit around planets)
  if (milkyWayScene && milkyWayScene.userData.orbitalTrajectories) {
    updateOrbitalTrajectories();
  }

  // Update particle effects
  if (milkyWayScene && milkyWayScene.userData.particleEffects) {
    const effects = milkyWayScene.userData.particleEffects;

    // Update asteroid belts
    effects.asteroidBelts.forEach(belt => {
      updateAsteroidBelt(belt);
    });

    // Update comets
    effects.comets.forEach(comet => {
      updateComet(comet);
    });

    // Update solar wind (GPU-accelerated when available, otherwise CPU)
    if (effects.solarWind) {
      const gpuCompute = milkyWayScene.userData.gpuCompute;
      if (gpuCompute && gpuCompute.updateSolarWind) {
        // GPU-accelerated update (future implementation)
        gpuCompute.updateSolarWind(effects.solarWind, animationTime * 0.016);
      } else {
        // CPU-based update
        updateSolarWind(effects.solarWind);
      }
    }

    // Update space stations
    effects.spaceStations.forEach(station => {
      updateSpaceStation(station);
    });
  }

  // Update nebula and clouds (if enabled)
  if (milkyWayScene && milkyWayScene.userData.nebulas && milkyWayScene.userData.nebulasEnabled !== false) {
    milkyWayScene.userData.nebulas.forEach(nebula => {
      if (nebula.visible) {
        updateNebula(nebula, animationTime);
      }
    });
  }

  // Update star-forming regions (if enabled)
  if (milkyWayScene && milkyWayScene.userData.starFormingRegions && milkyWayScene.userData.starFormingRegionsEnabled !== false) {
    milkyWayScene.userData.starFormingRegions.forEach(region => {
      if (region.visible) {
        updateStarFormingRegion(region, animationTime);
      }
    });
  }

  // Update dust clouds (if enabled - they're static but should respect visibility)
  if (milkyWayScene && milkyWayScene.userData.dustClouds && milkyWayScene.userData.dustCloudsEnabled !== false) {
    // Dust clouds are static, visibility is handled by the toggle
  }

  // Rotate sun (slower)
  if (sun) {
    sun.rotation.y += 0.001;
  }

  // Update celestial mechanics (realistic rotations)
  if (milkyWayScene && milkyWayScene.userData.planets) {
    updateCelestialMechanics(milkyWayScene.userData.planets);
  }

  // Update Lagrange points
  if (milkyWayScene && milkyWayScene.userData.lagrangeGroups) {
    milkyWayScene.userData.lagrangeGroups.forEach(group => {
      updateLagrangePoints(THREE, group);
    });
  }

  // Animate planets in orbit
  planets.forEach(planet => {
    planet.userData.angle += planet.userData.speed * orbitalSpeedMultiplier;

    // Calculate position in flat orbit plane
    const flatX = Math.cos(planet.userData.angle) * planet.userData.distance;
    const flatZ = Math.sin(planet.userData.angle) * planet.userData.distance;

    // Apply orbital inclination rotation around X-axis
    const inclination = planet.userData.inclination || 0;
    planet.position.x = flatX;
    planet.position.y = flatZ * Math.sin(inclination);
    planet.position.z = flatZ * Math.cos(inclination);

    // Use realistic rotation speed (already set in createCelestialBodies)
    if (planet.userData.rotationSpeed) {
      planet.rotation.y += planet.userData.rotationSpeed * planetRotationSpeedMultiplier;
    } else {
      planet.rotation.y += 0.002 * planetRotationSpeedMultiplier; // Fallback
    }
  });

  // Animate moons around their planets (using InstancedMesh for performance)
  if (milkyWayScene && milkyWayScene.userData.moonInstances && milkyWayScene.userData.moonData) {
    const moonInstances = milkyWayScene.userData.moonInstances;
    const moonData = milkyWayScene.userData.moonData;
    const dummy = new THREE.Object3D();

    moonData.forEach(moon => {
      // Update moon angle
      moon.angle += moon.speed * orbitalSpeedMultiplier;

      // Get parent planet position
      const parentPlanet = moon.parentPlanet;
      const planetWorldPos = new THREE.Vector3();
      parentPlanet.getWorldPosition(planetWorldPos);

      // Calculate moon position relative to planet
      const moonX = Math.cos(moon.angle) * moon.distance;
      const moonZ = Math.sin(moon.angle) * moon.distance;

      // Set transform for this instance (relative to planet's world position)
      dummy.position.set(
        planetWorldPos.x + moonX,
        planetWorldPos.y,
        planetWorldPos.z + moonZ
      );
      dummy.scale.set(moon.size, moon.size, moon.size);
      dummy.updateMatrix();
      moonInstances.setMatrixAt(moon.index, dummy.matrix);
    });

    moonInstances.instanceMatrix.needsUpdate = true;
  }

  // Update camera position based on interactive controls or centered planet
  if (milkyWayCamera) {
    // Don't update camera during planet animation - let the animation handle it
    if (isAnimatingToPlanet) {
      // Camera position is being animated, skip normal update but still render
      if (milkyWayScene && milkyWayScene.userData.postProcessing && milkyWayScene.userData.postProcessing.composer) {
        try {
          const focusTarget = centeredPlanet ? centeredPlanet.position : new THREE.Vector3(0, 0, 0);
          updatePostProcessing(milkyWayCamera, updateCameraVelocity(milkyWayCamera), focusTarget);
        } catch (error) {
          if (milkyWayRenderer && milkyWayScene && milkyWayCamera) {
            milkyWayRenderer.render(milkyWayScene, milkyWayCamera);
          }
        }
      } else if (milkyWayRenderer && milkyWayScene && milkyWayCamera) {
        milkyWayRenderer.render(milkyWayScene, milkyWayCamera);
      }
      return;
    }

    if (centeredPlanet) {
      // If centered on a planet, keep looking at it (follow its orbit)
      // For LOD objects, get world position
      const planetPos = new THREE.Vector3();
      centeredPlanet.getWorldPosition(planetPos);

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

  // Update camera velocity for motion blur
  const cameraVelocity = updateCameraVelocity(milkyWayCamera);

  // Try to use post-processing if available, otherwise use standard render
  let rendered = false;
  if (milkyWayScene && milkyWayScene.userData.postProcessing && milkyWayScene.userData.postProcessing.composer && milkyWayScene.userData.postProcessing.enabled !== false) {
    try {
      const focusTarget = centeredPlanet ? centeredPlanet.position : new THREE.Vector3(0, 0, 0);
      updatePostProcessing(milkyWayCamera, cameraVelocity, focusTarget);
      rendered = true;
    } catch (error) {
      if (isDevelopmentEnv()) {
        console.warn('[Easter Egg] Post-processing render failed, falling back to standard render:', error);
      }
      // Fall through to standard render
    }
  }

  // Standard render if post-processing not available or failed
  if (!rendered && milkyWayRenderer && milkyWayScene && milkyWayCamera) {
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

  // Resize post-processing
  if (milkyWayScene && milkyWayScene.userData.postProcessing) {
    resizePostProcessing(window.innerWidth, window.innerHeight);
  }
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

  // Stop ambient audio
  stopAmbientAudio();

  // Reset animation time
  animationTime = 0;

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
  // Moons are now part of InstancedMesh, cleaned up with scene disposal
  if (milkyWayScene && milkyWayScene.userData.moonInstances) {
    milkyWayScene.userData.moonInstances = null;
    milkyWayScene.userData.moonData = null;
  }

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

  // Cleanup settings UI
  cleanupGalaxySettings();

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

    // Restore main content and structural elements (navbar, footer)
    const mainContent = document.getElementById('main-content');
    const navbar = document.querySelector('.navbar, #navbar, nav.navbar');
    const footer = document.querySelector('footer');

    // Restore main content
    if (mainContent && mainContent.dataset.originalDisplay !== undefined) {
      mainContent.style.display = mainContent.dataset.originalDisplay;
      delete mainContent.dataset.originalDisplay;
    }

    // Restore navbar
    if (navbar && navbar.dataset.originalDisplay !== undefined) {
      navbar.style.display = navbar.dataset.originalDisplay;
      delete navbar.dataset.originalDisplay;
    }

    // Restore footer
    if (footer && footer.dataset.originalDisplay !== undefined) {
      footer.style.display = footer.dataset.originalDisplay;
      delete footer.dataset.originalDisplay;
    }

    // Fallback: restore other elements that were hidden (if main-content doesn't exist)
    if (!mainContent) {
      const fallbackElements = document.querySelectorAll('body > *:not(.easter-egg-vortex):not(.milky-way-scene):not(.milky-way-menu):not(.milky-way-loading)');
      fallbackElements.forEach(el => {
        if (el && el.dataset.originalDisplay !== undefined) {
          el.style.display = el.dataset.originalDisplay;
          delete el.dataset.originalDisplay;
        }
      });
    }

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
