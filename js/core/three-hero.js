/**
 * Three.js Hero Background Module
 * Different Three.js animations for different hero sections
 * - index.html: Rotating particles
 * - services.html: Particle Swarm (boids/flocking algorithm with mouse interaction)
 * - seo-services.html: Floating geometric shapes (icosahedrons)
 * - projects.html: Torus grid with scroll parallax
 * - pricing.html: Particle rain (falling particles with horizontal drift)
 */

import { loadThreeJS } from '../utils/three-loader.js';
import { isMobileDevice } from '../utils/env.js';

let heroScene = null;
let heroRenderer = null;
let heroCamera = null;
let heroAnimationId = null;
let scrollUpdateRafId = null;
let isAnimationPaused = false;
let heroAnimateFunction = null; // Store reference to the active animate function
let heroScrollUpdateFunction = null; // Store reference to scroll update function (for projects page)

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
    // Use canvas dimensions if available, otherwise fallback to window dimensions
    // Canvas will resize when CSS loads (handled by resize event listener)
    const canvasRect = canvas.getBoundingClientRect();
    const canvasWidth = canvasRect.width > 0 ? canvasRect.width : window.innerWidth;
    const canvasHeight = canvasRect.height > 0 ? canvasRect.height : window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvasWidth, canvasHeight);
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
      if (!isAnimationPaused) {
        heroAnimationId = requestAnimationFrame(animate);
        particlesMesh.rotation.x += 0.001;
        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        // Mark canvas as loaded after first render
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }
    heroAnimateFunction = animate; // Store reference for resume

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    heroScene = scene;
    heroRenderer = renderer;
    // Make renderer globally accessible for fullscreen resizing
    window.heroRenderer = renderer;
    heroCamera = camera;
    // Make camera globally accessible for fullscreen resizing
    window.heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js Hero animation failed to initialize:', error);
  }
}

