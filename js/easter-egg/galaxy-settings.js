/**
 * Galaxy Settings UI Module
 * Provides a collapsible settings panel for toggling visual effects
 */

let settingsPanel = null;
let settingsState = {
  // Existing toggles
  showOrbitalTrajectories: false,
  showSolarWind: true,
  showNebulas: true,
  showAsteroidBelts: true,
  showComets: true,
  showSpaceDust: true,
  showSpaceStations: true,
  showStarTwinkling: true,
  showPostProcessing: true,
  showAtmospheres: true,
  showLagrangePoints: false,
  // Camera & Controls
  autoRotateGalaxy: false,
  scrollSensitivity: 0.025,
  rotationSensitivity: 0.005,
  showMoons: true,
  // Animation Speed
  galaxyRotationSpeed: 1.0,
  planetRotationSpeed: 1.0,
  orbitalSpeed: 1.0,
  // Visual Quality
  showStarField: true,
  galaxyCoreBrightness: 1.0,
  showShadows: false,
  antialiasing: true,
  // Lighting
  sunGlowIntensity: 1.5,
  ambientLight: 0.3,
  showDirectionalLight: true,
  // Performance
  particleDensity: 1.0,
  lodDistance: 50.0,
  // UI/Information
  showPlanetLabels: false,
  showDistanceInfo: false,
  showGridOverlay: false,
};

/**
 * Initialize the galaxy settings UI
 * @param {HTMLElement} container - Container element for the settings panel
 */
