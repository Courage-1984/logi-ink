/**
 * Procedural Noise Generation
 * Provides noise functions for procedural texture generation
 */

/**
 * Simple Perlin noise-like function for procedural generation
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} seed - Random seed
 * @returns {number} Noise value (0-1)
 */
export function noise(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Smooth interpolation (smoothstep)
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Input value
 * @returns {number} Interpolated value
 */
export function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Fractal noise with multiple octaves
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} octaves - Number of octaves (default 4)
 * @param {number} persistence - Persistence value (default 0.5)
 * @param {number} scale - Scale factor (default 1)
 * @param {number} seed - Random seed (default 0)
 * @returns {number} Fractal noise value (0-1)
 */
export function fractalNoise(x, y, octaves = 4, persistence = 0.5, scale = 1, seed = 0) {
  let value = 0;
  let amplitude = 1;
  let frequency = scale;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    const nx = Math.floor(x * frequency);
    const ny = Math.floor(y * frequency);
    const fx = (x * frequency) - nx;
    const fy = (y * frequency) - ny;

    const n00 = noise(nx, ny, seed + i);
    const n10 = noise(nx + 1, ny, seed + i);
    const n01 = noise(nx, ny + 1, seed + i);
    const n11 = noise(nx + 1, ny + 1, seed + i);

    const sx = smoothstep(0, 1, fx);
    const sy = smoothstep(0, 1, fy);

    const n0 = n00 * (1 - sx) + n10 * sx;
    const n1 = n01 * (1 - sx) + n11 * sx;
    const n = n0 * (1 - sy) + n1 * sy;

    value += n * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return value / maxValue;
}

/**
 * Generate seamless noise value that wraps horizontally
 * @param {number} x - X coordinate (will be wrapped)
 * @param {number} y - Y coordinate
 * @param {number} width - Texture width for wrapping
 * @param {number} seed - Random seed
 * @returns {number} Seamless noise value (0-1)
 */
export function seamlessNoise(x, y, width, seed = 0) {
  // Wrap x coordinate
  const wrappedX = ((x % width) + width) % width;
  return noise(wrappedX, y, seed);
}

/**
 * Generate seamless fractal noise that wraps horizontally
 * @param {number} x - X coordinate (will be wrapped)
 * @param {number} y - Y coordinate
 * @param {number} width - Texture width for wrapping
 * @param {number} octaves - Number of octaves
 * @param {number} persistence - Persistence value
 * @param {number} scale - Scale factor
 * @param {number} seed - Random seed
 * @returns {number} Seamless fractal noise value (0-1)
 */
export function seamlessFractalNoise(x, y, width, octaves = 4, persistence = 0.5, scale = 1, seed = 0) {
  let value = 0;
  let amplitude = 1;
  let frequency = scale;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    const wrappedX = ((x * frequency) % width + width) % width;
    const nx = Math.floor(wrappedX);
    const ny = Math.floor(y * frequency);
    const fx = wrappedX - nx;
    const fy = (y * frequency) - ny;

    // Use seamless noise for horizontal wrapping
    const n00 = seamlessNoise(nx, ny, width, seed + i);
    const n10 = seamlessNoise((nx + 1) % width, ny, width, seed + i);
    const n01 = seamlessNoise(nx, ny + 1, width, seed + i);
    const n11 = seamlessNoise((nx + 1) % width, ny + 1, width, seed + i);

    const sx = smoothstep(0, 1, fx);
    const sy = smoothstep(0, 1, fy);

    const n0 = n00 * (1 - sx) + n10 * sx;
    const n1 = n01 * (1 - sx) + n11 * sx;
    const n = n0 * (1 - sy) + n1 * sy;

    value += n * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return value / maxValue;
}

