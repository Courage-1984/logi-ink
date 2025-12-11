/**
 * GPU Compute Utility Module
 * Handles GPU-accelerated particle updates using WebGPU compute shaders
 * Falls back to CPU updates for WebGL/older browsers
 */

/**
 * Check if WebGPU is available
 * @returns {boolean}
 */
export function isWebGPUAvailable() {
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    return false;
  }
  return true;
}

/**
 * Check if WebGL 2.0 transform feedback is available
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @returns {boolean}
 */
export function isWebGL2TransformFeedbackAvailable(renderer) {
  if (!renderer || !renderer.capabilities) {
    return false;
  }
  // WebGL 2.0 supports transform feedback
  return renderer.capabilities.isWebGL2 === true;
}

/**
 * Initialize GPU compute system
 * @param {Object} THREE - Three.js library
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @returns {Object|null} GPU compute system or null if not available
 */
export async function initGPUCompute(THREE, renderer) {
  // Check for WebGPU support first (best performance)
  if (isWebGPUAvailable()) {
    try {
      return await initWebGPUCompute(THREE, renderer);
    } catch (error) {
      if (isDevelopmentEnv()) {
        console.warn('[GPU Compute] WebGPU initialization failed, falling back to CPU:', error);
      }
    }
  }

  // Check for WebGL 2.0 transform feedback (good performance)
  if (isWebGL2TransformFeedbackAvailable(renderer)) {
    try {
      return await initWebGL2TransformFeedback(THREE, renderer);
    } catch (error) {
      if (isDevelopmentEnv()) {
        console.warn('[GPU Compute] WebGL2 transform feedback failed, falling back to CPU:', error);
      }
    }
  }

  // Fallback to CPU (always available)
  return {
    type: 'cpu',
    available: true,
    updateStarTwinkling: null, // Will use CPU function
    updateSolarWind: null, // Will use CPU function
  };
}

/**
 * Initialize WebGPU compute system
 * @param {Object} THREE - Three.js library
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @returns {Promise<Object>} WebGPU compute system
 */
async function initWebGPUCompute(THREE, renderer) {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('WebGPU adapter not available');
  }

  const device = await adapter.requestDevice();
  if (!device) {
    throw new Error('WebGPU device not available');
  }

  // Create compute shader modules
  const starTwinklingShaderModule = createStarTwinklingComputeShader(device);
  const solarWindShaderModule = createSolarWindComputeShader(device);

  // Create compute pipelines
  const starTwinklingPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: starTwinklingShaderModule,
      entryPoint: 'main',
    },
  });

  const solarWindPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: solarWindShaderModule,
      entryPoint: 'main',
    },
  });

  return {
    type: 'webgpu',
    available: true,
    device: device,
    adapter: adapter,
    starTwinklingPipeline: starTwinklingPipeline,
    solarWindPipeline: solarWindPipeline,
    updateStarTwinkling: createStarTwinklingGPUFunction(device, starTwinklingPipeline),
    updateSolarWind: createSolarWindGPUFunction(device, solarWindPipeline),
  };
}

/**
 * Create WebGPU compute shader for star twinkling
 * @param {GPUDevice} device - WebGPU device
 * @returns {GPUShaderModule} Shader module
 */
function createStarTwinklingComputeShader(device) {
  const shaderCode = `
    struct StarTwinklingUniforms {
      time: f32,
      speedMultiplier: f32,
      twinkleIntensity: f32,
      particleCount: u32,
    };

    @group(0) @binding(0) var<storage, read> baseColors: array<vec3<f32>>;
    @group(0) @binding(1) var<storage, read> twinklePhases: array<f32>;
    @group(0) @binding(2) var<storage, read> twinkleSpeeds: array<f32>;
    @group(0) @binding(3) var<uniform> uniforms: StarTwinklingUniforms;
    @group(0) @binding(4) var<storage, read_write> outputColors: array<vec3<f32>>;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let index = global_id.x;
      if (index >= uniforms.particleCount) {
        return;
      }

      let phase = twinklePhases[index];
      let speed = twinkleSpeeds[index] * uniforms.speedMultiplier;

      // Twinkling effect using sine wave
      let twinkle = sin(uniforms.time * speed + phase) * uniforms.twinkleIntensity + (1.0 - uniforms.twinkleIntensity * 0.5);

      // Apply twinkling to base colors
      outputColors[index] = baseColors[index] * twinkle;
    }
  `;

  return device.createShaderModule({
    code: shaderCode,
  });
}

/**
 * Create WebGPU compute shader for solar wind
 * @param {GPUDevice} device - WebGPU device
 * @returns {GPUShaderModule} Shader module
 */
