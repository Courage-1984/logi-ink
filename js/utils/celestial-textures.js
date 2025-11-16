/**
 * Celestial Texture Generator
 * Generates procedural textures for sun, planets, and moons using canvas
 */

/**
 * Create complex sun texture with detailed solar features
 */
export function createSunTexture() {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('THREE.js must be loaded before creating textures');
  }

  const canvas = document.createElement('canvas');
  const resolution = 1024;
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
  coreGradient.addColorStop(0, '#ffffff');
  coreGradient.addColorStop(0.1, '#ffff88');
  coreGradient.addColorStop(0.25, '#ffcc00');
  coreGradient.addColorStop(0.4, '#ff9900');
  coreGradient.addColorStop(0.6, '#ff6600');
  coreGradient.addColorStop(0.8, '#ff4400');
  coreGradient.addColorStop(1, '#cc2200');

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

    const x1 = resolution / 2 + Math.cos(angle) * baseRadius;
    const y1 = resolution / 2 + Math.sin(angle) * baseRadius;
    const x2 = resolution / 2 + Math.cos(angle) * (baseRadius + flareLength);
    const y2 = resolution / 2 + Math.sin(angle) * (baseRadius + flareLength);

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
    const umbraRadius = Math.random() * 25 + 8;
    const penumbraRadius = umbraRadius * (1.8 + Math.random() * 0.4);

    const penumbraGradient = ctx.createRadialGradient(x, y, umbraRadius, x, y, penumbraRadius);
    penumbraGradient.addColorStop(0, `rgba(200, 100, 0, ${Math.random() * 0.4 + 0.3})`);
    penumbraGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = penumbraGradient;
    ctx.beginPath();
    ctx.arc(x, y, penumbraRadius, 0, Math.PI * 2);
    ctx.fill();

    const umbraGradient = ctx.createRadialGradient(x, y, 0, x, y, umbraRadius);
    umbraGradient.addColorStop(0, `rgba(100, 50, 0, ${Math.random() * 0.6 + 0.4})`);
    umbraGradient.addColorStop(1, `rgba(200, 100, 0, ${Math.random() * 0.3 + 0.2})`);
    ctx.fillStyle = umbraGradient;
    ctx.beginPath();
    ctx.arc(x, y, umbraRadius, 0, Math.PI * 2);
    ctx.fill();

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

    if (distFromCenter < resolution / 2) {
      const granuleSize = 8;
      const granuleX = Math.floor(x / granuleSize);
      const granuleY = Math.floor(y / granuleSize);
      const granuleValue = (Math.sin(granuleX * 0.5) * Math.cos(granuleY * 0.5) + 1) * 0.5;

      const brightness = 1 + (granuleValue - 0.5) * 0.15;
      data[i] = Math.min(255, data[i] * brightness);
      data[i + 1] = Math.min(255, data[i + 1] * brightness * 0.9);
      data[i + 2] = Math.min(255, data[i + 2] * brightness * 0.8);
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Create detailed moon texture with complex crater details
 */
export function createMoonTexture() {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('THREE.js must be loaded before creating textures');
  }

  const canvas = document.createElement('canvas');
  const resolution = 512;
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');

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

  const largeCraterCount = 8;
  for (let i = 0; i < largeCraterCount; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 35 + 20;
    const lightAngle = Math.random() * Math.PI * 2;

    const rimGradient = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius);
    rimGradient.addColorStop(0, `rgba(150, 150, 150, ${Math.random() * 0.3 + 0.4})`);
    rimGradient.addColorStop(1, `rgba(120, 120, 120, ${Math.random() * 0.2 + 0.3})`);
    ctx.fillStyle = rimGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    const interiorRadius = radius * 0.7;
    const interiorGradient = ctx.createRadialGradient(x, y, 0, x, y, interiorRadius);
    interiorGradient.addColorStop(0, `rgba(60, 60, 60, ${Math.random() * 0.4 + 0.6})`);
    interiorGradient.addColorStop(0.5, `rgba(80, 80, 80, ${Math.random() * 0.3 + 0.5})`);
    interiorGradient.addColorStop(1, `rgba(100, 100, 100, ${Math.random() * 0.2 + 0.3})`);
    ctx.fillStyle = interiorGradient;
    ctx.beginPath();
    ctx.arc(x, y, interiorRadius, 0, Math.PI * 2);
    ctx.fill();

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

  const mediumCraterCount = 25;
  for (let i = 0; i < mediumCraterCount; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 15 + 8;
    const lightAngle = Math.random() * Math.PI * 2;

    ctx.fillStyle = `rgba(140, 140, 140, ${Math.random() * 0.3 + 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    const interiorRadius = radius * 0.7;
    const interiorGradient = ctx.createRadialGradient(x, y, 0, x, y, interiorRadius);
    interiorGradient.addColorStop(0, `rgba(70, 70, 70, ${Math.random() * 0.4 + 0.5})`);
    interiorGradient.addColorStop(1, `rgba(90, 90, 90, ${Math.random() * 0.2 + 0.3})`);
    ctx.fillStyle = interiorGradient;
    ctx.beginPath();
    ctx.arc(x, y, interiorRadius, 0, Math.PI * 2);
    ctx.fill();

    const shadowOffsetX = Math.cos(lightAngle) * radius * 0.4;
    const shadowOffsetY = Math.sin(lightAngle) * radius * 0.4;
    ctx.fillStyle = `rgba(50, 50, 50, ${Math.random() * 0.3 + 0.4})`;
    ctx.beginPath();
    ctx.arc(x - shadowOffsetX, y - shadowOffsetY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  const smallCraterCount = 80;
  for (let i = 0; i < smallCraterCount; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 6 + 2;

    ctx.fillStyle = `rgba(90, 90, 90, ${Math.random() * 0.4 + 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.3 + 0.3})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 150; i++) {
    const x = Math.random() * resolution;
    const y = Math.random() * resolution;
    const radius = Math.random() * 2 + 0.5;

    ctx.fillStyle = `rgba(80, 80, 80, ${Math.random() * 0.5 + 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const imageData = ctx.getImageData(0, 0, resolution, resolution);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % resolution;
    const y = Math.floor(i / 4 / resolution);

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
export function createPlanetTexture(name, color, size) {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('THREE.js must be loaded before creating textures');
  }

  const canvas = document.createElement('canvas');
  const resolution = 1024;
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');

  const baseColor = new THREE.Color(color);
  const r = Math.floor(baseColor.r * 255);
  const g = Math.floor(baseColor.g * 255);
  const b = Math.floor(baseColor.b * 255);

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

  if (name === 'Pyro') {
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
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const size = Math.random() * 40 + 20;

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
    let currentY = 0;
    while (currentY < resolution) {
      const bandHeight = Math.random() * (resolution / 15) + resolution / 25;
      const bandColor =
        Math.random() > 0.5
          ? `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.3 + 0.7})`
          : `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, ${Math.random() * 0.3 + 0.7})`;

      ctx.fillStyle = bandColor;
      ctx.fillRect(0, currentY, resolution, bandHeight);

      const bandGradient = ctx.createLinearGradient(0, currentY, 0, currentY + bandHeight);
      bandGradient.addColorStop(0, `rgba(${r + 10}, ${g + 10}, ${b + 10}, 0.2)`);
      bandGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      bandGradient.addColorStop(1, `rgba(${r - 10}, ${g - 10}, ${b - 10}, 0.2)`);
      ctx.fillStyle = bandGradient;
      ctx.fillRect(0, currentY, resolution, bandHeight);

      currentY += bandHeight;
    }

    for (let i = 0; i < 8; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 80 + 50;

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
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const width = Math.random() * 30 + 10;
      const height = Math.random() * 100 + 50;
      const angle = Math.random() * Math.PI * 0.3 - Math.PI * 0.15;

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

    for (let i = 0; i < 40; i++) {
      const startX = Math.random() * resolution;
      const startY = Math.random() * resolution;
      const length = Math.random() * 150 + 100;

      ctx.strokeStyle = `rgba(0, 255, ${150 + Math.random() * 50}, ${Math.random() * 0.5 + 0.4})`;
      ctx.lineWidth = Math.random() * 8 + 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);

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

    for (let i = 0; i < 300; i++) {
      const x = Math.random() * resolution;
      const y = Math.random() * resolution;
      const radius = Math.random() * 5 + 1;

      ctx.fillStyle = `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, ${Math.random() * 0.6 + 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

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

  const imageData = ctx.getImageData(0, 0, resolution, resolution);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % resolution;
    const y = Math.floor(i / 4 / resolution);

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