export function initGalaxySettings(container) {
  if (settingsPanel) {
    return; // Already initialized
  }

  // Create settings panel
  settingsPanel = document.createElement('div');
  settingsPanel.className = 'galaxy-settings-panel';
  settingsPanel.innerHTML = `
    <button class="galaxy-settings-toggle" aria-label="Toggle settings panel">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M2 17L10 12L18 17" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M2 12L10 7L18 12" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    </button>
    <div class="galaxy-settings-content">
      <div class="galaxy-settings-header">
        <h3>Galaxy Settings</h3>
        <button class="galaxy-settings-close" aria-label="Close settings">×</button>
      </div>
      <div class="galaxy-settings-body">
        <div class="galaxy-settings-group">
          <h4>Camera & Controls</h4>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-auto-rotate-galaxy" ${settingsState.autoRotateGalaxy ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Auto-Rotate Galaxy</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-show-moons" ${settingsState.showMoons ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Show Moons</span>
          </label>
          <div class="galaxy-settings-slider-item">
            <label for="setting-scroll-sensitivity">Scroll Sensitivity: <span id="setting-scroll-sensitivity-value">${(settingsState.scrollSensitivity * 100).toFixed(0)}%</span></label>
            <input type="range" id="setting-scroll-sensitivity" min="0.01" max="0.1" step="0.005" value="${settingsState.scrollSensitivity}">
          </div>
          <div class="galaxy-settings-slider-item">
            <label for="setting-rotation-sensitivity">Rotation Sensitivity: <span id="setting-rotation-sensitivity-value">${(settingsState.rotationSensitivity * 1000).toFixed(0)}</span></label>
            <input type="range" id="setting-rotation-sensitivity" min="0.001" max="0.02" step="0.001" value="${settingsState.rotationSensitivity}">
          </div>
        </div>
        <div class="galaxy-settings-group">
          <h4>Animation Speed</h4>
          <div class="galaxy-settings-slider-item">
            <label for="setting-galaxy-rotation-speed">Galaxy Rotation: <span id="setting-galaxy-rotation-speed-value">${(settingsState.galaxyRotationSpeed * 100).toFixed(0)}%</span></label>
            <input type="range" id="setting-galaxy-rotation-speed" min="0" max="3" step="0.1" value="${settingsState.galaxyRotationSpeed}">
          </div>
          <div class="galaxy-settings-slider-item">
            <label for="setting-planet-rotation-speed">Planet Rotation: <span id="setting-planet-rotation-speed-value">${(settingsState.planetRotationSpeed * 100).toFixed(0)}%</span></label>
            <input type="range" id="setting-planet-rotation-speed" min="0" max="3" step="0.1" value="${settingsState.planetRotationSpeed}">
          </div>
          <div class="galaxy-settings-slider-item">
            <label for="setting-orbital-speed">Orbital Speed: <span id="setting-orbital-speed-value">${(settingsState.orbitalSpeed * 100).toFixed(0)}%</span></label>
            <input type="range" id="setting-orbital-speed" min="0" max="3" step="0.1" value="${settingsState.orbitalSpeed}">
          </div>
        </div>
        <div class="galaxy-settings-group">
          <h4>Visual Quality</h4>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-show-star-field" ${settingsState.showStarField ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Star Field</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-show-shadows" ${settingsState.showShadows ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Shadows</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-antialiasing" ${settingsState.antialiasing ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Anti-Aliasing</span>
          </label>
          <div class="galaxy-settings-slider-item">
            <label for="setting-galaxy-core-brightness">Core Brightness: <span id="setting-galaxy-core-brightness-value">${(settingsState.galaxyCoreBrightness * 100).toFixed(0)}%</span></label>
            <input type="range" id="setting-galaxy-core-brightness" min="0" max="2" step="0.1" value="${settingsState.galaxyCoreBrightness}">
          </div>
        </div>
        <div class="galaxy-settings-group">
          <h4>Lighting</h4>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-show-directional-light" ${settingsState.showDirectionalLight ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Directional Light</span>
          </label>
          <div class="galaxy-settings-slider-item">
            <label for="setting-sun-glow-intensity">Sun Glow: <span id="setting-sun-glow-intensity-value">${settingsState.sunGlowIntensity.toFixed(1)}</span></label>
            <input type="range" id="setting-sun-glow-intensity" min="0" max="3" step="0.1" value="${settingsState.sunGlowIntensity}">
          </div>
          <div class="galaxy-settings-slider-item">
            <label for="setting-ambient-light">Ambient Light: <span id="setting-ambient-light-value">${(settingsState.ambientLight * 100).toFixed(0)}%</span></label>
            <input type="range" id="setting-ambient-light" min="0" max="1" step="0.05" value="${settingsState.ambientLight}">
          </div>
        </div>
        <div class="galaxy-settings-group">
          <h4>Performance</h4>
          <div class="galaxy-settings-slider-item">
            <label for="setting-particle-density">Particle Density: <span id="setting-particle-density-value">${(settingsState.particleDensity * 100).toFixed(0)}%</span></label>
            <input type="range" id="setting-particle-density" min="0.25" max="1" step="0.25" value="${settingsState.particleDensity}">
          </div>
          <div class="galaxy-settings-slider-item">
            <label for="setting-lod-distance">LOD Distance: <span id="setting-lod-distance-value">${settingsState.lodDistance.toFixed(0)}</span></label>
            <input type="range" id="setting-lod-distance" min="20" max="100" step="5" value="${settingsState.lodDistance}">
          </div>
        </div>
        <div class="galaxy-settings-group">
          <h4>Orbital Visualization</h4>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-orbital-trajectories" ${settingsState.showOrbitalTrajectories ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Orbital Trajectories</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-lagrange-points" ${settingsState.showLagrangePoints ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Lagrange Points</span>
          </label>
        </div>
        <div class="galaxy-settings-group">
          <h4>Particle Effects</h4>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-solar-wind" ${settingsState.showSolarWind ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Solar Wind</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-asteroid-belts" ${settingsState.showAsteroidBelts ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Asteroid Belts</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-comets" ${settingsState.showComets ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Comets</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-space-dust" ${settingsState.showSpaceDust ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Space Dust</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-space-stations" ${settingsState.showSpaceStations ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Space Stations</span>
          </label>
        </div>
        <div class="galaxy-settings-group">
          <h4>Visual Effects</h4>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-nebulas" ${settingsState.showNebulas ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Nebulas</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-star-twinkling" ${settingsState.showStarTwinkling ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Star Twinkling</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-atmospheres" ${settingsState.showAtmospheres ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Planet Atmospheres</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-post-processing" ${settingsState.showPostProcessing ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Post-Processing (Bloom, DoF)</span>
          </label>
        </div>
        <div class="galaxy-settings-group">
          <h4>UI/Information</h4>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-show-planet-labels" ${settingsState.showPlanetLabels ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Planet Labels</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-show-distance-info" ${settingsState.showDistanceInfo ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Distance Info</span>
          </label>
          <label class="galaxy-settings-toggle-item">
            <input type="checkbox" id="setting-show-grid-overlay" ${settingsState.showGridOverlay ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Grid Overlay</span>
          </label>
        </div>
      </div>
    </div>
  `;

  container.appendChild(settingsPanel);

  // Event listeners
  const toggleButton = settingsPanel.querySelector('.galaxy-settings-toggle');
  const closeButton = settingsPanel.querySelector('.galaxy-settings-close');
  const content = settingsPanel.querySelector('.galaxy-settings-content');
  const body = settingsPanel.querySelector('.galaxy-settings-body');

  toggleButton.addEventListener('click', () => {
    settingsPanel.classList.toggle('expanded');
  });

  closeButton.addEventListener('click', () => {
    settingsPanel.classList.remove('expanded');
  });

  // Prevent mouse/pointer events from propagating to galaxy scene
  // This prevents galaxy rotation when interacting with sliders
  // Note: We don't stop mousemove/pointermove because the cursor tracking system needs those events
  const preventGalaxyInteraction = (e) => {
    e.stopPropagation();
  };

  // Stop propagation for mouse/pointer down/up events (these trigger galaxy rotation)
  // We don't stop mousemove/pointermove so the cursor can still be tracked
  settingsPanel.addEventListener('mousedown', preventGalaxyInteraction, true);
  settingsPanel.addEventListener('pointerdown', preventGalaxyInteraction, true);
  settingsPanel.addEventListener('mouseup', preventGalaxyInteraction, true);
  settingsPanel.addEventListener('pointerup', preventGalaxyInteraction, true);

  // Prevent wheel events from propagating to galaxy scene when hovering over settings panel
  // This allows scrolling within the settings panel without zooming the galaxy
  settingsPanel.addEventListener('wheel', (e) => {
    // Check if the wheel event is over the settings content or body
    const isOverSettings = content.contains(e.target) || body.contains(e.target) || e.target === content || e.target === body;

    if (isOverSettings && settingsPanel.classList.contains('expanded')) {
      // Check if the body is scrollable and if we're at the scroll boundaries
      const bodyElement = body;
      const isScrollable = bodyElement.scrollHeight > bodyElement.clientHeight;
      const isAtTop = bodyElement.scrollTop <= 0;
      const isAtBottom = bodyElement.scrollTop >= bodyElement.scrollHeight - bodyElement.clientHeight;

      // Only prevent default if we're actually scrolling within the settings panel
      // If we're at the boundaries and scrolling would go outside, allow it to propagate
      if (isScrollable && !(isAtTop && e.deltaY < 0) && !(isAtBottom && e.deltaY > 0)) {
        e.stopPropagation(); // Prevent galaxy zoom when scrolling settings
      } else if (!isScrollable) {
        // If not scrollable, always prevent propagation
        e.stopPropagation();
      }
    }
  }, { passive: false });

  // Helper function to convert kebab-case ID to camelCase setting name
  function idToSettingKey(id) {
    const settingId = id.replace('setting-', ''); // Remove "setting-" prefix
    // Convert kebab-case to camelCase: "orbital-trajectories" -> "orbitalTrajectories"
    // Handle "show-" prefix: "show-star-field" -> "showStarField"
    let camelCaseId = settingId.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

    // Check if it already starts with "show" (from HTML ID like "show-star-field")
    const alreadyHasShow = camelCaseId.startsWith('show') && camelCaseId.length > 4;

    // Check if it should have "show" prefix (for boolean toggles that don't already have it)
    const numericSettings = ['scrollSensitivity', 'rotationSensitivity', 'galaxyRotationSpeed', 'planetRotationSpeed', 'orbitalSpeed', 'galaxyCoreBrightness', 'sunGlowIntensity', 'ambientLight', 'particleDensity', 'lodDistance'];
    const needsShowPrefix = !numericSettings.includes(camelCaseId) && !alreadyHasShow;

    if (needsShowPrefix) {
      return `show${camelCaseId.charAt(0).toUpperCase()}${camelCaseId.slice(1)}`;
    }
    return camelCaseId;
  }

  // Handle checkboxes
  const checkboxes = settingsPanel.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', e => {
      const settingKey = idToSettingKey(e.target.id);
      settingsState[settingKey] = e.target.checked;

      // Dispatch custom event for runtime.js to listen to
      const event = new CustomEvent('galaxy-setting-changed', {
        detail: { setting: settingKey, value: e.target.checked }
      });
      document.dispatchEvent(event);
    });
  });

  // Handle sliders
  const sliders = settingsPanel.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    // Update value display on input
    const valueDisplay = settingsPanel.querySelector(`#${slider.id}-value`);
    if (valueDisplay) {
      slider.addEventListener('input', e => {
        const value = parseFloat(e.target.value);
        // Format display based on setting type
        if (slider.id.includes('sensitivity') && slider.id.includes('scroll')) {
          valueDisplay.textContent = `${(value * 100).toFixed(0)}%`;
        } else if (slider.id.includes('sensitivity') && slider.id.includes('rotation')) {
          valueDisplay.textContent = `${(value * 1000).toFixed(0)}`;
        } else if (slider.id.includes('speed') || slider.id.includes('brightness') || slider.id.includes('density')) {
          valueDisplay.textContent = `${(value * 100).toFixed(0)}%`;
        } else if (slider.id.includes('intensity')) {
          valueDisplay.textContent = value.toFixed(1);
        } else if (slider.id.includes('light')) {
          valueDisplay.textContent = `${(value * 100).toFixed(0)}%`;
        } else if (slider.id.includes('distance')) {
          valueDisplay.textContent = value.toFixed(0);
        } else {
          valueDisplay.textContent = value.toFixed(2);
        }
      });
    }

    // Dispatch event on change
    slider.addEventListener('change', e => {
      const settingKey = idToSettingKey(e.target.id);
      const value = parseFloat(e.target.value);
      settingsState[settingKey] = value;

      // Dispatch custom event for runtime.js to listen to
      const event = new CustomEvent('galaxy-setting-changed', {
        detail: { setting: settingKey, value: value }
      });
      document.dispatchEvent(event);
    });
  });
}