/**
 * Initialize Three.js Services Background (Particle Swarm / Boids Flocking)
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
    // Limit pixel ratio for better performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Boids parameters
    const particlesCount = 1200; // Good balance for visual effect and performance
    const bounds = 15; // Boundary size
    const maxSpeed = 0.15;
    const maxForce = 0.02;

    // Boids rule weights
    const separationWeight = 1.5;
    const alignmentWeight = 1.0;
    const cohesionWeight = 1.0;
    const mouseWeight = 2.0;

    // Neighbor detection distances
    const separationDistance = 2.0;
    const alignmentDistance = 4.0;
    const cohesionDistance = 6.0;
    const mouseInfluenceDistance = 8.0;

    // Spatial grid for neighbor lookup optimization
    const gridSize = 20;
    const cellSize = (bounds * 2) / gridSize;
    const spatialGrid = new Map();

    // Mouse position (normalized to scene coordinates)
    const mousePos = new THREE.Vector3(0, 0, 0);
    let mouseActive = false;

    // Natural cluster system - forms clusters where particles naturally converge (bird-like behavior)
    const clusterAttractors = [];
    const clusterLifetime = 4000; // 4 seconds active
    const clusterFormationCheckInterval = 2000; // Check for natural convergence every 2 seconds
    const clusterMinDensity = 8; // Minimum particles needed to form a cluster
    const clusterFormationRadius = 4.0; // Radius to check for particle density
    const clusterInfluenceDistance = 6.0;
    const clusterStrength = 2.5; // Attraction strength
    const clusterMaxCount = 3; // Maximum simultaneous clusters
    let lastClusterCheck = 0;

    // Particle class
    class Particle {
      constructor() {
        this.position = new THREE.Vector3(
          (Math.random() - 0.5) * bounds * 1.5,
          (Math.random() - 0.5) * bounds * 1.5,
          (Math.random() - 0.5) * bounds * 1.5
        );
        this.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        );
        this.velocity.normalize().multiplyScalar(Math.random() * maxSpeed);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.color = new THREE.Color();
        this.neighborCount = 0;
      }

      update() {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        if (this.velocity.length() > maxSpeed) {
          this.velocity.normalize().multiplyScalar(maxSpeed);
        }
        // Update position
        this.position.add(this.velocity);
        // Reset acceleration
        this.acceleration.multiplyScalar(0);
        // Apply boundaries (wrap around)
        if (this.position.x > bounds) this.position.x = -bounds;
        if (this.position.x < -bounds) this.position.x = bounds;
        if (this.position.y > bounds) this.position.y = -bounds;
        if (this.position.y < -bounds) this.position.y = bounds;
        if (this.position.z > bounds) this.position.z = -bounds;
        if (this.position.z < -bounds) this.position.z = bounds;
      }

      applyForce(force) {
        this.acceleration.add(force);
      }

      // Boids rules
      separate(neighbors) {
        const steer = new THREE.Vector3(0, 0, 0);
        let count = 0;

        for (const neighbor of neighbors) {
          const dist = this.position.distanceTo(neighbor.position);
          if (dist > 0 && dist < separationDistance) {
            const diff = new THREE.Vector3().subVectors(this.position, neighbor.position);
            diff.normalize();
            diff.divideScalar(dist); // Weight by distance
            steer.add(diff);
            count++;
          }
        }

        if (count > 0) {
          steer.divideScalar(count);
          steer.normalize();
          steer.multiplyScalar(maxSpeed);
          steer.sub(this.velocity);
          if (steer.length() > maxForce) {
            steer.normalize().multiplyScalar(maxForce);
          }
        }

        return steer;
      }

      align(neighbors) {
        const steer = new THREE.Vector3(0, 0, 0);
        let count = 0;

        for (const neighbor of neighbors) {
          const dist = this.position.distanceTo(neighbor.position);
          if (dist > 0 && dist < alignmentDistance) {
            steer.add(neighbor.velocity);
            count++;
          }
        }

        if (count > 0) {
          steer.divideScalar(count);
          steer.normalize();
          steer.multiplyScalar(maxSpeed);
          steer.sub(this.velocity);
          if (steer.length() > maxForce) {
            steer.normalize().multiplyScalar(maxForce);
          }
        }

        return steer;
      }

      cohesion(neighbors) {
        const steer = new THREE.Vector3(0, 0, 0);
        let count = 0;

        for (const neighbor of neighbors) {
          const dist = this.position.distanceTo(neighbor.position);
          if (dist > 0 && dist < cohesionDistance) {
            steer.add(neighbor.position);
            count++;
          }
        }

        if (count > 0) {
          steer.divideScalar(count);
          steer.sub(this.position);
          steer.normalize();
          steer.multiplyScalar(maxSpeed);
          steer.sub(this.velocity);
          if (steer.length() > maxForce) {
            steer.normalize().multiplyScalar(maxForce);
          }
        }

        return steer;
      }

      // Mouse interaction
      mouseInteraction() {
        if (!mouseActive) return new THREE.Vector3(0, 0, 0);

        const dist = this.position.distanceTo(mousePos);
        if (dist < mouseInfluenceDistance) {
          const steer = new THREE.Vector3().subVectors(this.position, mousePos);
          steer.normalize();
          const strength = (mouseInfluenceDistance - dist) / mouseInfluenceDistance;
          steer.multiplyScalar(strength * maxForce * mouseWeight);
          return steer;
        }
        return new THREE.Vector3(0, 0, 0);
      }

      // Cluster attraction - particles are attracted to active cluster attractors (natural, gradual)
      clusterAttraction(clusterAttractors) {
        const steer = new THREE.Vector3(0, 0, 0);

        for (const cluster of clusterAttractors) {
          if (cluster.intensity <= 0) continue; // Skip inactive clusters

          const dist = this.position.distanceTo(cluster.position);
          if (dist < clusterInfluenceDistance) {
            const diff = new THREE.Vector3().subVectors(cluster.position, this.position);
            diff.normalize();

            // Distance-based strength (stronger when closer, but not too strong)
            const normalizedDist = dist / clusterInfluenceDistance;
            const strength = (1 - normalizedDist) * cluster.intensity; // Scale by cluster intensity

            // More natural: stronger attraction when cluster is well-formed
            const clusterForce = diff.multiplyScalar(
              strength * maxForce * clusterStrength * 0.8 // Slightly reduced for more natural movement
            );
            steer.add(clusterForce);
          }
        }

        // Limit total cluster force for natural movement
        if (steer.length() > maxForce * clusterStrength) {
          steer.normalize().multiplyScalar(maxForce * clusterStrength);
        }

        return steer;
      }

      // Update color based on velocity, neighbor density, and cluster proximity
      updateColor(neighbors, clusterAttractors) {
        this.neighborCount = neighbors.length;
        const speed = this.velocity.length();
        const normalizedSpeed = Math.min(speed / maxSpeed, 1.0);
        const density = Math.min(this.neighborCount / 12, 1.0);

        // Check proximity to cluster attractors for color variation
        let clusterProximity = 0;
        for (const cluster of clusterAttractors) {
          const dist = this.position.distanceTo(cluster.position);
          if (dist < clusterInfluenceDistance) {
            const proximity = 1 - (dist / clusterInfluenceDistance);
            clusterProximity = Math.max(clusterProximity, proximity);
          }
        }

        // Improved color gradient with better transitions
        // Base hue: cyan (0.5) -> blue (0.6) -> magenta (0.83) -> pink (0.9)
        let baseHue = 0.5 + normalizedSpeed * 0.4; // Cyan to pink range

        // Add density influence (green tint for high density)
        const densityHueShift = density * 0.1; // Subtle green shift

        // Add cluster proximity influence (brighter/more saturated near clusters)
        const clusterHueShift = clusterProximity * 0.05; // Slight hue shift near clusters

        const hue = (baseHue + densityHueShift + clusterHueShift) % 1.0;

        // Improved saturation - more vibrant, especially in clusters
        const baseSaturation = 0.85;
        const densitySaturation = density * 0.15;
        const clusterSaturation = clusterProximity * 0.2; // More saturated near clusters
        const saturation = Math.min(baseSaturation + densitySaturation + clusterSaturation, 1.0);

        // Improved lightness - brighter for faster particles and clusters
        const baseLightness = 0.6;
        const speedLightness = normalizedSpeed * 0.25;
        const densityLightness = density * 0.1;
        const clusterLightness = clusterProximity * 0.15; // Brighter near clusters
        const lightness = Math.min(baseLightness + speedLightness + densityLightness + clusterLightness, 0.95);

        this.color.setHSL(hue, saturation, lightness);
      }
    }

    // Initialize particles
    const particles = [];
    for (let i = 0; i < particlesCount; i++) {
      particles.push(new Particle());
    }

    // Create geometry and material
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    // Initialize positions and colors
    particles.forEach((particle, i) => {
      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;
      colors[i3] = particle.color.r;
      colors[i3 + 1] = particle.color.g;
      colors[i3 + 2] = particle.color.b;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending, // Glow effect
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    camera.position.z = 10;

    // Spatial grid helper functions
    function getGridKey(x, y, z) {
      const gx = Math.floor((x + bounds) / cellSize);
      const gy = Math.floor((y + bounds) / cellSize);
      const gz = Math.floor((z + bounds) / cellSize);
      return `${gx},${gy},${gz}`;
    }

    function updateSpatialGrid() {
      spatialGrid.clear();
      particles.forEach((particle) => {
        const key = getGridKey(particle.position.x, particle.position.y, particle.position.z);
        if (!spatialGrid.has(key)) {
          spatialGrid.set(key, []);
        }
        spatialGrid.get(key).push(particle);
      });
    }

    function getNeighbors(particle) {
      const neighbors = [];
      const key = getGridKey(particle.position.x, particle.position.y, particle.position.z);
      const [gx, gy, gz] = key.split(',').map(Number);

      // Check current cell and adjacent cells (3x3x3 = 27 cells)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const checkKey = `${gx + dx},${gy + dy},${gz + dz}`;
            const cell = spatialGrid.get(checkKey);
            if (cell) {
              neighbors.push(...cell);
            }
          }
        }
      }
      return neighbors;
    }

    // Mouse interaction
    function onMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Convert to scene coordinates
      mousePos.set(
        x * bounds * 0.7,
        y * bounds * 0.7,
        (Math.random() - 0.5) * bounds * 0.5
      );
      mouseActive = true;
    }

    function onMouseLeave() {
      mouseActive = false;
    }

    canvas.addEventListener('mousemove', onMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', onMouseLeave, { passive: true });

    let lastTime = performance.now();
    let time = 0; // Global time for cluster spawning

    // Find natural particle convergence points (high density areas)
    function findConvergencePoints() {
      const convergencePoints = [];
      const checkedPositions = new Set();

      // Sample random positions to check for particle density
      for (let i = 0; i < 20; i++) {
        const samplePos = new THREE.Vector3(
          (Math.random() - 0.5) * bounds * 1.5,
          (Math.random() - 0.5) * bounds * 1.5,
          (Math.random() - 0.5) * bounds * 1.5
        );

        // Check if we've already checked nearby positions
        const gridKey = getGridKey(samplePos.x, samplePos.y, samplePos.z);
        if (checkedPositions.has(gridKey)) continue;
        checkedPositions.add(gridKey);

        // Count particles within formation radius
        let nearbyCount = 0;
        const nearbyParticles = [];
        particles.forEach((particle) => {
          const dist = samplePos.distanceTo(particle.position);
          if (dist < clusterFormationRadius) {
            nearbyCount++;
            nearbyParticles.push(particle);
          }
        });

        // If enough particles are naturally converging, mark as potential cluster point
        if (nearbyCount >= clusterMinDensity) {
          // Calculate center of mass for more accurate cluster position
          const center = new THREE.Vector3(0, 0, 0);
          nearbyParticles.forEach((p) => center.add(p.position));
          center.divideScalar(nearbyCount);

          convergencePoints.push({
            position: center,
            density: nearbyCount,
            distance: samplePos.distanceTo(center),
          });
        }
      }

      // Sort by density and return best candidates
      convergencePoints.sort((a, b) => b.density - a.density);
      return convergencePoints;
    }

    // Check if position is too close to existing clusters
    function isTooCloseToExistingCluster(position, minDistance = 8.0) {
      for (const cluster of clusterAttractors) {
        if (position.distanceTo(cluster.position) < minDistance) {
          return true;
        }
      }
      return false;
    }

    // Cluster management functions - natural formation based on particle convergence
    function updateClusters(deltaTime) {
      time += deltaTime * 1000; // Convert to milliseconds

      // Check for natural convergence points periodically (not fixed intervals)
      if (time - lastClusterCheck > clusterFormationCheckInterval) {
        lastClusterCheck = time;

        // Only form new clusters if we're under the max count
        if (clusterAttractors.length < clusterMaxCount) {
          const convergencePoints = findConvergencePoints();

          // Try to form clusters at natural convergence points
          for (const point of convergencePoints) {
            if (clusterAttractors.length >= clusterMaxCount) break;

            // Don't form cluster if too close to existing ones
            if (!isTooCloseToExistingCluster(point.position)) {
              const cluster = {
                position: point.position.clone(),
                spawnTime: time,
                intensity: 0.0, // Start at 0, gradually build up (more natural)
                targetIntensity: Math.min(1.0, point.density / 15), // Scale intensity by density
                buildUpRate: 0.02, // Gradual intensity increase per frame
              };
              clusterAttractors.push(cluster);
              break; // Only form one cluster per check for more natural timing
            }
          }
        }
      }

      // Update existing clusters
      for (let i = clusterAttractors.length - 1; i >= 0; i--) {
        const cluster = clusterAttractors[i];
        const age = time - cluster.spawnTime;

        // Gradually build up intensity (more natural than instant spawn)
        if (cluster.intensity < cluster.targetIntensity) {
          cluster.intensity = Math.min(
            cluster.targetIntensity,
            cluster.intensity + cluster.buildUpRate
          );
        }

        // After lifetime, gradually fade out
        if (age > clusterLifetime) {
          const fadeTime = age - clusterLifetime;
          const fadeDuration = 1000; // 1 second fade
          cluster.intensity = Math.max(
            0,
            cluster.targetIntensity * (1 - fadeTime / fadeDuration)
          );
        }

        // Update cluster position based on nearby particles (natural drift)
        let nearbyCount = 0;
        const nearbyCenter = new THREE.Vector3(0, 0, 0);
        particles.forEach((particle) => {
          const dist = cluster.position.distanceTo(particle.position);
          if (dist < clusterInfluenceDistance) {
            nearbyCenter.add(particle.position);
            nearbyCount++;
          }
        });

        // Gradually drift cluster position towards particle center of mass
        if (nearbyCount > 0) {
          nearbyCenter.divideScalar(nearbyCount);
          const drift = new THREE.Vector3()
            .subVectors(nearbyCenter, cluster.position)
            .multiplyScalar(0.05); // Slow drift for natural movement
          cluster.position.add(drift);
        }

        // Remove clusters that have fully faded
        if (cluster.intensity <= 0) {
          clusterAttractors.splice(i, 1);
        }
      }
    }

    function animate() {
      if (!isAnimationPaused) {
        heroAnimationId = requestAnimationFrame(animate);

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap delta for stability
        lastTime = currentTime;

        // Update clusters
        updateClusters(deltaTime);

        // Update spatial grid
        updateSpatialGrid();

        // Update particles
        particles.forEach((particle) => {
          const neighbors = getNeighbors(particle);

          // Apply boids rules
          const separation = particle.separate(neighbors);
          const alignment = particle.align(neighbors);
          const cohesion = particle.cohesion(neighbors);
          const mouseForce = particle.mouseInteraction();
          const clusterForce = particle.clusterAttraction(clusterAttractors);

          separation.multiplyScalar(separationWeight);
          alignment.multiplyScalar(alignmentWeight);
          cohesion.multiplyScalar(cohesionWeight);

          particle.applyForce(separation);
          particle.applyForce(alignment);
          particle.applyForce(cohesion);
          particle.applyForce(mouseForce);
          particle.applyForce(clusterForce);

          // Update particle
          particle.update();

          // Update color (pass cluster attractors for color variation)
          particle.updateColor(neighbors, clusterAttractors);
        });

        // Update geometry attributes
        const positionArray = geometry.attributes.position.array;
        const colorArray = geometry.attributes.color.array;

        particles.forEach((particle, i) => {
          const i3 = i * 3;
          positionArray[i3] = particle.position.x;
          positionArray[i3 + 1] = particle.position.y;
          positionArray[i3 + 2] = particle.position.z;
          colorArray[i3] = particle.color.r;
          colorArray[i3 + 1] = particle.color.g;
          colorArray[i3 + 2] = particle.color.b;
        });

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;

        renderer.render(scene, camera);
        // Mark canvas as loaded after first render
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }
    heroAnimateFunction = animate; // Store reference for resume

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    heroScene = scene;
    heroRenderer = renderer;
    // Make renderer globally accessible for fullscreen resizing
    window.heroRenderer = renderer;
    heroCamera = camera;
    // Make camera globally accessible for fullscreen resizing
    window.heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js Services animation failed to initialize:', error);
  }
}

/**
 * Initialize Three.js SEO Services Background (Geometric Shapes - original)
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSSeoServices(THREE) {
  const canvas = document.getElementById('threejs-seo-canvas');
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating geometric shapes (icosahedrons)
    const shapes = [];
    const shapesCount = 15;
    const colors = [0x00ffff, 0xff00ff, 0x00ff00, 0x0066ff]; // Cyan, Magenta, Green, Blue

    for (let i = 0; i < shapesCount; i++) {
      const geometry = new THREE.IcosahedronGeometry(
        0.2 + Math.random() * 0.5, // Random size between 0.2 and 0.7
        0
      );
      const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Random initial position
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      // Store initial Y position for floating animation
      mesh.userData.initialY = mesh.position.y;
      mesh.userData.phase = Math.random() * Math.PI * 2; // Random phase for varied animation

      scene.add(mesh);
      shapes.push(mesh);
    }

    camera.position.z = 10;

    function animate() {
      if (!isAnimationPaused) {
        heroAnimationId = requestAnimationFrame(animate);

        const time = Date.now() * 0.001; // Time in seconds

        shapes.forEach((shape, i) => {
          // Rotation
          shape.rotation.x += 0.005;
          shape.rotation.y += 0.005;

          // Floating animation (vertical float using sine wave)
          shape.position.y = shape.userData.initialY + Math.sin(time + shape.userData.phase) * 0.5;
        });

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }
    heroAnimateFunction = animate; // Store reference for resume

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    heroScene = scene;
    heroRenderer = renderer;
    // Make renderer globally accessible for fullscreen resizing
    window.heroRenderer = renderer;
    heroCamera = camera;
    // Make camera globally accessible for fullscreen resizing
    window.heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js SEO Services animation failed to initialize:', error);
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
      if (!isAnimationPaused) {
        // Smooth interpolation
        smoothScrollY += (targetScrollY - smoothScrollY) * 0.1;
        scrollUpdateRafId = requestAnimationFrame(updateScroll);
      }
    }
    heroScrollUpdateFunction = updateScroll; // Store reference for resume

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
      if (!isAnimationPaused) {
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
    }
    heroAnimateFunction = animate; // Store reference for resume

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    heroScene = scene;
    heroRenderer = renderer;
    // Make renderer globally accessible for fullscreen resizing
    window.heroRenderer = renderer;
    heroCamera = camera;
    // Make camera globally accessible for fullscreen resizing
    window.heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js Projects animation failed to initialize:', error);
  }
}

/**
 * Initialize Three.js Pricing Background (particle rain)
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSPricing(THREE) {
  const canvas = document.getElementById('threejs-pricing-canvas');
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

    // Create particle rain system
    const particlesCount = 800; // Good balance between visual effect and performance
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3); // Store velocity for each particle

    // Initialize particles at random positions above viewport
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      // X: random across width with slight spread
      positions[i3] = (Math.random() - 0.5) * 20;
      // Y: start above viewport (positive Y is up in Three.js)
      positions[i3 + 1] = Math.random() * 20 + 10; // Start above viewport
      // Z: random depth
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Velocity: slight horizontal drift, falling downward
      velocities[i3] = (Math.random() - 0.5) * 0.02; // Horizontal drift
      velocities[i3 + 1] = -0.05 - Math.random() * 0.05; // Falling speed (negative Y)
      velocities[i3 + 2] = 0; // No Z movement
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x00ffff, // Cyan color matching brand
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending, // Glow effect
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    function animate() {
      if (!isAnimationPaused) {
        heroAnimationId = requestAnimationFrame(animate);

        const positions = particlesMesh.geometry.attributes.position;
        const positionArray = positions.array;

        // Update each particle position
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;

          // Update position based on velocity
          positionArray[i3] += velocities[i3]; // X movement (horizontal drift)
          positionArray[i3 + 1] += velocities[i3 + 1]; // Y movement (falling)
          // Z stays constant

          // Reset particle to top when it falls below viewport
          if (positionArray[i3 + 1] < -10) {
            positionArray[i3] = (Math.random() - 0.5) * 20; // Random X
            positionArray[i3 + 1] = 10 + Math.random() * 5; // Reset above viewport
            // Keep same velocity for consistency
          }

          // Wrap horizontally (optional - creates continuous effect)
          if (positionArray[i3] > 10) {
            positionArray[i3] = -10;
          } else if (positionArray[i3] < -10) {
            positionArray[i3] = 10;
          }
        }

        // Mark positions as needing update
        positions.needsUpdate = true;

        renderer.render(scene, camera);
        // Mark canvas as loaded after first render
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }
    heroAnimateFunction = animate; // Store reference for resume

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    heroScene = scene;
    heroRenderer = renderer;
    // Make renderer globally accessible for fullscreen resizing
    window.heroRenderer = renderer;
    heroCamera = camera;
    // Make camera globally accessible for fullscreen resizing
    window.heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js Pricing animation failed to initialize:', error);
  }
}

/**
 * Showcase Background Functions
 * 20 different Three.js backgrounds for the showcase page
 */

