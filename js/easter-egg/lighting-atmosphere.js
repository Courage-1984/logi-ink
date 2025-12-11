/**
 * Lighting and Atmosphere Module
 * Handles dynamic lighting, shadows, and atmospheric effects for planets
 */

/**
 * Create atmospheric glow around a planet
 * @param {Object} THREE - Three.js library
 * @param {THREE.Mesh} planet - Planet mesh to add atmosphere to
 * @param {number} planetSize - Size of the planet
 * @param {number} color - Color of the atmosphere (hex)
 * @param {number} intensity - Intensity of the glow (0-1)
 * @param {THREE.Vector3} initialCameraPosition - Initial camera position to prevent first-frame glitch
 * @returns {THREE.Mesh} Atmosphere mesh
 */
export function createAtmosphericGlow(THREE, planet, planetSize, color, intensity = 0.3, initialCameraPosition = null) {
  // Create slightly larger sphere for atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(planetSize * 1.05, 32, 32);

  // Use provided initial camera position or default to a reasonable position
  // Default position matches typical initial camera position (e.g., from CameraPresets.GALAXY_VIEW)
  const defaultCameraPos = initialCameraPosition || new THREE.Vector3(0, 0, 150);

  // Create shader material for rim lighting effect
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      cameraPosition: { value: defaultCameraPos.clone() },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float intensity;
      // cameraPosition is automatically provided by Three.js, don't redeclare it

      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float rim = 1.0 - max(dot(viewDirection, vNormal), 0.0);
        rim = smoothstep(0.5, 1.0, rim);

        vec3 finalColor = color * rim * intensity;
        gl_FragColor = vec4(finalColor, rim * intensity);
      }
    `,
    side: THREE.BackSide, // Render back side only for rim effect
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  planet.add(atmosphere);

  // Store reference for updating view vector
  atmosphere.userData.isAtmosphere = true;
  atmosphere.userData.planet = planet;

  // Store direct reference on planet for efficient access (avoids traversal)
  planet.userData.atmosphereMesh = atmosphere;

  return atmosphere;
}

/**
 * Setup dynamic lighting system with shadows
 * @param {Object} THREE - Three.js library
 * @param {THREE.Scene} scene - Scene to add lights to
 * @param {THREE.Mesh} sun - Sun mesh (light source)
 * @param {Array} planets - Array of planet meshes
 * @param {THREE.WebGLRenderer} renderer - Renderer for shadow map
 * @returns {Object} Light objects
 */
export function setupDynamicLighting(THREE, scene, sun, planets, renderer) {
  // Enable shadow maps
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Enhanced ambient light (slightly brighter for better visibility)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Main directional light from sun (for shadows)
  const sunDirectionalLight = new THREE.DirectionalLight(0xffffaa, 1.2);
  sunDirectionalLight.position.copy(sun.position);
  sunDirectionalLight.castShadow = true;

  // Configure shadow camera
  sunDirectionalLight.shadow.camera.near = 0.1;
  sunDirectionalLight.shadow.camera.far = 500;
  sunDirectionalLight.shadow.camera.left = -100;
  sunDirectionalLight.shadow.camera.right = 100;
  sunDirectionalLight.shadow.camera.top = 100;
  sunDirectionalLight.shadow.camera.bottom = -100;

  // Shadow map resolution
  sunDirectionalLight.shadow.mapSize.width = 2048;
  sunDirectionalLight.shadow.mapSize.height = 2048;
  sunDirectionalLight.shadow.radius = 4; // Soft shadows

  scene.add(sunDirectionalLight);

  // Point light from sun (for dynamic lighting)
  const sunPointLight = new THREE.PointLight(0xffffaa, 2, 300);
  sunPointLight.position.copy(sun.position);
  sunPointLight.castShadow = true;
  sunPointLight.shadow.mapSize.width = 1024;
  sunPointLight.shadow.mapSize.height = 1024;
  sunPointLight.shadow.camera.near = 0.1;
  sunPointLight.shadow.camera.far = 300;
  scene.add(sunPointLight);

  // Enable shadows on planets
  planets.forEach(planet => {
    planet.castShadow = true;
    planet.receiveShadow = true;

    // Enable shadows on moons
    planet.children.forEach(child => {
      if (child.type === 'Mesh') {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });

  return {
    ambientLight,
    sunDirectionalLight,
    sunPointLight,
  };
}

/**
 * Update lighting based on sun position
 * @param {THREE.Mesh} sun - Sun mesh
 * @param {Object} lights - Light objects from setupDynamicLighting
 */
export function updateLighting(sun, lights) {
  if (!sun || !lights) {
    return;
  }

  // Update directional light to follow sun
  if (lights.sunDirectionalLight) {
    lights.sunDirectionalLight.position.copy(sun.position);
    lights.sunDirectionalLight.target.position.set(0, 0, 0);
  }

  // Update point light to follow sun
  if (lights.sunPointLight) {
    lights.sunPointLight.position.copy(sun.position);
  }
}

/**
 * Update atmospheric glow view vectors based on camera
 * @param {THREE.Camera} camera - Camera to calculate view vector from
 * @param {Array} planets - Array of planet meshes with atmospheres
 */
export function updateAtmospheres(camera, planets) {
  if (!camera) {
    return;
  }

  const cameraWorldPos = new THREE.Vector3();
  camera.getWorldPosition(cameraWorldPos);

  planets.forEach(planet => {
    // Use direct reference instead of traversal for better performance
    const atmosphere = planet.userData.atmosphereMesh;
    if (atmosphere && atmosphere.material && atmosphere.material.uniforms) {
        // Update camera position uniform
      atmosphere.material.uniforms.cameraPosition.value.copy(cameraWorldPos);
      }
  });
}

/**
 * Add atmospheric glow to all planets
 * @param {Object} THREE - Three.js library
 * @param {Array} planets - Array of planet meshes
 * @param {Object} atmosphereConfigs - Configuration for each planet's atmosphere
 * @param {THREE.Vector3} initialCameraPosition - Initial camera position to prevent first-frame glitch
 */
export function addAtmospheresToPlanets(THREE, planets, atmosphereConfigs = {}, initialCameraPosition = null) {
  const defaultAtmosphere = {
    color: 0x66aaff,
    intensity: 0.3,
  };

  planets.forEach((planet, index) => {
    const config = atmosphereConfigs[planet.userData.name] || defaultAtmosphere;
    // Store the returned mesh for fast access in updateAtmospheres
    // Pass initial camera position to prevent first-frame rendering glitch
    const atmosphereMesh = createAtmosphericGlow(
      THREE,
      planet,
      planet.userData.size,
      config.color || defaultAtmosphere.color,
      config.intensity || defaultAtmosphere.intensity,
      initialCameraPosition
    );
    // Ensure the mesh is stored (createAtmosphericGlow already does this, but explicit for clarity)
    planet.userData.atmosphereMesh = atmosphereMesh;
  });
}

