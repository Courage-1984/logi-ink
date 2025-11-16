/**
 * Celestial Texture Generator
 * Generates procedural textures for sun, planets, and moons using canvas
 * Uses equirectangular projection (2:1 aspect ratio) for optimal sphere mapping
 *
 * Performance optimizations:
 * - Supports lower resolution for faster initial loading
 * - Can be generated asynchronously
 * - Modular architecture with improved seamless wrapping
 */

import {
  createEquirectangularCanvas,
  makeSeamless,
  createSphereTexture,
  shouldPlaceFeatureAtPole,
  getPoleScaleFactor,
  equirectangularToUV
} from './texture-wrapping.js';

import {
  fractalNoise,
  seamlessFractalNoise
} from './procedural-noise.js';

// Texture cache to avoid regenerating
const textureCache = new Map();

/**
 * Create complex sun texture with detailed solar features
 * Uses equirectangular projection for better sphere mapping
 * @param {number} resolution - Resolution multiplier (1.0 = 2048x1024, 0.5 = 1024x512, etc.)
 */
export function createSunTexture(resolution = 1.0) {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('THREE.js must be loaded before creating textures');
  }

  // Check cache first
  const cacheKey = `sun-${resolution}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey).clone();
  }

  // Use equirectangular projection (2:1 aspect ratio) for better sphere mapping
  // Lower resolution for faster initial loading
  const baseWidth = 2048;
  const baseHeight = 1024;
  const width = Math.floor(baseWidth * resolution);
  const height = Math.floor(baseHeight * resolution);
  const { canvas, ctx } = createEquirectangularCanvas(width, height);

  // Multi-layered radial gradient for deep sun core (centered in equirectangular space)
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2;

  const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.8);
  coreGradient.addColorStop(0, '#ffffff');
  coreGradient.addColorStop(0.1, '#ffff88');
  coreGradient.addColorStop(0.25, '#ffcc00');
  coreGradient.addColorStop(0.4, '#ff9900');
  coreGradient.addColorStop(0.6, '#ff6600');
  coreGradient.addColorStop(0.8, '#ff4400');
  coreGradient.addColorStop(1, '#cc2200');

  ctx.fillStyle = coreGradient;
  ctx.fillRect(0, 0, width, height);

  // Add complex solar surface turbulence using noise (optimized for resolution)
  const turbulenceLayers = Math.max(6, Math.floor(10 * resolution));
  const sampleStep = Math.max(1, Math.floor(1 / resolution)); // Sample fewer pixels at lower resolution

  for (let layer = 0; layer < turbulenceLayers; layer++) {
    const layerRadius = maxRadius * (0.3 + layer * 0.07);
    const layerOpacity = 0.25 / (layer + 1);
    const noiseScale = 0.02 + layer * 0.01;
    const particleCount = Math.floor((50 + layer * 20) * resolution);

    // Use particle-based approach instead of pixel-by-pixel for better performance
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * layerRadius;
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      const dx = x - centerX;
      const dy = y - centerY;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      if (distFromCenter < layerRadius && distFromCenter > layerRadius * 0.7) {
        // Use seamless noise for better horizontal wrapping
        const uv = equirectangularToUV(x, y, width, height);
        const noiseValue = seamlessFractalNoise(x * noiseScale, y * noiseScale, width, 3, 0.6, 1, layer * 1000);
        if (noiseValue > 0.5) {
          const brightness = 0.7 + noiseValue * 0.3;
          const alpha = layerOpacity * (1 - distFromCenter / layerRadius);
          const radius = Math.random() * (15 - layer * 1.5) + 5;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(255, ${200 * brightness}, ${50 * brightness}, ${alpha})`);
          gradient.addColorStop(1, `rgba(255, ${100 * brightness}, 0, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Add detailed solar flares with better distribution (scaled by resolution)
  const flareCount = Math.floor(60 * resolution);
  for (let i = 0; i < flareCount; i++) {
    const angle = (i / flareCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const baseRadius = maxRadius - 40;
    const flareLength = Math.random() * 50 + 30;

    const x1 = centerX + Math.cos(angle) * baseRadius;
    const y1 = centerY + Math.sin(angle) * baseRadius;
    const x2 = centerX + Math.cos(angle) * (baseRadius + flareLength);
    const y2 = centerY + Math.sin(angle) * (baseRadius + flareLength);

    const flareGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    flareGradient.addColorStop(0, `rgba(255, 255, 200, ${Math.random() * 0.5 + 0.4})`);
    flareGradient.addColorStop(0.5, `rgba(255, 200, 100, ${Math.random() * 0.4 + 0.3})`);
    flareGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');

    ctx.strokeStyle = flareGradient;
    ctx.lineWidth = Math.random() * 5 + 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Add secondary flares
    if (Math.random() > 0.4) {
      const offsetAngle = angle + (Math.random() - 0.5) * 0.6;
      const x3 = centerX + Math.cos(offsetAngle) * (baseRadius + flareLength * 0.4);
      const y3 = centerY + Math.sin(offsetAngle) * (baseRadius + flareLength * 0.4);
      const x4 = centerX + Math.cos(offsetAngle) * (baseRadius + flareLength * 0.9);
      const y4 = centerY + Math.sin(offsetAngle) * (baseRadius + flareLength * 0.9);

      ctx.strokeStyle = `rgba(255, 220, 150, ${Math.random() * 0.4 + 0.3})`;
      ctx.lineWidth = Math.random() * 3 + 1.5;
      ctx.beginPath();
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
    }
  }

  // Add plasma loops and arcs (scaled by resolution)
  const plasmaCount = Math.floor(40 * resolution);
  for (let i = 0; i < plasmaCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const startRadius = maxRadius * (0.4 + Math.random() * 0.3);
    const endRadius = startRadius + Math.random() * 40;
    const arcAngle = (Math.random() - 0.5) * Math.PI * 0.6;

    ctx.strokeStyle = `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 100}, ${Math.random() * 0.5 + 0.3})`;
    ctx.lineWidth = Math.random() * 4 + 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, (startRadius + endRadius) / 2, angle - arcAngle / 2, angle + arcAngle / 2);
    ctx.stroke();
  }

  // Add detailed sunspots with better distribution (scaled by resolution)
  const sunspotCount = Math.floor(20 * resolution);
  for (let i = 0; i < sunspotCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxRadius * 0.4;
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle) * dist;
    const umbraRadius = Math.random() * 30 + 10;
    const penumbraRadius = umbraRadius * (1.9 + Math.random() * 0.5);

    // Penumbra (lighter outer ring)
    const penumbraGradient = ctx.createRadialGradient(x, y, umbraRadius, x, y, penumbraRadius);
    penumbraGradient.addColorStop(0, `rgba(200, 100, 0, ${Math.random() * 0.5 + 0.4})`);
    penumbraGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = penumbraGradient;
    ctx.beginPath();
    ctx.arc(x, y, penumbraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Umbra (dark center)
    const umbraGradient = ctx.createRadialGradient(x, y, 0, x, y, umbraRadius);
    umbraGradient.addColorStop(0, `rgba(80, 40, 0, ${Math.random() * 0.7 + 0.5})`);
    umbraGradient.addColorStop(1, `rgba(200, 100, 0, ${Math.random() * 0.4 + 0.3})`);
    ctx.fillStyle = umbraGradient;
    ctx.beginPath();
    ctx.arc(x, y, umbraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Add smaller spots around main spot
    for (let j = 0; j < 4; j++) {
      const spotAngle = Math.random() * Math.PI * 2;
      const spotDist = penumbraRadius + Math.random() * 15;
      const spotX = x + Math.cos(spotAngle) * spotDist;
      const spotY = y + Math.sin(spotAngle) * spotDist;
      const spotRadius = Math.random() * 6 + 2;

      ctx.fillStyle = `rgba(150, 75, 0, ${Math.random() * 0.5 + 0.4})`;
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add fine granular texture (solar granulation) using noise
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    const dx = x - centerX;
    const dy = y - centerY;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    if (distFromCenter < maxRadius) {
      // Use seamless noise for granulation pattern to avoid horizontal seams
      const granuleValue = seamlessFractalNoise(x * 0.1, y * 0.1, width, 2, 0.7, 1, 5000);
      const brightness = 1 + (granuleValue - 0.5) * 0.2;
      data[i] = Math.min(255, data[i] * brightness);
      data[i + 1] = Math.min(255, data[i + 1] * brightness * 0.9);
      data[i + 2] = Math.min(255, data[i + 2] * brightness * 0.8);
    }
  }

  // Make seamless for proper wrapping with improved blending
  const seamlessData = makeSeamless(imageData, width, height, 3);
  ctx.putImageData(seamlessData, 0, 0);

  // Create texture with proper sphere wrapping settings
  const texture = createSphereTexture(canvas, {
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  });

  // Cache the texture
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Create detailed moon texture with complex crater details
 * Uses equirectangular projection and noise-based generation
 * @param {number} resolution - Resolution multiplier (1.0 = 2048x1024, 0.5 = 1024x512, etc.)
 */
export function createMoonTexture(resolution = 1.0) {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('THREE.js must be loaded before creating textures');
  }

  // Check cache first
  const cacheKey = `moon-${resolution}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey).clone();
  }

  // Use equirectangular projection for better sphere mapping
  const baseWidth = 2048;
  const baseHeight = 1024;
  const width = Math.floor(baseWidth * resolution);
  const height = Math.floor(baseHeight * resolution);
  const { canvas, ctx } = createEquirectangularCanvas(width, height);

  // Base lunar surface with noise-based variation
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Generate base surface with seamless noise for proper wrapping
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const baseNoise = seamlessFractalNoise(x * 0.01, y * 0.01, width, 4, 0.6, 1, 1000);
      const baseGray = 120 + baseNoise * 40;
      data[idx] = baseGray;
      data[idx + 1] = baseGray;
      data[idx + 2] = baseGray;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Add maria (dark patches) with better distribution (scaled by resolution)
  // Avoid placing near poles where distortion is high
  const mariaCount = Math.floor(12 * resolution);
  for (let i = 0; i < mariaCount; i++) {
    let x, y, v;
    let attempts = 0;
    do {
      x = Math.random() * width;
      y = Math.random() * height;
      const uv = equirectangularToUV(x, y, width, height);
      v = uv.v;
      attempts++;
    } while (!shouldPlaceFeatureAtPole(v, 0.1) && attempts < 10);

    const radius = Math.random() * 120 + 60;

    const mariaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    mariaGradient.addColorStop(0, `rgba(60, 60, 60, ${Math.random() * 0.4 + 0.5})`);
    mariaGradient.addColorStop(0.7, `rgba(90, 90, 90, ${Math.random() * 0.3 + 0.3})`);
    mariaGradient.addColorStop(1, 'rgba(120, 120, 120, 0)');

    ctx.fillStyle = mariaGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add large craters with detailed rim and shadow (scaled by resolution)
  const largeCraterCount = Math.floor(12 * resolution);
  for (let i = 0; i < largeCraterCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 50 + 25;
    const lightAngle = Math.random() * Math.PI * 2;

    // Crater rim (raised edge)
    const rimGradient = ctx.createRadialGradient(x, y, radius * 0.75, x, y, radius);
    rimGradient.addColorStop(0, `rgba(160, 160, 160, ${Math.random() * 0.4 + 0.5})`);
    rimGradient.addColorStop(1, `rgba(130, 130, 130, ${Math.random() * 0.3 + 0.4})`);
    ctx.fillStyle = rimGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Crater interior (dark center)
    const interiorRadius = radius * 0.75;
    const interiorGradient = ctx.createRadialGradient(x, y, 0, x, y, interiorRadius);
    interiorGradient.addColorStop(0, `rgba(50, 50, 50, ${Math.random() * 0.5 + 0.7})`);
    interiorGradient.addColorStop(0.5, `rgba(70, 70, 70, ${Math.random() * 0.4 + 0.6})`);
    interiorGradient.addColorStop(1, `rgba(90, 90, 90, ${Math.random() * 0.3 + 0.4})`);
    ctx.fillStyle = interiorGradient;
    ctx.beginPath();
    ctx.arc(x, y, interiorRadius, 0, Math.PI * 2);
    ctx.fill();

    // Add shadow on one side of crater
    const shadowOffsetX = Math.cos(lightAngle) * radius * 0.4;
    const shadowOffsetY = Math.sin(lightAngle) * radius * 0.4;
    const shadowGradient = ctx.createRadialGradient(
      x - shadowOffsetX,
      y - shadowOffsetY,
      0,
      x - shadowOffsetX,
      y - shadowOffsetY,
      radius * 0.9
    );
    shadowGradient.addColorStop(0, `rgba(30, 30, 30, ${Math.random() * 0.5 + 0.6})`);
    shadowGradient.addColorStop(1, 'rgba(80, 80, 80, 0)');
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(x - shadowOffsetX, y - shadowOffsetY, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Add central peak (some craters have them)
    if (Math.random() > 0.5) {
      const peakRadius = radius * 0.2;
      const peakGradient = ctx.createRadialGradient(x, y, 0, x, y, peakRadius);
      peakGradient.addColorStop(0, `rgba(150, 150, 150, ${Math.random() * 0.4 + 0.6})`);
      peakGradient.addColorStop(1, `rgba(110, 110, 110, ${Math.random() * 0.3 + 0.4})`);
      ctx.fillStyle = peakGradient;
      ctx.beginPath();
      ctx.arc(x, y, peakRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add medium craters (scaled by resolution)
  const mediumCraterCount = Math.floor(40 * resolution);
  for (let i = 0; i < mediumCraterCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 20 + 10;
    const lightAngle = Math.random() * Math.PI * 2;

    ctx.fillStyle = `rgba(145, 145, 145, ${Math.random() * 0.4 + 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    const interiorRadius = radius * 0.75;
    const interiorGradient = ctx.createRadialGradient(x, y, 0, x, y, interiorRadius);
    interiorGradient.addColorStop(0, `rgba(65, 65, 65, ${Math.random() * 0.5 + 0.6})`);
    interiorGradient.addColorStop(1, `rgba(85, 85, 85, ${Math.random() * 0.3 + 0.4})`);
    ctx.fillStyle = interiorGradient;
    ctx.beginPath();
    ctx.arc(x, y, interiorRadius, 0, Math.PI * 2);
    ctx.fill();

    const shadowOffsetX = Math.cos(lightAngle) * radius * 0.5;
    const shadowOffsetY = Math.sin(lightAngle) * radius * 0.5;
    ctx.fillStyle = `rgba(45, 45, 45, ${Math.random() * 0.4 + 0.5})`;
    ctx.beginPath();
    ctx.arc(x - shadowOffsetX, y - shadowOffsetY, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add small craters (scaled by resolution)
  const smallCraterCount = Math.floor(120 * resolution);
  for (let i = 0; i < smallCraterCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 8 + 3;

    ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.5 + 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(70, 70, 70, ${Math.random() * 0.4 + 0.4})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.4, y - radius * 0.4, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add tiny impact pits (scaled by resolution)
  const impactPitCount = Math.floor(250 * resolution);
  for (let i = 0; i < impactPitCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 3 + 1;

    ctx.fillStyle = `rgba(90, 90, 90, ${Math.random() * 0.6 + 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add surface texture and variations using noise
  const finalImageData = ctx.getImageData(0, 0, width, height);
  const finalData = finalImageData.data;
  for (let i = 0; i < finalData.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);

    // Use noise for surface roughness
      const roughness = seamlessFractalNoise(x * 0.05, y * 0.05, width, 3, 0.6, 1, 2000);
      const variation = (roughness - 0.5) * 15;

    const brightness = 1 + variation / 255;
    finalData[i] = Math.max(50, Math.min(200, finalData[i] * brightness));
    finalData[i + 1] = Math.max(50, Math.min(200, finalData[i + 1] * brightness));
    finalData[i + 2] = Math.max(50, Math.min(200, finalData[i + 2] * brightness));
  }

  // Make seamless
  const seamlessData = makeSeamless(finalImageData, width, height);
  ctx.putImageData(seamlessData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Cache the texture
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Create complex procedural planet texture using canvas
 * Uses equirectangular projection and noise-based generation for realistic surfaces
 * @param {string} name - Planet name
 * @param {number} color - Planet color
 * @param {number} size - Planet size
 * @param {number} resolution - Resolution multiplier (1.0 = 2048x1024, 0.5 = 1024x512, etc.)
 */
export function createPlanetTexture(name, color, size, resolution = 1.0) {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('THREE.js must be loaded before creating textures');
  }

  // Check cache first
  const cacheKey = `planet-${name}-${color}-${size}-${resolution}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey).clone();
  }

  // Use equirectangular projection (2:1 aspect ratio) for optimal sphere mapping
  const baseWidth = 2048;
  const baseHeight = 1024;
  const width = Math.floor(baseWidth * resolution);
  const height = Math.floor(baseHeight * resolution);
  const { canvas, ctx } = createEquirectangularCanvas(width, height);

  const baseColor = new THREE.Color(color);
  const r = Math.floor(baseColor.r * 255);
  const g = Math.floor(baseColor.g * 255);
  const b = Math.floor(baseColor.b * 255);

  // Create base with noise-based variation for depth
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Generate base color with seamless noise variation for proper wrapping
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const baseNoise = seamlessFractalNoise(x * 0.005, y * 0.005, width, 3, 0.6, 1, 3000);
      const brightness = 0.85 + baseNoise * 0.3;
      data[idx] = Math.max(0, Math.min(255, r * brightness));
      data[idx + 1] = Math.max(0, Math.min(255, g * brightness));
      data[idx + 2] = Math.max(0, Math.min(255, b * brightness));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Planet-specific features (scaled by resolution)
  if (name === 'Pyro') {
    // Lava/volcanic texture with noise-based flows
    const lavaCount = Math.floor(200 * resolution);
    for (let i = 0; i < lavaCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 40 + 15;

      const lavaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      lavaGradient.addColorStop(0, `rgba(255, ${150 + Math.random() * 60}, 0, ${Math.random() * 0.7 + 0.5})`);
      lavaGradient.addColorStop(0.5, `rgba(255, ${100 + Math.random() * 60}, 0, ${Math.random() * 0.5 + 0.4})`);
      lavaGradient.addColorStop(1, `rgba(200, 50, 0, 0)`);
      ctx.fillStyle = lavaGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Volcanic cracks using noise patterns
    const crackCount = Math.floor(80 * resolution);
    for (let i = 0; i < crackCount; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const length = Math.random() * 100 + 50;
      const angle = Math.random() * Math.PI * 2;

      ctx.strokeStyle = `rgba(255, 40, 0, ${Math.random() * 0.6 + 0.4})`;
      ctx.lineWidth = Math.random() * 5 + 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      // Create jagged crack path
      let currentX = startX;
      let currentY = startY;
      for (let j = 0; j < 10; j++) {
        const segmentAngle = angle + (fractalNoise(j * 0.5, i, 2, 0.7, 1, 4000) - 0.5) * 0.8;
        const segmentLength = length / 10;
        currentX += Math.cos(segmentAngle) * segmentLength;
        currentY += Math.sin(segmentAngle) * segmentLength;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }

    // Hot spots (glowing areas)
    const hotSpotCount = Math.floor(60 * resolution);
    for (let i = 0; i < hotSpotCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 20 + 8;

      const hotSpotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      hotSpotGradient.addColorStop(0, `rgba(255, 255, 200, ${Math.random() * 0.8 + 0.4})`);
      hotSpotGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
      ctx.fillStyle = hotSpotGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Crystal') {
    // Ice crystal texture with noise-based formations
    const crystalCount = Math.floor(120 * resolution);
    for (let i = 0; i < crystalCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 50 + 25;

      ctx.strokeStyle = `rgba(200, 255, 255, ${Math.random() * 0.7 + 0.5})`;
      ctx.lineWidth = Math.random() * 4 + 2;
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

      const innerSize = size * 0.6;
      ctx.strokeStyle = `rgba(220, 255, 255, ${Math.random() * 0.6 + 0.4})`;
      ctx.lineWidth = Math.random() * 2.5 + 1;
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

    // Frost patterns using noise
    const frostCount = Math.floor(150 * resolution);
    for (let i = 0; i < frostCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = Math.random() * 40 + 15;
      const angle = Math.random() * Math.PI * 2;

      ctx.strokeStyle = `rgba(180, 240, 255, ${Math.random() * 0.5 + 0.4})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    // Ice cracks
    const iceCrackCount = Math.floor(70 * resolution);
    for (let i = 0; i < iceCrackCount; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const segments = Math.random() * 6 + 4;
      ctx.strokeStyle = `rgba(150, 200, 255, ${Math.random() * 0.6 + 0.4})`;
      ctx.lineWidth = Math.random() * 3 + 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let currentX = startX;
      let currentY = startY;
      for (let j = 0; j < segments; j++) {
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 25 + 12;
        currentX += Math.cos(angle) * length;
        currentY += Math.sin(angle) * length;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }
  } else if (name === 'Terra') {
    // Earth-like continents with noise-based terrain
    const continentCount = Math.floor(20 * resolution);
    for (let i = 0; i < continentCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 140 + 80;

      const continentGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      continentGradient.addColorStop(0, `rgba(${Math.max(0, r - 70)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 80)}, ${Math.random() * 0.4 + 0.7})`);
      continentGradient.addColorStop(0.7, `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 60)}, ${Math.random() * 0.3 + 0.5})`);
      continentGradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
      ctx.fillStyle = continentGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountain ranges using noise
    const mountainCount = Math.floor(60 * resolution);
    for (let i = 0; i < mountainCount; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const length = Math.random() * 80 + 40;
      const angle = Math.random() * Math.PI * 2;

      ctx.strokeStyle = `rgba(${Math.max(0, r - 90)}, ${Math.max(0, g - 70)}, ${Math.max(0, b - 100)}, ${Math.random() * 0.5 + 0.5})`;
      ctx.lineWidth = Math.random() * 5 + 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      let currentX = startX;
      let currentY = startY;
      for (let j = 0; j < 10; j++) {
        const segmentAngle = angle + (fractalNoise(j * 0.3, i, 2, 0.7, 1, 5000) - 0.5) * 0.6;
        const segmentLength = length / 10;
        currentX += Math.cos(segmentAngle) * segmentLength;
        currentY += Math.sin(segmentAngle) * segmentLength;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }

    // Cloud layers
    const cloudCount = Math.floor(150 * resolution);
    for (let i = 0; i < cloudCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 45 + 20;

      const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      cloudGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.3})`);
      cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloudGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Water bodies (oceans)
    const oceanCount = Math.floor(35 * resolution);
    for (let i = 0; i < oceanCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 100 + 50;

      const oceanGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      oceanGradient.addColorStop(0, `rgba(${r - 25}, ${g - 15}, ${b + 25}, ${Math.random() * 0.3 + 0.4})`);
      oceanGradient.addColorStop(1, 'rgba(100, 150, 200, 0)');
      ctx.fillStyle = oceanGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Vermillion') {
    // Pink clouds with atmospheric layers
    const vermillionCloudCount = Math.floor(160 * resolution);
    for (let i = 0; i < vermillionCloudCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 50 + 25;

      const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      cloudGradient.addColorStop(0, `rgba(255, ${150 + Math.random() * 60}, ${180 + Math.random() * 60}, ${Math.random() * 0.6 + 0.5})`);
      cloudGradient.addColorStop(0.7, `rgba(255, ${120 + Math.random() * 60}, ${150 + Math.random() * 60}, ${Math.random() * 0.4 + 0.3})`);
      cloudGradient.addColorStop(1, 'rgba(255, 100, 150, 0)');
      ctx.fillStyle = cloudGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cloud swirls
    const swirlCount = Math.floor(50 * resolution);
    for (let i = 0; i < swirlCount; i++) {
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      const radius = Math.random() * 80 + 40;

      ctx.strokeStyle = `rgba(255, 180, 220, ${Math.random() * 0.5 + 0.4})`;
      ctx.lineWidth = Math.random() * 10 + 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Atmospheric haze
    const hazeCount = Math.floor(80 * resolution);
    for (let i = 0; i < hazeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 120 + 60;

      const hazeGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      hazeGradient.addColorStop(0, `rgba(255, 150, 200, ${Math.random() * 0.2 + 0.15})`);
      hazeGradient.addColorStop(1, 'rgba(255, 100, 150, 0)');
      ctx.fillStyle = hazeGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Titan') {
    // Gas giant bands with complex turbulence
    let currentY = 0;
    while (currentY < height) {
      const bandHeight = Math.random() * (height / 12) + height / 20;
      const bandColor = Math.random() > 0.5
        ? `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.4 + 0.8})`
        : `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, ${Math.random() * 0.4 + 0.8})`;

      ctx.fillStyle = bandColor;
      ctx.fillRect(0, currentY, width, bandHeight);

      const bandGradient = ctx.createLinearGradient(0, currentY, 0, currentY + bandHeight);
      bandGradient.addColorStop(0, `rgba(${r + 15}, ${g + 15}, ${b + 15}, 0.3)`);
      bandGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      bandGradient.addColorStop(1, `rgba(${r - 15}, ${g - 15}, ${b - 15}, 0.3)`);
      ctx.fillStyle = bandGradient;
      ctx.fillRect(0, currentY, width, bandHeight);

      currentY += bandHeight;
    }

    // Add storm systems (Great Red Spot-like)
    const stormCount = Math.floor(12 * resolution);
    for (let i = 0; i < stormCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 100 + 60;

      const stormGradient = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius);
      stormGradient.addColorStop(0, `rgba(${r + 40}, ${g + 40}, ${b + 40}, ${Math.random() * 0.5 + 0.4})`);
      stormGradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
      ctx.fillStyle = stormGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.7);
      centerGradient.addColorStop(0, `rgba(${r - 30}, ${g - 30}, ${b - 30}, ${Math.random() * 0.6 + 0.5})`);
      centerGradient.addColorStop(1, `rgba(${r + 15}, ${g + 15}, ${b + 15}, ${Math.random() * 0.4 + 0.3})`);
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add turbulence and eddies
    const eddyCount = Math.floor(150 * resolution);
    for (let i = 0; i < eddyCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 30 + 12;

      const eddyGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      eddyGradient.addColorStop(0, `rgba(${r + 25}, ${g + 25}, ${b + 25}, ${Math.random() * 0.4 + 0.3})`);
      eddyGradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
      ctx.fillStyle = eddyGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Nebula') {
    // Purple nebula swirls with complex patterns
    const nebulaSwirlCount = Math.floor(140 * resolution);
    for (let i = 0; i < nebulaSwirlCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 80 + 40;

      const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      nebulaGradient.addColorStop(0, `rgba(${150 + Math.random() * 60}, ${100 + Math.random() * 60}, ${180 + Math.random() * 60}, ${Math.random() * 0.6 + 0.5})`);
      nebulaGradient.addColorStop(0.6, `rgba(${120 + Math.random() * 50}, ${80 + Math.random() * 50}, ${150 + Math.random() * 50}, ${Math.random() * 0.4 + 0.3})`);
      nebulaGradient.addColorStop(1, 'rgba(100, 60, 120, 0)');
      ctx.fillStyle = nebulaGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swirling patterns
    const swirlPatternCount = Math.floor(70 * resolution);
    for (let i = 0; i < swirlPatternCount; i++) {
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      const startRadius = Math.random() * 50 + 25;
      const endRadius = startRadius + Math.random() * 80 + 40;

      ctx.strokeStyle = `rgba(180, 120, 220, ${Math.random() * 0.5 + 0.4})`;
      ctx.lineWidth = Math.random() * 8 + 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (startRadius + endRadius) / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Bright star-forming regions
    const starFormingCount = Math.floor(40 * resolution);
    for (let i = 0; i < starFormingCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 25 + 12;

      const starGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      starGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.5})`);
      starGradient.addColorStop(0.5, `rgba(200, 150, 255, ${Math.random() * 0.5 + 0.4})`);
      starGradient.addColorStop(1, 'rgba(150, 100, 200, 0)');
      ctx.fillStyle = starGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Aurora') {
    // Green aurora-like streaks with complex patterns
    const auroraStreakCount = Math.floor(100 * resolution);
    for (let i = 0; i < auroraStreakCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const widthAurora = Math.random() * 40 + 15;
      const heightAurora = Math.random() * 120 + 60;
      const angle = Math.random() * Math.PI * 0.3 - Math.PI * 0.15;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const auroraGradient = ctx.createLinearGradient(0, -heightAurora / 2, 0, heightAurora / 2);
      auroraGradient.addColorStop(0, `rgba(0, 255, ${150 + Math.random() * 60}, 0)`);
      auroraGradient.addColorStop(0.3, `rgba(0, 255, ${180 + Math.random() * 60}, ${Math.random() * 0.6 + 0.5})`);
      auroraGradient.addColorStop(0.7, `rgba(0, 255, ${150 + Math.random() * 60}, ${Math.random() * 0.6 + 0.5})`);
      auroraGradient.addColorStop(1, `rgba(0, 255, ${120 + Math.random() * 60}, 0)`);

      ctx.fillStyle = auroraGradient;
      ctx.fillRect(-widthAurora / 2, -heightAurora / 2, widthAurora, heightAurora);
      ctx.restore();
    }

    // Wavy aurora patterns
    const wavyAuroraCount = Math.floor(50 * resolution);
    for (let i = 0; i < wavyAuroraCount; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const length = Math.random() * 180 + 120;

      ctx.strokeStyle = `rgba(0, 255, ${150 + Math.random() * 60}, ${Math.random() * 0.6 + 0.5})`;
      ctx.lineWidth = Math.random() * 10 + 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      let currentX = startX;
      let currentY = startY;
      for (let j = 0; j < 25; j++) {
        const waveOffset = Math.sin(j * 0.4) * 20;
        const stepX = Math.cos(Math.PI / 2) * (length / 25);
        const stepY = Math.sin(Math.PI / 2) * (length / 25) + waveOffset;
        currentX += stepX;
        currentY += stepY;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }

    // Glowing aurora particles
    const auroraParticleCount = Math.floor(300 * resolution);
    for (let i = 0; i < auroraParticleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 4 + 1.5;

      ctx.fillStyle = `rgba(0, 255, ${150 + Math.random() * 60}, ${Math.random() * 0.7 + 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Obsidian') {
    // Dark rocky texture with detailed surface
    const rockCount = Math.floor(150 * resolution);
    for (let i = 0; i < rockCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 60 + 25;

      const rockGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      rockGradient.addColorStop(0, `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, ${Math.random() * 0.5 + 0.7})`);
      rockGradient.addColorStop(1, `rgba(${Math.max(0, r - 15)}, ${Math.max(0, g - 15)}, ${Math.max(0, b - 15)}, ${Math.random() * 0.4 + 0.5})`);
      ctx.fillStyle = rockGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Surface cracks and fissures
    const fissureCount = Math.floor(160 * resolution);
    for (let i = 0; i < fissureCount; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const length = Math.random() * 80 + 40;
      const angle = Math.random() * Math.PI * 2;

      ctx.strokeStyle = `rgba(${Math.max(0, r - 70)}, ${Math.max(0, g - 70)}, ${Math.max(0, b - 70)}, ${Math.random() * 0.6 + 0.5})`;
      ctx.lineWidth = Math.random() * 4 + 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
      ctx.stroke();
    }

    // Small rock details
    const smallRockCount = Math.floor(400 * resolution);
    for (let i = 0; i < smallRockCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 6 + 1.5;

      ctx.fillStyle = `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, ${Math.random() * 0.7 + 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mineral deposits (glowing spots)
    const mineralCount = Math.floor(70 * resolution);
    for (let i = 0; i < mineralCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 10 + 4;

      const mineralGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      mineralGradient.addColorStop(0, `rgba(${r + 30}, ${g + 30}, ${b + 30}, ${Math.random() * 0.6 + 0.5})`);
      mineralGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = mineralGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add complex surface texture and detail using noise
  const finalImageData = ctx.getImageData(0, 0, width, height);
  const finalData = finalImageData.data;
  for (let i = 0; i < finalData.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);

    // Use seamless noise for surface roughness to avoid horizontal seams
    const roughness = seamlessFractalNoise(x * 0.03, y * 0.03, width, 3, 0.6, 1, 6000);
    const variation = (roughness - 0.5) * 30;

    const brightness = 1 + variation / 255;
    finalData[i] = Math.max(0, Math.min(255, finalData[i] * brightness));
    finalData[i + 1] = Math.max(0, Math.min(255, finalData[i + 1] * brightness));
    finalData[i + 2] = Math.max(0, Math.min(255, finalData[i + 2] * brightness));
  }

  // Make seamless for proper wrapping
  const seamlessData = makeSeamless(finalImageData, width, height);
  ctx.putImageData(seamlessData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