// Global state for showcase scenes (array of { scene, renderer, camera, animateFn, isPaused } per section)
const showcaseScenes = [];

/**
 * Initialize Three.js Showcase Background #1: Rotating Particles
 */
async function initThreeJSShowcase1(THREE) {
  const canvas = document.getElementById('threejs-showcase-1');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        particlesMesh.rotation.x += 0.001;
        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[0] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #1 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #2: Particle Swarm (Boids/Flocking)
 * Reuses the boids implementation from services page
 */
async function initThreeJSShowcase2(THREE) {
  const canvas = document.getElementById('threejs-showcase-2');
  if (!canvas) return;
  if (isMobileDevice()) return;

  // Note: This would reuse the boids implementation from initThreeJSServices
  // For now, using a simplified version
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.7,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 8;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;
        particlesMesh.rotation.x = Math.sin(time * 0.5) * 0.1;
        particlesMesh.rotation.y += 0.002;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[1] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #2 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #3: Floating Geometric Shapes
 */
async function initThreeJSShowcase3(THREE) {
  const canvas = document.getElementById('threejs-showcase-3');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const shapes = [];
    const shapesCount = 15;
    const colors = [0x00ffff, 0xff00ff, 0x00ff00, 0x0066ff];

    for (let i = 0; i < shapesCount; i++) {
      const geometry = new THREE.IcosahedronGeometry(0.2 + Math.random() * 0.5, 0);
      const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      scene.add(mesh);
      shapes.push(mesh);
    }

    camera.position.z = 5;

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        shapes.forEach((shape, i) => {
          shape.rotation.x += 0.005;
          shape.rotation.y += 0.005;
          shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
        });
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[2] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #3 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #4: Torus Grid with Parallax
 */
async function initThreeJSShowcase4(THREE) {
  const canvas = document.getElementById('threejs-showcase-4');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const toruses = [];
    const gridSize = 4;
    const spacing = 2.5;
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
        const initialZ = (Math.random() - 0.5) * 3;
        torus.position.set((x - gridSize / 2) * spacing, (y - gridSize / 2) * spacing, initialZ);
        scene.add(torus);
        toruses.push(torus);
        initialZPositions.push(initialZ);
      }
    }

    camera.position.z = 8;
    let time = 0;
    let scrollY = 0;
    let targetScrollY = 0;
    let smoothScrollY = 0;

    function updateScroll() {
      smoothScrollY += (targetScrollY - smoothScrollY) * 0.1;
      requestAnimationFrame(updateScroll);
    }
    updateScroll();

    window.addEventListener('scroll', () => {
      targetScrollY = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
    }, { passive: true });

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;
        const parallaxOffset = smoothScrollY * 0.0005;
        camera.position.y = parallaxOffset;
        camera.rotation.z = smoothScrollY * 0.0001;

        toruses.forEach((torus, i) => {
          torus.rotation.x += 0.002;
          torus.rotation.y += 0.002;
          const phase = i * 0.5;
          torus.position.z = initialZPositions[i] + Math.sin(time + phase) * 0.3;
        });

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[3] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #4 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #5: Particle Rain
 */
async function initThreeJSShowcase5(THREE) {
  const canvas = document.getElementById('threejs-showcase-5');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 800;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = Math.random() * 20 + 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = -0.05 - Math.random() * 0.05;
      velocities[i3 + 2] = 0;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 5;

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        const positionArray = particlesMesh.geometry.attributes.position.array;

        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          positionArray[i3] += velocities[i3];
          positionArray[i3 + 1] += velocities[i3 + 1];

          if (positionArray[i3 + 1] < -10) {
            positionArray[i3] = (Math.random() - 0.5) * 20;
            positionArray[i3 + 1] = 10 + Math.random() * 5;
          }

          if (positionArray[i3] > 10) positionArray[i3] = -10;
          else if (positionArray[i3] < -10) positionArray[i3] = 10;
        }

        particlesMesh.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[4] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #5 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #6: Starfield
 */
async function initThreeJSShowcase6(THREE) {
  const canvas = document.getElementById('threejs-showcase-6');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const twinklePhases = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = (Math.random() - 0.5) * 200;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;

      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = brightness;

      sizes[i] = Math.random() * 2 + 1;
      twinklePhases[i] = Math.random() * Math.PI * 2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 100;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        const colorArray = particlesMesh.geometry.attributes.color.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const twinkle = 0.5 + Math.sin(time * 2 + twinklePhases[i]) * 0.5;
          colorArray[i3] = twinkle;
          colorArray[i3 + 1] = twinkle;
          colorArray[i3 + 2] = twinkle;
        }
        particlesMesh.geometry.attributes.color.needsUpdate = true;

        particlesMesh.rotation.y += 0.0005;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[5] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #6 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #7: Wave Grid
 */
async function initThreeJSShowcase7(THREE) {
  const canvas = document.getElementById('threejs-showcase-7');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const gridSize = 20;
    const spacing = 0.5;
    const points = [];
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(gridSize * gridSize * 3);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = (i * gridSize + j) * 3;
        positions[index] = (i - gridSize / 2) * spacing;
        positions[index + 1] = 0;
        positions[index + 2] = (j - gridSize / 2) * spacing;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });

    const pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);
    camera.position.z = 8;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = pointsMesh.geometry.attributes.position.array;
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            const index = (i * gridSize + j) * 3;
            const x = positions[index];
            const z = positions[index + 2];
            positionArray[index + 1] = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.5;
          }
        }
        pointsMesh.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[6] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #7 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #8: Nebula Clouds
 */
