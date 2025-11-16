/**
 * Texture Wrapping Utilities
 * Handles seamless texture wrapping for equirectangular sphere mapping
 * Addresses horizontal seams and pole distortion issues
 */

/**
 * Create a seamless equirectangular texture canvas (2:1 aspect ratio)
 * @param {number} width - Texture width
 * @param {number} height - Texture height
 * @returns {Object} Canvas and context
 */
export function createEquirectangularCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d'), width, height };
}

/**
 * Convert UV coordinates to equirectangular pixel coordinates
 * @param {number} u - U coordinate (0-1, longitude)
 * @param {number} v - V coordinate (0-1, latitude)
 * @param {number} width - Texture width
 * @param {number} height - Texture height
 * @returns {Object} Pixel coordinates {x, y}
 */
export function uvToEquirectangular(u, v, width, height) {
  const x = (u * width) % width;
  const y = v * height;
  return { x: Math.floor(x), y: Math.floor(y) };
}

/**
 * Convert equirectangular pixel coordinates to UV
 * @param {number} x - Pixel x coordinate
 * @param {number} y - Pixel y coordinate
 * @param {number} width - Texture width
 * @param {number} height - Texture height
 * @returns {Object} UV coordinates {u, v}
 */
export function equirectangularToUV(x, y, width, height) {
  const u = (x / width) % 1;
  const v = y / height;
  return { u, v };
}

/**
 * Check if coordinates are near the poles (where distortion occurs)
 * @param {number} v - V coordinate (0-1, latitude)
 * @param {number} poleThreshold - Threshold for pole region (default 0.05 = 5% from top/bottom)
 * @returns {Object} {isNearPole, poleFactor} - poleFactor is 0 at equator, 1 at pole
 */
export function isNearPole(v, poleThreshold = 0.05) {
  const distanceFromEquator = Math.abs(v - 0.5) * 2; // 0 at equator, 1 at pole
  const isNearPole = distanceFromEquator > (1 - poleThreshold * 2);
  const poleFactor = Math.max(0, (distanceFromEquator - (1 - poleThreshold * 2)) / (poleThreshold * 2));
  return { isNearPole, poleFactor };
}

/**
 * Improved seamless wrapping with multi-pixel blending
 * Blends multiple edge pixels for smoother transitions
 * @param {ImageData} imageData - Image data to make seamless
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} blendWidth - Number of pixels to blend at edges (default 3)
 * @returns {ImageData} Seamless image data
 */
export function makeSeamless(imageData, width, height, blendWidth = 3) {
  const data = imageData.data;
  const blendWidthClamped = Math.min(blendWidth, Math.floor(width / 4)); // Don't blend more than 1/4 of width

  // Blend horizontal edges (left/right wrap)
  for (let y = 0; y < height; y++) {
    for (let blend = 0; blend < blendWidthClamped; blend++) {
      const leftIdx = (y * width + blend) * 4;
      const rightIdx = (y * width + width - 1 - blend) * 4;
      const leftWrapIdx = (y * width + width - 1 - blend) * 4;
      const rightWrapIdx = (y * width + blend) * 4;

      // Calculate blend factor (stronger at edges, weaker further in)
      const blendFactor = 1 - (blend / blendWidthClamped);

      // Blend left edge with right edge
      for (let c = 0; c < 4; c++) {
        const leftValue = data[leftIdx + c];
        const rightValue = data[rightIdx + c];
        const blended = leftValue * (1 - blendFactor * 0.5) + rightValue * (blendFactor * 0.5);
        data[leftIdx + c] = blended;
        data[leftWrapIdx + c] = blended;
      }

      // Blend right edge with left edge
      for (let c = 0; c < 4; c++) {
        const rightValue = data[rightIdx + c];
        const leftValue = data[leftIdx + blend];
        const leftWrapValue = data[leftWrapIdx + c];
        const blended = rightValue * (1 - blendFactor * 0.5) + leftWrapValue * (blendFactor * 0.5);
        data[rightIdx + c] = blended;
        data[rightWrapIdx + c] = blended;
      }
    }
  }

  // Blend vertical edges at poles (top/bottom wrap) - but with less blending due to pole distortion
  const poleBlendWidth = Math.min(2, Math.floor(height / 8));
  for (let x = 0; x < width; x++) {
    for (let blend = 0; blend < poleBlendWidth; blend++) {
      const topIdx = (blend * width + x) * 4;
      const bottomIdx = ((height - 1 - blend) * width + x) * 4;
      const topWrapIdx = ((height - 1 - blend) * width + x) * 4;
      const bottomWrapIdx = (blend * width + x) * 4;

      const blendFactor = 1 - (blend / poleBlendWidth);

      // Blend top edge with bottom edge (lighter blend for poles)
      for (let c = 0; c < 4; c++) {
        const topValue = data[topIdx + c];
        const bottomValue = data[bottomIdx + c];
        const blended = topValue * (1 - blendFactor * 0.3) + bottomValue * (blendFactor * 0.3);
        data[topIdx + c] = blended;
        data[topWrapIdx + c] = blended;
      }

      // Blend bottom edge with top edge
      for (let c = 0; c < 4; c++) {
        const bottomValue = data[bottomIdx + c];
        const topWrapValue = data[topWrapIdx + c];
        const blended = bottomValue * (1 - blendFactor * 0.3) + topWrapValue * (blendFactor * 0.3);
        data[bottomIdx + c] = blended;
        data[bottomWrapIdx + c] = blended;
      }
    }
  }

  return imageData;
}

/**
 * Apply pole-aware feature placement
 * Avoids placing distinct features near poles where distortion is high
 * @param {number} v - V coordinate (0-1, latitude)
 * @param {number} poleExclusionZone - Zone to exclude features (default 0.08 = 8% from top/bottom)
 * @returns {boolean} True if feature should be placed here
 */
export function shouldPlaceFeatureAtPole(v, poleExclusionZone = 0.08) {
  const poleInfo = isNearPole(v, poleExclusionZone);
  return !poleInfo.isNearPole;
}

/**
 * Get pole-aware feature scale factor
 * Scales down features near poles to reduce distortion visibility
 * @param {number} v - V coordinate (0-1, latitude)
 * @param {number} poleThreshold - Threshold for pole region
 * @returns {number} Scale factor (1.0 at equator, smaller near poles)
 */
export function getPoleScaleFactor(v, poleThreshold = 0.1) {
  const { poleFactor } = isNearPole(v, poleThreshold);
  return 1 - (poleFactor * 0.5); // Scale down to 50% at poles
}

/**
 * Create a Three.js texture with proper wrapping settings for spheres
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} options - Texture options
 * @returns {THREE.Texture} Configured Three.js texture
 */
export function createSphereTexture(canvas, options = {}) {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('THREE.js must be loaded before creating textures');
  }

  const {
    wrapS = THREE.RepeatWrapping,
    wrapT = THREE.ClampToEdgeWrapping,
    minFilter = THREE.LinearMipmapLinearFilter,
    magFilter = THREE.LinearFilter,
    generateMipmaps = true,
  } = options;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = wrapS;
  texture.wrapT = wrapT;
  texture.minFilter = minFilter;
  texture.magFilter = magFilter;

  if (generateMipmaps) {
    texture.generateMipmaps = true;
  }

  return texture;
}

