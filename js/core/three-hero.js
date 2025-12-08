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
    heroCamera = camera;
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
    heroCamera = camera;
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
    heroCamera = camera;
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
    heroCamera = camera;
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
    heroCamera = camera;
    animate();
  } catch (error) {
    console.warn('Three.js Pricing animation failed to initialize:', error);
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