async function initThreeJSShowcase8(THREE) {
  const canvas = document.getElementById('threejs-showcase-8');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;

      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 0.5 + 0.2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 15;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          positionArray[i3] += Math.sin(time + i) * 0.01;
          positionArray[i3 + 1] += Math.cos(time + i) * 0.01;
          positionArray[i3 + 2] += Math.sin(time * 0.5 + i) * 0.01;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[7] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #8 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #9: Connected Particles (Constellation)
 */
async function initThreeJSShowcase9(THREE) {
  const canvas = document.getElementById('threejs-showcase-9');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      colors[i3] = 0;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    });

    let animationId = null;
    let isPaused = false;
    const maxDistance = 3;

    function updateLines() {
      scene.children = scene.children.filter(child => child.type !== 'Line');
      const posArray = particlesMesh.geometry.attributes.position.array;

      for (let i = 0; i < particlesCount; i++) {
        for (let j = i + 1; j < particlesCount; j++) {
          const i3 = i * 3;
          const j3 = j * 3;
          const dx = posArray[i3] - posArray[j3];
          const dy = posArray[i3 + 1] - posArray[j3 + 1];
          const dz = posArray[i3 + 2] - posArray[j3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < maxDistance) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(posArray[i3], posArray[i3 + 1], posArray[i3 + 2]),
              new THREE.Vector3(posArray[j3], posArray[j3 + 1], posArray[j3 + 2])
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            scene.add(line);
          }
        }
      }
    }

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          positionArray[i3] += (Math.random() - 0.5) * 0.01;
          positionArray[i3 + 1] += (Math.random() - 0.5) * 0.01;
          positionArray[i3 + 2] += (Math.random() - 0.5) * 0.01;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        updateLines();
        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    camera.position.z = 15;

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[8] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #9 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #10: Geometric Prisms
 */
async function initThreeJSShowcase10(THREE) {
  const canvas = document.getElementById('threejs-showcase-10');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const prisms = [];
    const prismCount = 12;
    const colors = [0x00ffff, 0xff00ff, 0x00ff00, 0x0066ff];

    for (let i = 0; i < prismCount; i++) {
      const geometry = new THREE.ConeGeometry(0.3, 0.8, 3);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.7,
        shininess: 100,
      });
      const prism = new THREE.Mesh(geometry, material);
      prism.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      scene.add(prism);
      prisms.push(prism);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 8;

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        prisms.forEach((prism, i) => {
          prism.rotation.x += 0.01;
          prism.rotation.y += 0.01;
          prism.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
        });
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[9] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #10 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #11: Particle Explosion
 */