function createSolarWindComputeShader(device) {
  const shaderCode = `
    struct SolarWindUniforms {
      deltaTime: f32,
      movementFactor: f32,
      maxDistanceSq: f32,
      sunRadius: f32,
      particleCount: u32,
    };

    @group(0) @binding(0) var<storage, read_write> positions: array<vec3<f32>>;
    @group(0) @binding(1) var<storage, read> velocities: array<vec3<f32>>;
    @group(0) @binding(2) var<storage, read_write> lifetimes: array<f32>;
    @group(0) @binding(3) var<uniform> uniforms: SolarWindUniforms;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let index = global_id.x;
      if (index >= uniforms.particleCount) {
        return;
      }

      // Update position with velocity
      positions[index] = positions[index] + velocities[index] * uniforms.deltaTime * uniforms.movementFactor;

      // Decrease lifetime
      lifetimes[index] = lifetimes[index] - uniforms.deltaTime * uniforms.movementFactor;

      // Check if particle needs respawning
      let distanceSq = dot(positions[index], positions[index]);
      let shouldRespawn = lifetimes[index] <= 0.0 || distanceSq > uniforms.maxDistanceSq;

      if (shouldRespawn) {
        // Respawn near sun (using deterministic pseudo-random based on index and time)
        // Use index and a time-based seed for better randomness
        let seed = f32(index) + uniforms.deltaTime * 1000.0;
        let rnd1 = fract(sin(seed * 12.9898) * 43758.5453);
        let rnd2 = fract(sin(seed * 78.233) * 43758.5453);
        let rnd3 = fract(sin(seed * 45.164) * 43758.5453);

        let radius = uniforms.sunRadius + rnd1 * 0.5;
        let theta = rnd2 * 6.28318530718; // 2 * PI
        let phi = rnd3 * 3.14159265359; // PI

        positions[index] = vec3<f32>(
          radius * sin(phi) * cos(theta),
          radius * sin(phi) * sin(theta),
          radius * cos(phi)
        );

        lifetimes[index] = 100.0 + rnd1 * 200.0;
      }
    }
  `;

  return device.createShaderModule({
    code: shaderCode,
  });
}

/**
 * Create GPU function for star twinkling updates
 * @param {GPUDevice} device - WebGPU device
 * @param {GPUComputePipeline} pipeline - Compute pipeline
 * @returns {Function} Update function
 */