/**
 * Get current settings state
 * @returns {Object} Settings state object
 */
export function getSettingsState() {
  return { ...settingsState };
}

/**
 * Update a specific setting
 * @param {string} setting - Setting name (camelCase)
 * @param {boolean|number} value - Setting value
 */
export function updateSetting(setting, value) {
  if (settingsState.hasOwnProperty(setting)) {
    settingsState[setting] = value;

    // Update UI if panel exists
    if (settingsPanel) {
      // Convert camelCase to kebab-case: "showOrbitalTrajectories" -> "orbital-trajectories"
      const kebabCase = setting.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^show-/, '');
      const controlId = `setting-${kebabCase}`;

      // Try checkbox first
      const checkbox = settingsPanel.querySelector(`#${controlId}`);
      if (checkbox && checkbox.type === 'checkbox') {
        checkbox.checked = value;
      } else {
        // Try slider
        const slider = settingsPanel.querySelector(`#${controlId}`);
        if (slider && slider.type === 'range') {
          slider.value = value;
          // Update value display
          const valueDisplay = settingsPanel.querySelector(`#${controlId}-value`);
          if (valueDisplay) {
            if (controlId.includes('sensitivity') && controlId.includes('scroll')) {
              valueDisplay.textContent = `${(value * 100).toFixed(0)}%`;
            } else if (controlId.includes('sensitivity') && controlId.includes('rotation')) {
              valueDisplay.textContent = `${(value * 1000).toFixed(0)}`;
            } else if (controlId.includes('speed') || controlId.includes('brightness') || controlId.includes('density')) {
              valueDisplay.textContent = `${(value * 100).toFixed(0)}%`;
            } else if (controlId.includes('intensity')) {
              valueDisplay.textContent = value.toFixed(1);
            } else if (controlId.includes('light')) {
              valueDisplay.textContent = `${(value * 100).toFixed(0)}%`;
            } else if (controlId.includes('distance')) {
              valueDisplay.textContent = value.toFixed(0);
            } else {
              valueDisplay.textContent = value.toFixed(2);
            }
          }
        }
      }
    }
  }
}

/**
 * Cleanup settings UI
 */
export function cleanupGalaxySettings() {
  if (settingsPanel && settingsPanel.parentNode) {
    settingsPanel.parentNode.removeChild(settingsPanel);
    settingsPanel = null;
  }
}