async function initThreeJSShowcase11(THREE) {
  const canvas = document.getElementById('threejs-showcase-11');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 300;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = Math.random() * 0.1 + 0.05;
      velocities[i3] = Math.sin(phi) * Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(angle) * speed;
      velocities[i3 + 2] = Math.cos(phi) * speed;

      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 5;

    let animationId = null;
    let isPaused = false;
    let explosionTime = 0;

    function resetExplosion() {
      explosionTime = 0;
      const positionArray = particlesMesh.geometry.attributes.position.array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positionArray[i3] = 0;
        positionArray[i3 + 1] = 0;
        positionArray[i3 + 2] = 0;
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;
    }

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        explosionTime += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          positionArray[i3] += velocities[i3];
          positionArray[i3 + 1] += velocities[i3 + 1];
          positionArray[i3 + 2] += velocities[i3 + 2];

          velocities[i3] *= 0.98;
          velocities[i3 + 1] *= 0.98;
          velocities[i3 + 2] *= 0.98;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        if (explosionTime > 5) {
          resetExplosion();
        }

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[10] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #11 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #12: Liquid Morphing Blobs
 */
async function initThreeJSShowcase12(THREE) {
  const canvas = document.getElementById('threejs-showcase-12');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const blobs = [];
    const blobCount = 5;
    const colors = [0x00ffff, 0xff00ff, 0x00ff00, 0x0066ff, 0xffff00];

    for (let i = 0; i < blobCount; i++) {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.6,
        shininess: 100,
      });
      const blob = new THREE.Mesh(geometry, material);
      blob.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
      blob.userData.initialScale = 0.5 + Math.random() * 0.5;
      blob.userData.phase = Math.random() * Math.PI * 2;
      scene.add(blob);
      blobs.push(blob);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        blobs.forEach((blob, i) => {
          const scale = blob.userData.initialScale + Math.sin(time * 2 + blob.userData.phase) * 0.2;
          blob.scale.set(scale, scale, scale);
          blob.position.x += Math.sin(time + i) * 0.01;
          blob.position.y += Math.cos(time + i) * 0.01;
          blob.position.z += Math.sin(time * 0.5 + i) * 0.01;
        });

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[11] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #12 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #13: Wireframe Globe
 */
async function initThreeJSShowcase13(THREE) {
  const canvas = document.getElementById('threejs-showcase-13');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const globeGeometry = new THREE.SphereGeometry(3, 32, 32);
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    const latLines = [];
    const longLines = [];
    const latCount = 8;
    const longCount = 16;

    for (let i = 0; i <= latCount; i++) {
      const lat = (i / latCount) * Math.PI;
      const points = [];
      for (let j = 0; j <= longCount; j++) {
        const lon = (j / longCount) * Math.PI * 2;
        const x = Math.sin(lat) * Math.cos(lon) * 3;
        const y = Math.cos(lat) * 3;
        const z = Math.sin(lat) * Math.sin(lon) * 3;
        points.push(new THREE.Vector3(x, y, z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      latLines.push(line);
    }

    for (let i = 0; i <= longCount; i++) {
      const lon = (i / longCount) * Math.PI * 2;
      const points = [];
      for (let j = 0; j <= latCount; j++) {
        const lat = (j / latCount) * Math.PI;
        const x = Math.sin(lat) * Math.cos(lon) * 3;
        const y = Math.cos(lat) * 3;
        const z = Math.sin(lat) * Math.sin(lon) * 3;
        points.push(new THREE.Vector3(x, y, z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      longLines.push(line);
    }

    camera.position.z = 8;

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        globe.rotation.y += 0.005;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[12] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #13 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #14: Particle Vortex
 */
async function initThreeJSShowcase14(THREE) {
  const canvas = document.getElementById('threejs-showcase-14');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 1000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 20;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      const hue = radius / 10;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 15;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const x = positionArray[i3];
          const z = positionArray[i3 + 2];
          const radius = Math.sqrt(x * x + z * z);
          const angle = Math.atan2(z, x) + time * 0.5;

          positionArray[i3] = Math.cos(angle) * radius;
          positionArray[i3 + 2] = Math.sin(angle) * radius;
          positionArray[i3 + 1] += Math.sin(time + radius) * 0.01;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[13] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #14 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #15: Animated Grid Lines
 */
async function initThreeJSShowcase15(THREE) {
  const canvas = document.getElementById('threejs-showcase-15');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const gridSize = 20;
    const spacing = 1;
    const lines = [];

    for (let i = 0; i <= gridSize; i++) {
      const points1 = [
        new THREE.Vector3((i - gridSize / 2) * spacing, -gridSize / 2 * spacing, 0),
        new THREE.Vector3((i - gridSize / 2) * spacing, gridSize / 2 * spacing, 0)
      ];
      const geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
      const material1 = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
      const line1 = new THREE.Line(geometry1, material1);
      scene.add(line1);
      lines.push(line1);

      const points2 = [
        new THREE.Vector3(-gridSize / 2 * spacing, (i - gridSize / 2) * spacing, 0),
        new THREE.Vector3(gridSize / 2 * spacing, (i - gridSize / 2) * spacing, 0)
      ];
      const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
      const material2 = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
      const line2 = new THREE.Line(geometry2, material2);
      scene.add(line2);
      lines.push(line2);
    }

    camera.position.z = 15;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        lines.forEach((line, i) => {
          const pulse = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
          line.material.opacity = pulse * 0.5;
          line.position.z = Math.sin(time + i * 0.1) * 2;
        });

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[14] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #15 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #16: Particle Trails
 */
async function initThreeJSShowcase16(THREE) {
  const canvas = document.getElementById('threejs-showcase-16');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 50;
    const trailLength = 20;
    const particles = [];

    for (let i = 0; i < particlesCount; i++) {
      const particle = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
        trail: []
      };
      particles.push(particle);
    }

    let animationId = null;
    let isPaused = false;

    function updateTrails() {
      scene.children = scene.children.filter(child => child.type !== 'Line');

      particles.forEach((particle) => {
        particle.trail.push(particle.position.clone());
        if (particle.trail.length > trailLength) {
          particle.trail.shift();
        }

        if (particle.trail.length > 1) {
          const points = particle.trail.map(p => p.clone());
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            linewidth: 2,
          });
          const line = new THREE.Line(geometry, material);
          scene.add(line);
        }
      });
    }

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);

        particles.forEach((particle) => {
          particle.position.add(particle.velocity);
          particle.velocity.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.001,
            (Math.random() - 0.5) * 0.001,
            (Math.random() - 0.5) * 0.001
          ));
          particle.velocity.multiplyScalar(0.99);

          if (Math.abs(particle.position.x) > 10) particle.velocity.x *= -1;
          if (Math.abs(particle.position.y) > 10) particle.velocity.y *= -1;
          if (Math.abs(particle.position.z) > 10) particle.velocity.z *= -1;
        });

        updateTrails();
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    camera.position.z = 15;

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[15] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #16 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #17: Geometric Kaleidoscope
 */
async function initThreeJSShowcase17(THREE) {
  const canvas = document.getElementById('threejs-showcase-17');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const segments = 8;
    const shapes = [];

    for (let i = 0; i < segments; i++) {
      const geometry = new THREE.TetrahedronGeometry(1, 0);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / segments, 1, 0.5),
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      const shape = new THREE.Mesh(geometry, material);
      shape.rotation.z = (i / segments) * Math.PI * 2;
      scene.add(shape);
      shapes.push(shape);
    }

    camera.position.z = 5;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        shapes.forEach((shape, i) => {
          shape.rotation.x += 0.01;
          shape.rotation.y += 0.01;
          const scale = 1 + Math.sin(time + i) * 0.2;
          shape.scale.set(scale, scale, scale);
        });

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[16] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #17 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #18: Particle Fountain
 */
async function initThreeJSShowcase18(THREE) {
  const canvas = document.getElementById('threejs-showcase-18');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = -5;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;

      velocities[i3] = (Math.random() - 0.5) * 0.05;
      velocities[i3 + 1] = Math.random() * 0.1 + 0.05;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;

      const hue = Math.random() * 0.3 + 0.5;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 8;

    let animationId = null;
    let isPaused = false;
    const gravity = -0.002;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          positionArray[i3] += velocities[i3];
          positionArray[i3 + 1] += velocities[i3 + 1];
          positionArray[i3 + 2] += velocities[i3 + 2];

          velocities[i3 + 1] += gravity;

          if (positionArray[i3 + 1] < -5) {
            positionArray[i3] = (Math.random() - 0.5) * 0.5;
            positionArray[i3 + 1] = -5;
            positionArray[i3 + 2] = (Math.random() - 0.5) * 0.5;
            velocities[i3] = (Math.random() - 0.5) * 0.05;
            velocities[i3 + 1] = Math.random() * 0.1 + 0.05;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[17] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #18 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #19: Shader-Based Noise
 */
async function initThreeJSShowcase19(THREE) {
  const canvas = document.getElementById('threejs-showcase-19');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      const hue = (positions[i3] + 10) / 20;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 15;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const x = positionArray[i3];
          const y = positionArray[i3 + 1];
          const z = positionArray[i3 + 2];

          positionArray[i3] += Math.sin(y * 0.1 + time) * 0.01;
          positionArray[i3 + 1] += Math.cos(x * 0.1 + time) * 0.01;
          positionArray[i3 + 2] += Math.sin(z * 0.1 + time * 0.5) * 0.01;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[18] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #19 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #20: Particle Orbits
 */
async function initThreeJSShowcase20(THREE) {
  const canvas = document.getElementById('threejs-showcase-20');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const orbitCount = 8;
    const particlesPerOrbit = 60;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(orbitCount * particlesPerOrbit * 3);
    const colors = new Float32Array(orbitCount * particlesPerOrbit * 3);

    // Store orbit parameters for animation
    const orbitParams = [];

    // Initialize orbits with elliptical parameters
    for (let orbit = 0; orbit < orbitCount; orbit++) {
      const semiMajorAxis = 1.5 + orbit * 0.7; // Semi-major axis (a)
      const eccentricity = 0.2 + (orbit % 3) * 0.15; // Varying eccentricity (0 = circle, 1 = line)
      const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity); // Semi-minor axis (b)
      const inclination = (orbit % 2) * 0.3; // 3D tilt for visual interest
      const orbitalPeriod = 3 + orbit * 0.5; // Different periods for each orbit
      const phaseOffset = orbit * 0.5; // Stagger orbits

      orbitParams.push({
        semiMajorAxis,
        semiMinorAxis,
        eccentricity,
        inclination,
        orbitalPeriod,
        phaseOffset,
        hue: orbit / orbitCount
      });

      // Initialize particle positions along elliptical orbit
      for (let i = 0; i < particlesPerOrbit; i++) {
        const index = (orbit * particlesPerOrbit + i) * 3;
        const trueAnomaly = (i / particlesPerOrbit) * Math.PI * 2;

        // Elliptical parametric equations
        const x = semiMajorAxis * Math.cos(trueAnomaly);
        const z = semiMinorAxis * Math.sin(trueAnomaly);

        // Apply 3D inclination (rotate around X axis)
        const y = z * Math.sin(inclination);
        const zRotated = z * Math.cos(inclination);

        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = zRotated;

        const color = new THREE.Color().setHSL(orbitParams[orbit].hue, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.015;

        const positionArray = particlesMesh.geometry.attributes.position.array;

        for (let orbit = 0; orbit < orbitCount; orbit++) {
          const params = orbitParams[orbit];
          const meanAnomaly = (time / params.orbitalPeriod + params.phaseOffset) * Math.PI * 2;

          for (let i = 0; i < particlesPerOrbit; i++) {
            const index = (orbit * particlesPerOrbit + i) * 3;

            // Calculate mean anomaly for this particle (distributed around orbit)
            const particleMeanAnomaly = (i / particlesPerOrbit) * Math.PI * 2;
            const currentMeanAnomaly = (meanAnomaly + particleMeanAnomaly) % (Math.PI * 2);

            // Solve Kepler's equation: M = E - e*sin(E) for eccentric anomaly (E)
            // Using iterative approximation (Newton's method)
            let eccentricAnomaly = currentMeanAnomaly;
            for (let iter = 0; iter < 5; iter++) {
              eccentricAnomaly = currentMeanAnomaly + params.eccentricity * Math.sin(eccentricAnomaly);
            }

            // Convert eccentric anomaly to true anomaly
            const cosE = Math.cos(eccentricAnomaly);
            const sinE = Math.sin(eccentricAnomaly);
            const trueAnomaly = Math.atan2(
              Math.sqrt(1 - params.eccentricity * params.eccentricity) * sinE,
              cosE - params.eccentricity
            );

            // Elliptical parametric equations with true anomaly
            const radius = params.semiMajorAxis * (1 - params.eccentricity * params.eccentricity) /
                          (1 + params.eccentricity * Math.cos(trueAnomaly));
            const x = radius * Math.cos(trueAnomaly);
            const z = radius * Math.sin(trueAnomaly);

            // Apply 3D inclination (rotate around X axis)
            const y = z * Math.sin(params.inclination);
            const zRotated = z * Math.cos(params.inclination);

            positionArray[index] = x;
            positionArray[index + 1] = y;
            positionArray[index + 2] = zRotated;
          }
        }

        particlesMesh.geometry.attributes.position.needsUpdate = true;
        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);

        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[19] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #20 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #21: DNA Helix
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase21(THREE) {
  const canvas = document.getElementById('threejs-showcase-21');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const helixCount = 2;
    const particlesPerHelix = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(helixCount * particlesPerHelix * 3);
    const colors = new Float32Array(helixCount * particlesPerHelix * 3);

    for (let h = 0; h < helixCount; h++) {
      const offset = h * Math.PI;
      for (let i = 0; i < particlesPerHelix; i++) {
        const index = (h * particlesPerHelix + i) * 3;
        const t = (i / particlesPerHelix) * Math.PI * 4;
        const radius = 2;
        positions[index] = Math.cos(t + offset) * radius;
        positions[index + 1] = (i / particlesPerHelix - 0.5) * 8;
        positions[index + 2] = Math.sin(t + offset) * radius;

        const color = new THREE.Color().setHSL(0.6 + h * 0.1, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 12;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let h = 0; h < helixCount; h++) {
          const offset = h * Math.PI;
          for (let i = 0; i < particlesPerHelix; i++) {
            const index = (h * particlesPerHelix + i) * 3;
            const t = (i / particlesPerHelix) * Math.PI * 4 + time;
            const radius = 2;
            positionArray[index] = Math.cos(t + offset) * radius;
            positionArray[index + 2] = Math.sin(t + offset) * radius;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.003;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[20] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #21 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #22: Particle Chains
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase22(THREE) {
  const canvas = document.getElementById('threejs-showcase-22');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const chainCount = 8;
    const particlesPerChain = 30;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(chainCount * particlesPerChain * 3);
    const colors = new Float32Array(chainCount * particlesPerChain * 3);

    for (let c = 0; c < chainCount; c++) {
      for (let i = 0; i < particlesPerChain; i++) {
        const index = (c * particlesPerChain + i) * 3;
        const t = i / particlesPerChain;
        positions[index] = (c - chainCount / 2) * 2;
        positions[index + 1] = Math.sin(t * Math.PI * 2 + c) * 3;
        positions[index + 2] = Math.cos(t * Math.PI * 2 + c) * 3;

        const color = new THREE.Color().setHSL(0.3 + c * 0.1, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let c = 0; c < chainCount; c++) {
          for (let i = 0; i < particlesPerChain; i++) {
            const index = (c * particlesPerChain + i) * 3;
            const t = i / particlesPerChain;
            positionArray[index + 1] = Math.sin(t * Math.PI * 2 + c + time) * 3;
            positionArray[index + 2] = Math.cos(t * Math.PI * 2 + c + time) * 3;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.002;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[21] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #22 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #23: Magnetic Field Lines
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase23(THREE) {
  const canvas = document.getElementById('threejs-showcase-23');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Magnetic dipole field line tracing
    // Dipole moment points along z-axis (up)
    const dipoleMoment = new THREE.Vector3(0, 0, 1);

    /**
     * Calculate magnetic field vector at a point for a dipole
     * B = (3(m·r̂)r̂ - m) / r³ (normalized, ignoring μ₀/4π constant)
     */
    function calculateFieldAtPoint(pos) {
      const r = pos.length();
      if (r < 0.1) return new THREE.Vector3(0, 0, 0); // Avoid singularity at origin

      const rHat = pos.clone().normalize();
      const mDotR = dipoleMoment.dot(rHat);
      const field = rHat.clone().multiplyScalar(3 * mDotR).sub(dipoleMoment);
      return field.divideScalar(r * r * r);
    }

    /**
     * Runge-Kutta 4th order integration to trace field line
     */
    function traceFieldLine(startPoint, stepSize, maxSteps) {
      const points = [startPoint.clone()];
      let currentPoint = startPoint.clone();

      for (let step = 0; step < maxSteps; step++) {
        const field1 = calculateFieldAtPoint(currentPoint);
        const field1Norm = field1.length();
        if (field1Norm < 0.001) break; // Stop if field is too weak
        const k1 = field1.normalize().multiplyScalar(stepSize);

        const temp2 = currentPoint.clone().add(k1.clone().multiplyScalar(0.5));
        const field2 = calculateFieldAtPoint(temp2);
        const field2Norm = field2.length();
        if (field2Norm < 0.001) break;
        const k2 = field2.normalize().multiplyScalar(stepSize);

        const temp3 = currentPoint.clone().add(k2.clone().multiplyScalar(0.5));
        const field3 = calculateFieldAtPoint(temp3);
        const field3Norm = field3.length();
        if (field3Norm < 0.001) break;
        const k3 = field3.normalize().multiplyScalar(stepSize);

        const temp4 = currentPoint.clone().add(k3);
        const field4 = calculateFieldAtPoint(temp4);
        const field4Norm = field4.length();
        if (field4Norm < 0.001) break;
        const k4 = field4.normalize().multiplyScalar(stepSize);

        const delta = k1.clone()
          .add(k2.clone().multiplyScalar(2))
          .add(k3.clone().multiplyScalar(2))
          .add(k4)
          .multiplyScalar(1/6);
        currentPoint.add(delta);

        // Stop if too far from origin or too close
        const dist = currentPoint.length();
        if (dist > 8 || dist < 0.1) break;

        // Check if we've completed a loop (returned near start)
        if (points.length > 10 && currentPoint.distanceTo(startPoint) < 0.5) {
          points.push(startPoint.clone()); // Close the loop
          break;
        }

        points.push(currentPoint.clone());
      }

      return points;
    }

    // Generate field lines starting from various points near the north pole
    const fieldLineCount = 16;
    const fieldLines = [];
    const fieldLineGroup = new THREE.Group();

    for (let l = 0; l < fieldLineCount; l++) {
      // Start points distributed around the north pole
      const azimuth = (l / fieldLineCount) * Math.PI * 2;
      const elevation = 0.3 + (l % 4) * 0.15; // Vary starting distance
      const startRadius = 0.5;

      const startPoint = new THREE.Vector3(
        Math.sin(elevation) * Math.cos(azimuth) * startRadius,
        Math.cos(elevation) * startRadius,
        Math.sin(elevation) * Math.sin(azimuth) * startRadius
      );

      // Trace field line forward and backward
      const forwardPoints = traceFieldLine(startPoint, 0.1, 200);
      const backwardPoints = traceFieldLine(startPoint, -0.1, 200);

      // Combine and reverse backward points
      backwardPoints.reverse();
      const allPoints = backwardPoints.concat(forwardPoints);

      if (allPoints.length > 2) {
        const geometry = new THREE.BufferGeometry().setFromPoints(allPoints);
        const hue = 0.55 + (l % 3) * 0.05;
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        const material = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.7,
          linewidth: 1
        });

        const line = new THREE.Line(geometry, material);
        fieldLineGroup.add(line);
        fieldLines.push({ line, points: allPoints });
      }
    }

    scene.add(fieldLineGroup);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);

        // Slow rotation to show 3D structure
        fieldLineGroup.rotation.y += 0.002;

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[22] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #23 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #24: Plasma Waves
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase24(THREE) {
  const canvas = document.getElementById('threejs-showcase-24');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const gridSize = 30;
    const particlesCount = gridSize * gridSize;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const x = (i % gridSize) - gridSize / 2;
      const z = Math.floor(i / gridSize) - gridSize / 2;
      const i3 = i * 3;
      positions[i3] = x * 0.3;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = z * 0.3;

      const color = new THREE.Color().setHSL(0.7, 1, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const x = (i % gridSize) - gridSize / 2;
          const z = Math.floor(i / gridSize) - gridSize / 2;
          positionArray[i3 + 1] = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time * 0.7) * 2;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[23] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #24 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #25: Fractal Trees
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase25(THREE) {
  const canvas = document.getElementById('threejs-showcase-25');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const treeCount = 6;
    const particlesPerTree = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(treeCount * particlesPerTree * 3);
    const colors = new Float32Array(treeCount * particlesPerTree * 3);

    function createBranch(positions, colors, index, x, y, z, angle, length, depth, maxDepth) {
      if (depth > maxDepth) return;
      const newX = x + Math.cos(angle) * length;
      const newY = y + length;
      const newZ = z + Math.sin(angle) * length;

      const i3 = index * 3;
      positions[i3] = newX;
      positions[i3 + 1] = newY;
      positions[i3 + 2] = newZ;

      const color = new THREE.Color().setHSL(0.3, 0.8, 0.3 + depth * 0.1);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      createBranch(positions, colors, index + 1, newX, newY, newZ, angle - 0.5, length * 0.7, depth + 1, maxDepth);
      createBranch(positions, colors, index + 2, newX, newY, newZ, angle + 0.5, length * 0.7, depth + 1, maxDepth);
    }

    let particleIndex = 0;
    for (let t = 0; t < treeCount; t++) {
      const baseX = (t - treeCount / 2) * 3;
      createBranch(positions, colors, particleIndex, baseX, -4, 0, 0, 2, 0, 4);
      particleIndex += particlesPerTree;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.002;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[24] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #25 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #26: Particle Clouds
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase26(THREE) {
  const canvas = document.getElementById('threejs-showcase-26');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const cloudCount = 5;
    const particlesPerCloud = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(cloudCount * particlesPerCloud * 3);
    const colors = new Float32Array(cloudCount * particlesPerCloud * 3);

    for (let c = 0; c < cloudCount; c++) {
      const centerX = (c - cloudCount / 2) * 4;
      for (let i = 0; i < particlesPerCloud; i++) {
        const index = (c * particlesPerCloud + i) * 3;
        positions[index] = centerX + (Math.random() - 0.5) * 3;
        positions[index + 1] = (Math.random() - 0.5) * 3;
        positions[index + 2] = (Math.random() - 0.5) * 3;

        const color = new THREE.Color().setHSL(0.6, 0.2, 0.7 + Math.random() * 0.3);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.005;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let c = 0; c < cloudCount; c++) {
          const centerX = (c - cloudCount / 2) * 4;
          for (let i = 0; i < particlesPerCloud; i++) {
            const index = (c * particlesPerCloud + i) * 3;
            positionArray[index] = centerX + Math.sin(time + i * 0.01) * 1.5;
            positionArray[index + 1] += Math.sin(time * 0.7 + i * 0.02) * 0.02;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[25] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #26 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #27: Animated Ribbons
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase27(THREE) {
  const canvas = document.getElementById('threejs-showcase-27');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ribbonCount = 6;
    const particlesPerRibbon = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(ribbonCount * particlesPerRibbon * 3);
    const colors = new Float32Array(ribbonCount * particlesPerRibbon * 3);

    for (let r = 0; r < ribbonCount; r++) {
      for (let i = 0; i < particlesPerRibbon; i++) {
        const index = (r * particlesPerRibbon + i) * 3;
        const t = i / particlesPerRibbon;
        positions[index] = (t - 0.5) * 8;
        positions[index + 1] = Math.sin(t * Math.PI * 4 + r) * 2;
        positions[index + 2] = (r - ribbonCount / 2) * 1.5;

        const color = new THREE.Color().setHSL(0.8 + r * 0.05, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let r = 0; r < ribbonCount; r++) {
          for (let i = 0; i < particlesPerRibbon; i++) {
            const index = (r * particlesPerRibbon + i) * 3;
            const t = i / particlesPerRibbon;
            positionArray[index + 1] = Math.sin(t * Math.PI * 4 + r + time) * 2;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.003;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[26] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #27 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #28: Crystal Formations
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase28(THREE) {
  const canvas = document.getElementById('threejs-showcase-28');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const crystalCount = 8;
    const particlesPerCrystal = 50;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(crystalCount * particlesPerCrystal * 3);
    const colors = new Float32Array(crystalCount * particlesPerCrystal * 3);

    for (let c = 0; c < crystalCount; c++) {
      const centerX = (c % 4 - 1.5) * 3;
      const centerZ = (Math.floor(c / 4) - 0.5) * 3;
      for (let i = 0; i < particlesPerCrystal; i++) {
        const index = (c * particlesPerCrystal + i) * 3;
        const angle = (i / particlesPerCrystal) * Math.PI * 2;
        const radius = 0.5 + (i % 3) * 0.3;
        positions[index] = centerX + Math.cos(angle) * radius;
        positions[index + 1] = (i / particlesPerCrystal) * 2 - 1;
        positions[index + 2] = centerZ + Math.sin(angle) * radius;

        const color = new THREE.Color().setHSL(0.6, 0.8, 0.6);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.005;
        particlesMesh.rotation.x += 0.002;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[27] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #28 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #29: Particle Streams
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase29(THREE) {
  const canvas = document.getElementById('threejs-showcase-29');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const streamCount = 8;
    const particlesPerStream = 80;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(streamCount * particlesPerStream * 3);
    const colors = new Float32Array(streamCount * particlesPerStream * 3);

    for (let s = 0; s < streamCount; s++) {
      for (let i = 0; i < particlesPerStream; i++) {
        const index = (s * particlesPerStream + i) * 3;
        const t = i / particlesPerStream;
        positions[index] = (s - streamCount / 2) * 2;
        positions[index + 1] = (t - 0.5) * 10;
        positions[index + 2] = Math.sin(t * Math.PI * 2) * 2;

        const color = new THREE.Color().setHSL(0.5 + s * 0.05, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 12;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let s = 0; s < streamCount; s++) {
          for (let i = 0; i < particlesPerStream; i++) {
            const index = (s * particlesPerStream + i) * 3;
            const t = (i / particlesPerStream + time) % 1;
            positionArray[index + 1] = (t - 0.5) * 10;
            positionArray[index + 2] = Math.sin(t * Math.PI * 2 + s) * 2;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.002;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[28] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #29 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #30: Hexagonal Grid
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase30(THREE) {
  const canvas = document.getElementById('threejs-showcase-30');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const gridSize = 8;
    const particlesCount = gridSize * gridSize;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const i3 = i * 3;
      const x = (col - gridSize / 2) * 1.5;
      const z = (row - gridSize / 2) * 1.3;
      positions[i3] = x;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = z;

      const color = new THREE.Color().setHSL(0.1, 1, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          positionArray[i3 + 1] = Math.sin(time + row + col) * 0.5;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[29] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #30 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #31: Particle Waves
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase31(THREE) {
  const canvas = document.getElementById('threejs-showcase-31');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const waveCount = 5;
    const particlesPerWave = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(waveCount * particlesPerWave * 3);
    const colors = new Float32Array(waveCount * particlesPerWave * 3);

    for (let w = 0; w < waveCount; w++) {
      for (let i = 0; i < particlesPerWave; i++) {
        const index = (w * particlesPerWave + i) * 3;
        const t = i / particlesPerWave;
        positions[index] = (t - 0.5) * 10;
        positions[index + 1] = 0;
        positions[index + 2] = (w - waveCount / 2) * 2;

        const color = new THREE.Color().setHSL(0.5, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let w = 0; w < waveCount; w++) {
          for (let i = 0; i < particlesPerWave; i++) {
            const index = (w * particlesPerWave + i) * 3;
            const t = i / particlesPerWave;
            positionArray[index + 1] = Math.sin(t * Math.PI * 4 + time + w) * 2;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[30] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #31 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #32: Spiral Galaxy
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase32(THREE) {
  const canvas = document.getElementById('threejs-showcase-32');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const armCount = 2;
    const particlesPerArm = 300;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(armCount * particlesPerArm * 3);
    const colors = new Float32Array(armCount * particlesPerArm * 3);

    for (let a = 0; a < armCount; a++) {
      for (let i = 0; i < particlesPerArm; i++) {
        const index = (a * particlesPerArm + i) * 3;
        const t = i / particlesPerArm;
        const radius = t * 6;
        const angle = t * Math.PI * 4 + a * Math.PI;
        positions[index] = Math.cos(angle) * radius;
        positions[index + 1] = (Math.random() - 0.5) * 0.5;
        positions[index + 2] = Math.sin(angle) * radius;

        const color = new THREE.Color().setHSL(0.7, 0.8, 0.5 + t * 0.3);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 12;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.005;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let a = 0; a < armCount; a++) {
          for (let i = 0; i < particlesPerArm; i++) {
            const index = (a * particlesPerArm + i) * 3;
            const t = i / particlesPerArm;
            const radius = t * 6;
            const angle = t * Math.PI * 4 + a * Math.PI + time;
            positionArray[index] = Math.cos(angle) * radius;
            positionArray[index + 2] = Math.sin(angle) * radius;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[31] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #32 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #33: Particle Mesh
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase33(THREE) {
  const canvas = document.getElementById('threejs-showcase-33');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const gridSize = 10;
    const particlesCount = gridSize * gridSize;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const i3 = i * 3;
      positions[i3] = (col - gridSize / 2) * 1;
      positions[i3 + 1] = (row - gridSize / 2) * 1;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      const color = new THREE.Color().setHSL(0.6, 1, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          positionArray[i3 + 2] = Math.sin(time + row + col) * 1;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.002;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[32] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #33 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #34: Animated Tubes
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase34(THREE) {
  const canvas = document.getElementById('threejs-showcase-34');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const tubeCount = 6;
    const particlesPerTube = 80;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(tubeCount * particlesPerTube * 3);
    const colors = new Float32Array(tubeCount * particlesPerTube * 3);

    for (let t = 0; t < tubeCount; t++) {
      for (let i = 0; i < particlesPerTube; i++) {
        const index = (t * particlesPerTube + i) * 3;
        const angle = (i / particlesPerTube) * Math.PI * 2;
        positions[index] = Math.cos(angle) * 1.5;
        positions[index + 1] = (t - tubeCount / 2) * 2;
        positions[index + 2] = Math.sin(angle) * 1.5;

        const color = new THREE.Color().setHSL(0.4 + t * 0.05, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let t = 0; t < tubeCount; t++) {
          for (let i = 0; i < particlesPerTube; i++) {
            const index = (t * particlesPerTube + i) * 3;
            const angle = (i / particlesPerTube) * Math.PI * 2 + time;
            positionArray[index] = Math.cos(angle) * 1.5;
            positionArray[index + 2] = Math.sin(angle) * 1.5;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.003;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[33] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #34 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #35: Particle Fields
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase35(THREE) {
  const canvas = document.getElementById('threejs-showcase-35');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const fieldSize = 20;
    const particlesCount = fieldSize * fieldSize;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const row = Math.floor(i / fieldSize);
      const col = i % fieldSize;
      const i3 = i * 3;
      positions[i3] = (col - fieldSize / 2) * 0.4;
      positions[i3 + 1] = (row - fieldSize / 2) * 0.4;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      const color = new THREE.Color().setHSL(0.55, 1, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const row = Math.floor(i / fieldSize);
          const col = i % fieldSize;
          positionArray[i3 + 2] = Math.sin(time + row * 0.5 + col * 0.5) * 1;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[34] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #35 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #36: Geometric Mandala
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase36(THREE) {
  const canvas = document.getElementById('threejs-showcase-36');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ringCount = 6;
    const particlesPerRing = 60;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(ringCount * particlesPerRing * 3);
    const colors = new Float32Array(ringCount * particlesPerRing * 3);

    for (let r = 0; r < ringCount; r++) {
      const radius = 0.5 + r * 0.8;
      for (let i = 0; i < particlesPerRing; i++) {
        const index = (r * particlesPerRing + i) * 3;
        const angle = (i / particlesPerRing) * Math.PI * 2;
        positions[index] = Math.cos(angle) * radius;
        positions[index + 1] = 0;
        positions[index + 2] = Math.sin(angle) * radius;

        const color = new THREE.Color().setHSL((r / ringCount) * 0.3, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 8;

    let animationId = null;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.005;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[35] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #36 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #37: Particle Rings
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase37(THREE) {
  const canvas = document.getElementById('threejs-showcase-37');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ringCount = 8;
    const particlesPerRing = 50;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(ringCount * particlesPerRing * 3);
    const colors = new Float32Array(ringCount * particlesPerRing * 3);

    for (let r = 0; r < ringCount; r++) {
      const radius = 1 + r * 0.6;
      for (let i = 0; i < particlesPerRing; i++) {
        const index = (r * particlesPerRing + i) * 3;
        const angle = (i / particlesPerRing) * Math.PI * 2;
        positions[index] = Math.cos(angle) * radius;
        positions[index + 1] = 0;
        positions[index + 2] = Math.sin(angle) * radius;

        const color = new THREE.Color().setHSL(0.6, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 8;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let r = 0; r < ringCount; r++) {
          const radius = 1 + r * 0.6 + Math.sin(time + r) * 0.2;
          for (let i = 0; i < particlesPerRing; i++) {
            const index = (r * particlesPerRing + i) * 3;
            const angle = (i / particlesPerRing) * Math.PI * 2;
            positionArray[index] = Math.cos(angle) * radius;
            positionArray[index + 2] = Math.sin(angle) * radius;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.002;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[36] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #37 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #38: Animated Spheres
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase38(THREE) {
  const canvas = document.getElementById('threejs-showcase-38');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const sphereCount = 6;
    const particlesPerSphere = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(sphereCount * particlesPerSphere * 3);
    const colors = new Float32Array(sphereCount * particlesPerSphere * 3);

    for (let s = 0; s < sphereCount; s++) {
      const centerX = (s % 3 - 1) * 3;
      const centerZ = (Math.floor(s / 3) - 0.5) * 3;
      for (let i = 0; i < particlesPerSphere; i++) {
        const index = (s * particlesPerSphere + i) * 3;
        const theta = Math.random() * Math.PI;
        const phi = Math.random() * Math.PI * 2;
        const radius = 0.8;
        positions[index] = centerX + Math.sin(theta) * Math.cos(phi) * radius;
        positions[index + 1] = Math.cos(theta) * radius;
        positions[index + 2] = centerZ + Math.sin(theta) * Math.sin(phi) * radius;

        const color = new THREE.Color().setHSL(0.7, 0.8, 0.6);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let s = 0; s < sphereCount; s++) {
          const centerX = (s % 3 - 1) * 3;
          const centerZ = (Math.floor(s / 3) - 0.5) * 3;
          const scale = 0.8 + Math.sin(time + s) * 0.2;
          for (let i = 0; i < particlesPerSphere; i++) {
            const index = (s * particlesPerSphere + i) * 3;
            const dx = positionArray[index] - centerX;
            const dy = positionArray[index + 1];
            const dz = positionArray[index + 2] - centerZ;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist > 0) {
              positionArray[index] = centerX + (dx / dist) * 0.8 * scale;
              positionArray[index + 1] = (dy / dist) * 0.8 * scale;
              positionArray[index + 2] = centerZ + (dz / dist) * 0.8 * scale;
            }
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.002;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[37] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #38 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #39: Particle Swirls
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase39(THREE) {
  const canvas = document.getElementById('threejs-showcase-39');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const swirlCount = 4;
    const particlesPerSwirl = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(swirlCount * particlesPerSwirl * 3);
    const colors = new Float32Array(swirlCount * particlesPerSwirl * 3);

    for (let s = 0; s < swirlCount; s++) {
      const centerX = (s % 2 - 0.5) * 4;
      const centerZ = (Math.floor(s / 2) - 0.5) * 4;
      for (let i = 0; i < particlesPerSwirl; i++) {
        const index = (s * particlesPerSwirl + i) * 3;
        const t = i / particlesPerSwirl;
        const radius = t * 3;
        const angle = t * Math.PI * 6;
        positions[index] = centerX + Math.cos(angle) * radius;
        positions[index + 1] = (Math.random() - 0.5) * 2;
        positions[index + 2] = centerZ + Math.sin(angle) * radius;

        const color = new THREE.Color().setHSL(0.6 + s * 0.1, 1, 0.5);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 10;

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let s = 0; s < swirlCount; s++) {
          const centerX = (s % 2 - 0.5) * 4;
          const centerZ = (Math.floor(s / 2) - 0.5) * 4;
          for (let i = 0; i < particlesPerSwirl; i++) {
            const index = (s * particlesPerSwirl + i) * 3;
            const t = (i / particlesPerSwirl + time * 0.1) % 1;
            const radius = t * 3;
            const angle = t * Math.PI * 6 + time;
            positionArray[index] = centerX + Math.cos(angle) * radius;
            positionArray[index + 2] = centerZ + Math.sin(angle) * radius;
          }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[38] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #39 failed:', error);
  }
}

/**
 * Initialize Three.js Showcase Background #40: Procedural Terrain
 * @param {Object} THREE - Three.js library object
 */
async function initThreeJSShowcase40(THREE) {
  const canvas = document.getElementById('threejs-showcase-40');
  if (!canvas) return;
  if (isMobileDevice()) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const gridSize = 25;
    const particlesCount = gridSize * gridSize;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const i3 = i * 3;
      const x = (col - gridSize / 2) * 0.3;
      const z = (row - gridSize / 2) * 0.3;
      const height = Math.sin(col * 0.2) * Math.cos(row * 0.2) * 1.5;
      positions[i3] = x;
      positions[i3 + 1] = height;
      positions[i3 + 2] = z;

      const color = new THREE.Color().setHSL(0.25, 0.7, 0.3 + height * 0.1);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    let animationId = null;
    let isPaused = false;
    let time = 0;

    function animate() {
      if (!isPaused) {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        const positionArray = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          positionArray[i3 + 1] = Math.sin(col * 0.2 + time) * Math.cos(row * 0.2 + time) * 1.5;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
        if (!canvas.classList.contains('is-loaded')) {
          canvas.classList.add('is-loaded');
        }
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    showcaseScenes[39] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; if (p && animationId) cancelAnimationFrame(animationId); else if (!p) animate(); } };
    animate();
  } catch (error) {
    console.warn('Three.js Showcase #40 failed:', error);
  }
}

/**
 * Router function for showcase backgrounds
 * @param {number} index - Background index (1-40)
 */
export async function initThreeJSShowcase(index) {
  if (isMobileDevice()) return;

  try {
    const THREE = await loadThreeJS();
    if (!THREE) return;

    // Initialize based on index
    switch (index) {
      case 1: await initThreeJSShowcase1(THREE); break;
      case 2: await initThreeJSShowcase2(THREE); break;
      case 3: await initThreeJSShowcase3(THREE); break;
      case 4: await initThreeJSShowcase4(THREE); break;
      case 5: await initThreeJSShowcase5(THREE); break;
      case 6: await initThreeJSShowcase6(THREE); break;
      case 7: await initThreeJSShowcase7(THREE); break;
      case 8: await initThreeJSShowcase8(THREE); break;
      case 9: await initThreeJSShowcase9(THREE); break;
      case 10: await initThreeJSShowcase10(THREE); break;
      case 11: await initThreeJSShowcase11(THREE); break;
      case 12: await initThreeJSShowcase12(THREE); break;
      case 13: await initThreeJSShowcase13(THREE); break;
      case 14: await initThreeJSShowcase14(THREE); break;
      case 15: await initThreeJSShowcase15(THREE); break;
      case 16: await initThreeJSShowcase16(THREE); break;
      case 17: await initThreeJSShowcase17(THREE); break;
      case 18: await initThreeJSShowcase18(THREE); break;
      case 19: await initThreeJSShowcase19(THREE); break;
      case 20: await initThreeJSShowcase20(THREE); break;
      case 21: await initThreeJSShowcase21(THREE); break;
      case 22: await initThreeJSShowcase22(THREE); break;
      case 23: await initThreeJSShowcase23(THREE); break;
      case 24: await initThreeJSShowcase24(THREE); break;
      case 25: await initThreeJSShowcase25(THREE); break;
      case 26: await initThreeJSShowcase26(THREE); break;
      case 27: await initThreeJSShowcase27(THREE); break;
      case 28: await initThreeJSShowcase28(THREE); break;
      case 29: await initThreeJSShowcase29(THREE); break;
      case 30: await initThreeJSShowcase30(THREE); break;
      case 31: await initThreeJSShowcase31(THREE); break;
      case 32: await initThreeJSShowcase32(THREE); break;
      case 33: await initThreeJSShowcase33(THREE); break;
      case 34: await initThreeJSShowcase34(THREE); break;
      case 35: await initThreeJSShowcase35(THREE); break;
      case 36: await initThreeJSShowcase36(THREE); break;
      case 37: await initThreeJSShowcase37(THREE); break;
      case 38: await initThreeJSShowcase38(THREE); break;
      case 39: await initThreeJSShowcase39(THREE); break;
      case 40: await initThreeJSShowcase40(THREE); break;
      default: console.warn(`Showcase background #${index} not yet implemented`);
    }
  } catch (error) {
    console.warn(`Three.js Showcase #${index} failed to initialize:`, error);
  }
}

/**
 * Pause a specific showcase section
 * @param {number} index - Section index (0-39)
 */
export function pauseShowcaseSection(index) {
  if (showcaseScenes[index] && showcaseScenes[index].setPaused) {
    showcaseScenes[index].setPaused(true);
  }
}

/**
 * Resume a specific showcase section
 * @param {number} index - Section index (0-39)
 */
export function resumeShowcaseSection(index) {
  if (showcaseScenes[index] && showcaseScenes[index].setPaused) {
    showcaseScenes[index].setPaused(false);
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
      document.getElementById('threejs-seo-canvas'),
      document.getElementById('threejs-projects-canvas'),
      document.getElementById('threejs-pricing-canvas')
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
  const seoCanvas = document.getElementById('threejs-seo-canvas');
  const projectsCanvas = document.getElementById('threejs-projects-canvas');
  const pricingCanvas = document.getElementById('threejs-pricing-canvas');

  if (!heroCanvas && !servicesCanvas && !seoCanvas && !projectsCanvas && !pricingCanvas) return;

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
    } else if (seoCanvas) {
      await initThreeJSSeoServices(THREE);
    } else if (projectsCanvas) {
      await initThreeJSProjects(THREE);
    } else if (pricingCanvas) {
      await initThreeJSPricing(THREE);
    }
  } catch (error) {
    console.warn('Three.js hero background failed to initialize:', error);
  }
}

/**
 * Pause Three.js animations (for CPU idle detection)
 */
export function pauseThreeHero() {
  isAnimationPaused = true;
  if (heroAnimationId) {
    cancelAnimationFrame(heroAnimationId);
    heroAnimationId = null;
  }
}

/**
 * Resume Three.js animations
 */
export function resumeThreeHero() {
  // If already running, don't restart
  if (heroScene && heroRenderer && heroCamera && !isAnimationPaused && heroAnimationId) {
    return; // Already running
  }

  isAnimationPaused = false;

  // Restart scroll update function if it exists (for projects page)
  if (heroScrollUpdateFunction) {
    heroScrollUpdateFunction();
  }

  // Restart animation using the stored animate function (which includes all animation logic)
  if (heroScene && heroRenderer && heroCamera && heroAnimateFunction) {
    heroAnimateFunction(); // Call the original animate function with all animation logic
  }
}

/**
 * Clean up Three.js hero animations
 */
export function cleanupThreeHero() {
  isAnimationPaused = true;
  if (heroAnimationId) {
    cancelAnimationFrame(heroAnimationId);
    heroAnimationId = null;
  }

  if (scrollUpdateRafId) {
    cancelAnimationFrame(scrollUpdateRafId);
    scrollUpdateRafId = null;
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
  heroAnimateFunction = null; // Clear animate function reference
  heroScrollUpdateFunction = null; // Clear scroll update function reference
}