function createStarTwinklingGPUFunction(device, pipeline) {
  const bindGroupLayout = pipeline.getBindGroupLayout(0);
  // Cache buffers per star field to avoid recreation
  const bufferCache = new WeakMap();

  return function updateStarTwinklingGPU(starField, time, isMobile = false) {
    if (!starField || !starField.geometry) {
      return;
    }

    const colors = starField.geometry.attributes.color;
    const twinklePhases = starField.geometry.attributes.twinklePhase;
    const twinkleSpeeds = starField.geometry.attributes.twinkleSpeed;

    if (!colors || !twinklePhases || !twinkleSpeeds) {
      return;
    }

    const particleCount = colors.count;
    if (particleCount === 0) {
      return;
    }

    // Store base colors if not already stored
    if (!starField.userData.baseColors) {
      const colorArray = colors.array;
      starField.userData.baseColors = new Float32Array(colorArray.length);
      for (let i = 0; i < colorArray.length; i++) {
        starField.userData.baseColors[i] = colorArray[i];
      }
    }

    const baseColors = starField.userData.baseColors;
    const speedMultiplier = isMobile ? 0.3 : 1.0;
    const twinkleIntensity = isMobile ? 0.15 : 0.3;

    // Get or create cached buffers for this star field
    let buffers = bufferCache.get(starField);
    const bufferSize = baseColors.byteLength;
    const needsNewBuffers = !buffers || buffers.size !== bufferSize;

    if (needsNewBuffers) {
      // Create persistent GPU buffers (reused across frames)
      buffers = {
        size: bufferSize,
        baseColorsBuffer: device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        phasesBuffer: device.createBuffer({
          size: twinklePhases.array.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        speedsBuffer: device.createBuffer({
          size: twinkleSpeeds.array.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        outputColorsBuffer: device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        }),
        uniformBuffer: device.createBuffer({
          size: 16,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        }),
        readbackBuffer: device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        }),
        bindGroup: null, // Will be created below
        readbackPending: false, // Track if readback is in progress
      };
      bufferCache.set(starField, buffers);
    }

    // Skip if readback is already pending (prevents "Buffer mapping is already pending" errors)
    if (buffers.readbackPending) {
      return;
    }

    // Update uniform buffer
    const uniformData = new Float32Array([
      time,
      speedMultiplier,
      twinkleIntensity,
      particleCount,
    ]);
    device.queue.writeBuffer(buffers.uniformBuffer, 0, uniformData);

    // Upload input data (only if changed or first time)
    if (needsNewBuffers || !starField.userData.gpuBuffersInitialized) {
      device.queue.writeBuffer(buffers.baseColorsBuffer, 0, baseColors);
      device.queue.writeBuffer(buffers.phasesBuffer, 0, twinklePhases.array);
      device.queue.writeBuffer(buffers.speedsBuffer, 0, twinkleSpeeds.array);
      starField.userData.gpuBuffersInitialized = true;
    }

    // Create or reuse bind group
    if (!buffers.bindGroup || needsNewBuffers) {
      buffers.bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: buffers.baseColorsBuffer } },
          { binding: 1, resource: { buffer: buffers.phasesBuffer } },
          { binding: 2, resource: { buffer: buffers.speedsBuffer } },
          { binding: 3, resource: { buffer: buffers.uniformBuffer } },
          { binding: 4, resource: { buffer: buffers.outputColorsBuffer } },
        ],
      });
    }

    // Dispatch compute shader
    const workgroupCount = Math.ceil(particleCount / 64);
    const commandEncoder = device.createCommandEncoder();
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, buffers.bindGroup);
    computePass.dispatchWorkgroups(workgroupCount);
    computePass.end();

    // Copy results back to CPU (asynchronous but non-blocking)
    commandEncoder.copyBufferToBuffer(buffers.outputColorsBuffer, 0, buffers.readbackBuffer, 0, bufferSize);
    device.queue.submit([commandEncoder.finish()]);

    // Read results asynchronously (non-blocking)
    // Note: WebGPU readback is async, creating a 1-frame delay
    // This is acceptable for particle effects and allows GPU to work in parallel
    // For real-time rendering, the previous frame's results are used (double-buffering effect)
    buffers.readbackPending = true;
    buffers.readbackBuffer.mapAsync(GPUMapMode.READ).then(() => {
      const mappedRange = buffers.readbackBuffer.getMappedRange();
      const outputData = new Float32Array(mappedRange);
      const colorArray = colors.array;

      // Copy GPU results to Three.js buffer
      for (let i = 0; i < colorArray.length; i++) {
        colorArray[i] = outputData[i];
      }

      colors.needsUpdate = true;
      buffers.readbackBuffer.unmap();
      buffers.readbackPending = false; // Mark readback as complete
    }).catch(error => {
      buffers.readbackPending = false; // Reset flag on error
      // Suppress repeated errors to avoid console spam
      // Only log if this is a new error (not the "already pending" error)
      if (isDevelopmentEnv() && !error.message?.includes('already pending')) {
        console.warn('[GPU Compute] Star twinkling readback failed:', error);
      }
    });
  };
}

/**
 * Create GPU function for solar wind updates
 * @param {GPUDevice} device - WebGPU device
 * @param {GPUComputePipeline} pipeline - Compute pipeline
 * @returns {Function} Update function
 */
function createSolarWindGPUFunction(device, pipeline) {
  const bindGroupLayout = pipeline.getBindGroupLayout(0);
  // Cache buffers per solar wind system to avoid recreation
  const bufferCache = new WeakMap();

  return function updateSolarWindGPU(solarWind, deltaTime = 0.016) {
    if (!solarWind || !solarWind.userData.velocities) {
      return;
    }

    const positions = solarWind.geometry.attributes.position;
    const velocities = solarWind.userData.velocities;
    const lifetimes = solarWind.userData.lifetimes;

    if (!positions || !velocities || !lifetimes) {
      return;
    }

    const particleCount = positions.count;
    if (particleCount === 0) {
      return;
    }

    const movementFactor = 60;
    const maxDistanceSq = 50 * 50;
    const sunRadius = 3.5;

    // Get or create cached buffers for this solar wind system
    let buffers = bufferCache.get(solarWind);
    const positionsSize = positions.array.byteLength;
    const lifetimesSize = lifetimes.byteLength;
    const needsNewBuffers = !buffers || buffers.positionsSize !== positionsSize;

    if (needsNewBuffers) {
      // Create persistent GPU buffers (reused across frames)
      buffers = {
        positionsSize: positionsSize,
        lifetimesSize: lifetimesSize,
        positionsBuffer: device.createBuffer({
          size: positionsSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        }),
        velocitiesBuffer: device.createBuffer({
          size: velocities.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        lifetimesBuffer: device.createBuffer({
          size: lifetimesSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        }),
        uniformBuffer: device.createBuffer({
          size: 20,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        }),
        readbackPositionsBuffer: device.createBuffer({
          size: positionsSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        }),
        readbackLifetimesBuffer: device.createBuffer({
          size: lifetimesSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        }),
        bindGroup: null, // Will be created below
        readbackPending: false, // Track if readback is in progress
      };
      bufferCache.set(solarWind, buffers);
    }

    // Skip if readback is already pending (prevents "Buffer mapping is already pending" errors)
    if (buffers.readbackPending) {
      return;
    }

    // Update uniform buffer
    const uniformData = new Float32Array([
      deltaTime,
      movementFactor,
      maxDistanceSq,
      sunRadius,
      particleCount,
    ]);
    device.queue.writeBuffer(buffers.uniformBuffer, 0, uniformData);

    // Upload input data (velocities are static, positions and lifetimes change)
    if (needsNewBuffers || !solarWind.userData.gpuBuffersInitialized) {
      device.queue.writeBuffer(buffers.velocitiesBuffer, 0, velocities);
      solarWind.userData.gpuBuffersInitialized = true;
    }
    // Always upload current positions and lifetimes (they change every frame)
    device.queue.writeBuffer(buffers.positionsBuffer, 0, positions.array);
    device.queue.writeBuffer(buffers.lifetimesBuffer, 0, lifetimes);

    // Create or reuse bind group
    if (!buffers.bindGroup || needsNewBuffers) {
      buffers.bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: buffers.positionsBuffer } },
          { binding: 1, resource: { buffer: buffers.velocitiesBuffer } },
          { binding: 2, resource: { buffer: buffers.lifetimesBuffer } },
          { binding: 3, resource: { buffer: buffers.uniformBuffer } },
        ],
      });
    }

    // Dispatch compute shader
    const workgroupCount = Math.ceil(particleCount / 64);
    const commandEncoder = device.createCommandEncoder();
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, buffers.bindGroup);
    computePass.dispatchWorkgroups(workgroupCount);
    computePass.end();

    // Copy results back to CPU (asynchronous but non-blocking)
    commandEncoder.copyBufferToBuffer(buffers.positionsBuffer, 0, buffers.readbackPositionsBuffer, 0, positionsSize);
    commandEncoder.copyBufferToBuffer(buffers.lifetimesBuffer, 0, buffers.readbackLifetimesBuffer, 0, lifetimesSize);
    device.queue.submit([commandEncoder.finish()]);

    // Read results asynchronously (non-blocking)
    buffers.readbackPending = true;
    Promise.all([
      buffers.readbackPositionsBuffer.mapAsync(GPUMapMode.READ),
      buffers.readbackLifetimesBuffer.mapAsync(GPUMapMode.READ),
    ]).then(() => {
      // Copy position results
      const positionsMapped = buffers.readbackPositionsBuffer.getMappedRange();
      const positionsData = new Float32Array(positionsMapped);
      for (let i = 0; i < positions.array.length; i++) {
        positions.array[i] = positionsData[i];
      }
      positions.needsUpdate = true;
      buffers.readbackPositionsBuffer.unmap();

      // Copy lifetime results
      const lifetimesMapped = buffers.readbackLifetimesBuffer.getMappedRange();
      const lifetimesData = new Float32Array(lifetimesMapped);
      for (let i = 0; i < lifetimes.length; i++) {
        lifetimes[i] = lifetimesData[i];
      }
      buffers.readbackLifetimesBuffer.unmap();
      buffers.readbackPending = false; // Mark readback as complete
    }).catch(error => {
      buffers.readbackPending = false; // Reset flag on error
      // Suppress repeated errors to avoid console spam
      // Only log if this is a new error (not the "already pending" error)
      if (isDevelopmentEnv() && !error.message?.includes('already pending')) {
        console.warn('[GPU Compute] Solar wind readback failed:', error);
      }
    });
  };
}

/**
 * Initialize WebGL 2.0 transform feedback system
 * @param {Object} THREE - Three.js library
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @returns {Promise<Object>} WebGL2 transform feedback system
 */
async function initWebGL2TransformFeedback(THREE, renderer) {
  // WebGL 2.0 transform feedback can be used for GPU-accelerated particle updates
  // However, this requires custom shader implementation
  // For now, we'll prepare the infrastructure but use CPU fallback
  // This can be extended with custom shaders if needed

  const gl = renderer.getContext();
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
    throw new Error('WebGL2 transform feedback not fully supported');
  }

  return {
    type: 'webgl2',
    available: true,
    gl: gl,
    // Transform feedback functions will be implemented if needed
    updateStarTwinkling: null, // Placeholder for future GPU implementation
    updateSolarWind: null, // Placeholder for future GPU implementation
  };
}

/**
 * Check if development environment
 * @returns {boolean}
 */
function isDevelopmentEnv() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV === true || import.meta.env.MODE === 'development';
  }
  return false;
}

