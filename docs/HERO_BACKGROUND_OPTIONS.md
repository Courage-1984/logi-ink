# Hero Background Options Documentation

Complete reference guide for Three.js, Particle Systems, and Liquid/Blob backgrounds that can be used as hero section backgrounds.

**Last Updated:** 2025-01-30

---

## Table of Contents

1. [Three.js Background Options](#threejs-background-options)
2. [Particle System Options](#particle-system-options)
3. [Liquid/Blob Background Options](#liquidblob-background-options)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Performance Considerations](#performance-considerations)

---

## Three.js Background Options

Three.js is already integrated in the project via dynamic loading (`js/utils/three-loader.js`). The following patterns can be implemented following the existing architecture in `js/core/three-hero.js`.

### 1. Particle Systems

#### 1.1 Rotating Particles (Currently Used on index.html)
**Status:** ✅ Implemented  
**File:** `js/core/three-hero.js` → `initThreeJSHero()`

**Features:**
- 1000 particles in 3D space
- Rotating animation around Z-axis
- Color transitions (cyan to magenta)
- Point sprite rendering
- Auto-pause after 10s inactivity
- Mobile-disabled for performance

**Code Pattern:**
```javascript
// Create particles geometry
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);

// Initialize positions
for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 20;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Create material with color transitions
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0x00ffff,
  // Add color transitions via vertex shader
});

const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);
```

**Variations:**
- **Starfield:** Increase particle count (5000-10000), reduce size, add twinkling
- **Nebula:** Use larger particles with glow effects, add color gradients
- **Constellation:** Connect particles with lines, add mouse interaction

---

#### 1.2 Geometric Shapes (Currently Used on services.html)
**Status:** ✅ Implemented  
**File:** `js/core/three-hero.js` → `initThreeJSServices()`

**Features:**
- Floating geometric shapes (tetrahedron, octahedron, icosahedron)
- Smooth rotation and floating animation
- Color transitions (cyan, magenta, green)
- Auto-pause after 10s inactivity

**Code Pattern:**
```javascript
const shapes = [];
const geometries = [
  new THREE.TetrahedronGeometry(0.5),
  new THREE.OctahedronGeometry(0.5),
  new THREE.IcosahedronGeometry(0.5)
];

geometries.forEach((geometry, index) => {
  const material = new THREE.MeshStandardMaterial({
    color: colors[index],
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );
  
  shapes.push(mesh);
  scene.add(mesh);
});
```

**Variations:**
- **Wireframe Grid:** Use `THREE.GridHelper` for grid patterns
- **Floating Cubes:** Use `THREE.BoxGeometry` with varying sizes
- **Morphing Shapes:** Animate between different geometries
- **Glass Shapes:** Use `MeshPhysicalMaterial` with transparency and refraction

---

#### 1.3 Torus Grid (Currently Used on projects.html)
**Status:** ✅ Implemented  
**File:** `js/core/three-hero.js` → `initThreeJSProjects()`

**Features:**
- Grid of torus shapes
- Scroll-based parallax effect
- Smooth camera movement
- Auto-pause after 10s inactivity

**Code Pattern:**
```javascript
const gridSize = 10;
const spacing = 2;

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.1, 8, 16),
      new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      })
    );
    
    torus.position.set(
      (x - gridSize / 2) * spacing,
      (y - gridSize / 2) * spacing,
      0
    );
    
    scene.add(torus);
  }
}

// Scroll parallax
function updateScroll() {
  const scrollY = window.scrollY;
  camera.position.z = 5 + scrollY * 0.01;
}
```

**Variations:**
- **Wave Grid:** Animate torus positions with sine waves
- **Interactive Grid:** Rotate toruses on mouse move
- **Depth Grid:** Vary torus sizes based on Z-position

---

#### 1.4 Shader-Based Backgrounds

**Status:** ⚠️ Not Implemented (Advanced)  
**Best For:** High-performance, custom visual effects

**Options:**

##### A. Noise-Based Shader Background
```javascript
// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader with noise
const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  
  // Noise function
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    vec2 uv = vUv;
    float n = noise(uv * 10.0 + time);
    vec3 color = mix(
      vec3(0.0, 1.0, 1.0), // cyan
      vec3(1.0, 0.0, 1.0), // magenta
      n
    );
    gl_FragColor = vec4(color, 0.3);
  }
`;

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 0 }
  },
  transparent: true
});
```

##### B. Gradient Shader Background
```javascript
const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    vec3 color1 = vec3(0.0, 1.0, 1.0); // cyan
    vec3 color2 = vec3(1.0, 0.0, 1.0); // magenta
    vec3 color3 = vec3(0.0, 1.0, 0.0); // green
    
    float t = sin(time * 0.5) * 0.5 + 0.5;
    vec3 color = mix(mix(color1, color2, uv.x), color3, uv.y);
    
    gl_FragColor = vec4(color, 0.4);
  }
`;
```

##### C. WebGPU Compute Particles (Advanced)
**Note:** Requires WebGPU support (Chrome 113+, Edge 113+)

```javascript
import * as THREE from 'three/webgpu';
import { Fn, uniform, instancedArray, float, vec2, color, instanceIndex } from 'three/tsl';

const particlesCount = 300000;
const particleArray = instancedArray(particlesCount, 'vec2');
const velocityArray = instancedArray(particlesCount, 'vec2');

const computeShaderFn = Fn(() => {
  const particle = particleArray.element(instanceIndex);
  const velocity = velocityArray.element(instanceIndex);
  const position = particle.add(velocity).toVar();
  
  // Boundary collision
  velocity.x = position.x.abs().greaterThanEqual(1.0)
    .select(velocity.x.negate(), velocity.x);
  velocity.y = position.y.abs().greaterThanEqual(1.0)
    .select(velocity.y.negate(), velocity.y);
  
  particle.assign(position);
});

const computeNode = computeShaderFn().compute(particlesCount);
```

**Performance:** Excellent (GPU-accelerated, handles 300k+ particles)

---

#### 1.5 Procedural Geometry Backgrounds

##### A. Terrain/Heightmap
```javascript
const geometry = new THREE.PlaneGeometry(20, 20, 50, 50);
const positions = geometry.attributes.position.array;

// Modify vertices to create height variation
for (let i = 0; i < positions.length; i += 3) {
  positions[i + 2] = Math.random() * 2; // Z position (height)
}
geometry.attributes.position.needsUpdate = true;

const material = new THREE.MeshStandardMaterial({
  color: 0x00ffff,
  wireframe: true
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

##### B. Procedural Clouds
```javascript
// Use THREE.VolumetricMaterial or custom shader
// Combine multiple spheres with noise for cloud-like appearance
const cloudGroup = new THREE.Group();

for (let i = 0; i < 20; i++) {
  const cloud = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3
    })
  );
  cloud.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );
  cloudGroup.add(cloud);
}
scene.add(cloudGroup);
```

---

#### 1.6 Post-Processing Effects

**Status:** ⚠️ Not Implemented (Requires postprocessing library)

**Options:**
- **Bloom:** Glowing effect on bright objects
- **Depth of Field:** Focus blur based on distance
- **Motion Blur:** Motion-based blur
- **Color Grading:** Color correction and tone mapping

**Implementation:**
```javascript
import { EffectComposer, RenderPass, BloomPass } from 'three/examples/jsm/postprocessing/EffectComposer.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new BloomPass(1.25, 25, 4.0, 256));

// In animate loop
composer.render();
```

**Note:** The easter egg feature (`js/easter-egg/post-processing.js`) already implements post-processing, so this pattern exists in the codebase.

---

## Particle System Options

### 2.1 tsParticles (Recommended)

**Status:** ⚠️ Not Implemented  
**Library:** `tsparticles` (modern replacement for particles.js)  
**Size:** ~50KB minified  
**Performance:** Excellent (WebGL/Canvas)

**Why tsParticles over particles.js:**
- ✅ Actively maintained (particles.js is deprecated)
- ✅ TypeScript support
- ✅ Better performance
- ✅ More features and presets
- ✅ Framework-agnostic (works with vanilla JS)

**Installation:**
```bash
npm install tsparticles
```

**Basic Implementation:**
```javascript
import { tsParticles } from 'tsparticles';

// Initialize particles
tsParticles.load('particles-container', {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: '#00ffff'
    },
    shape: {
      type: 'circle'
    },
    opacity: {
      value: 0.5,
      random: true
    },
    size: {
      value: 3,
      random: true
    },
    move: {
      enable: true,
      speed: 2,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false
    },
    links: {
      enable: true,
      distance: 150,
      color: '#00ffff',
      opacity: 0.4,
      width: 1
    }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: true,
        mode: 'repulse'
      },
      onclick: {
        enable: true,
        mode: 'push'
      }
    }
  },
  retina_detect: true
});
```

**Presets Available:**
- `bubble`, `snow`, `confetti`, `fireworks`, `stars`, `nasa`, `polygon`, `seaAnemone`, `triangles`, `fountain`

**Usage Example:**
```javascript
import { loadFull } from 'tsparticles';
import { loadBubblePreset } from 'tsparticles/presets/bubble';

await loadFull(tsParticles);
await loadBubblePreset(tsParticles);

tsParticles.load('particles-container', {
  preset: 'bubble'
});
```

**Performance Notes:**
- Use `particles.number.value` to control particle count (50-200 for hero sections)
- Enable `retina_detect: true` for high-DPI displays
- Use `particles.move.speed` to control animation speed (lower = better performance)

---

### 2.2 Custom Canvas Particle System

**Status:** ⚠️ Not Implemented  
**Best For:** Lightweight, custom effects, no dependencies

**Implementation Pattern:**
```javascript
class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = options.count || 100;
    
    this.resize();
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  init() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)` // cyan range
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Boundary wrapping
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
    });
    
    // Draw connections
    this.drawConnections();
    
    requestAnimationFrame(() => this.animate());
  }
  
  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(0, 255, 255, ${1 - distance / 150})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }
}

// Usage
const canvas = document.getElementById('particles-canvas');
const particleSystem = new ParticleSystem(canvas, { count: 100 });
```

**Performance Optimization:**
- Use `requestAnimationFrame` (already implemented)
- Limit particle count (50-200 for hero sections)
- Use spatial partitioning for connection drawing (only check nearby particles)
- Use `will-change: transform` in CSS for canvas element

---

### 2.3 WebGL Particle System (Custom)

**Status:** ⚠️ Not Implemented  
**Best For:** Maximum performance, thousands of particles

**Implementation Pattern:**
```javascript
class WebGLParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');
    this.particleCount = 1000;
    
    this.initBuffers();
    this.initShaders();
    this.animate();
  }
  
  initBuffers() {
    // Create position buffer
    const positions = new Float32Array(this.particleCount * 3);
    for (let i = 0; i < this.particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2;     // x
      positions[i + 1] = (Math.random() - 0.5) * 2;  // y
      positions[i + 2] = (Math.random() - 0.5) * 2;  // z
    }
    
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
  }
  
  initShaders() {
    // Vertex shader
    const vertexShaderSource = `
      attribute vec3 a_position;
      uniform mat4 u_matrix;
      uniform float u_pointSize;
      
      void main() {
        gl_Position = u_matrix * vec4(a_position, 1.0);
        gl_PointSize = u_pointSize;
      }
    `;
    
    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec3 u_color;
      
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        gl_FragColor = vec4(u_color, 1.0 - dist * 2.0);
      }
    `;
    
    // Compile shaders and create program
    // ... (shader compilation code)
  }
  
  animate() {
    // Update positions
    // Render particles
    requestAnimationFrame(() => this.animate());
  }
}
```

**Performance:** Excellent (handles 10k+ particles at 60fps)

---

## Liquid/Blob Background Options

### 3.1 CSS Blob Background (Currently Used on about.html)

**Status:** ✅ Implemented  
**File:** `css/components/hero.css` → `.liquid-background`

**Features:**
- Pure CSS (no JavaScript)
- GPU-accelerated transforms
- Radial gradients with color mixing
- Smooth drift animations
- Respects `prefers-reduced-motion`

**Current Implementation:**
```css
.liquid-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}

.liquid-background__blob {
  position: absolute;
  width: 65%;
  height: 65%;
  opacity: 0.45;
  filter: blur(90px);
  mix-blend-mode: screen;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-duration: 26s;
}

.liquid-background__blob--one {
  top: -15%;
  left: -10%;
  background:
    radial-gradient(circle at 30% 30%, var(--accent-cyan) 0%, transparent 65%),
    radial-gradient(circle at 80% 70%, var(--glow-magenta) 0%, transparent 70%);
  animation-name: liquidDriftOne;
}
```

**Variations:**

##### A. More Blobs (4-6 blobs)
```css
.liquid-background__blob--four {
  bottom: 10%;
  left: 20%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle at 50% 50%, var(--accent-blue) 0%, transparent 70%);
  animation-name: liquidDriftFour;
  animation-duration: 28s;
}
```

##### B. Faster Animations
```css
.liquid-background__blob {
  animation-duration: 15s; /* Faster (default: 26s) */
}
```

##### C. Different Blend Modes
```css
.liquid-background__blob {
  mix-blend-mode: multiply; /* or overlay, soft-light, color-dodge */
}
```

##### D. Animated Border Radius (Morphing Blobs)
```css
@keyframes blobMorph {
  0%, 100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
  25% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
  50% {
    border-radius: 50% 50% 30% 70% / 40% 60% 50% 60%;
  }
  75% {
    border-radius: 40% 60% 50% 50% / 60% 40% 60% 40%;
  }
}

.liquid-background__blob {
  animation: blobMorph 20s ease-in-out infinite, liquidDriftOne 26s ease-in-out infinite;
}
```

---

### 3.2 SVG Morphing Blobs

**Status:** ⚠️ Not Implemented  
**Best For:** Smooth morphing shapes, precise control

**Implementation Pattern:**
```html
<svg class="blob-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff00ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path id="blob" d="M50,100 C50,50 100,50 100,100 C100,150 50,150 50,100 Z" 
        fill="url(#blobGradient)" opacity="0.4">
    <animate attributeName="d" 
             values="M50,100 C50,50 100,50 100,100 C100,150 50,150 50,100 Z;
                     M60,90 C40,60 110,60 120,90 C130,120 60,130 60,90 Z;
                     M50,100 C50,50 100,50 100,100 C100,150 50,150 50,100 Z"
             dur="10s" 
             repeatCount="indefinite" />
  </path>
</svg>
```

**JavaScript-Controlled Morphing:**
```javascript
// Using KUTE.js or GSAP for smooth morphing
import { morph } from 'kute.js';

const blob1 = document.getElementById('blob');
const blob2 = document.getElementById('blob2');

morph(blob1, blob2, {
  duration: 2000,
  easing: 'easingCubicInOut',
  repeat: Infinity,
  yoyo: true
});
```

**Performance:** Good (SVG is GPU-accelerated, but complex paths can be expensive)

---

### 3.3 Canvas-Based Liquid Effects

**Status:** ⚠️ Not Implemented  
**Best For:** Realistic liquid physics, interactive effects

**Implementation Pattern:**
```javascript
class LiquidBlob {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.points = [];
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    this.radius = 100;
    this.pointCount = 20;
    
    this.init();
    this.animate();
  }
  
  init() {
    for (let i = 0; i < this.pointCount; i++) {
      const angle = (Math.PI * 2 / this.pointCount) * i;
      this.points.push({
        x: this.centerX + Math.cos(angle) * this.radius,
        y: this.centerY + Math.sin(angle) * this.radius,
        baseAngle: angle,
        offset: Math.random() * 20
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const time = Date.now() * 0.001;
    
    // Update points with wave effect
    this.points.forEach((point, index) => {
      const wave = Math.sin(time * 2 + index * 0.5) * 15;
      const angle = point.baseAngle + wave * 0.01;
      point.x = this.centerX + Math.cos(angle) * (this.radius + wave);
      point.y = this.centerY + Math.sin(angle) * (this.radius + wave);
    });
    
    // Draw blob with gradient
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    
    for (let i = 1; i < this.points.length; i++) {
      const cp1x = (this.points[i - 1].x + this.points[i].x) / 2;
      const cp1y = (this.points[i - 1].y + this.points[i].y) / 2;
      const cp2x = (this.points[i].x + this.points[(i + 1) % this.points.length].x) / 2;
      const cp2y = (this.points[i].y + this.points[(i + 1) % this.points.length].y) / 2;
      
      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, this.points[i].x, this.points[i].y);
    }
    
    this.ctx.closePath();
    
    // Gradient fill
    const gradient = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, this.radius * 2
    );
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 0, 255, 0.2)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.filter = 'blur(40px)';
    this.ctx.fill();
    this.ctx.filter = 'none';
    
    requestAnimationFrame(() => this.animate());
  }
}

// Usage
const canvas = document.getElementById('liquid-canvas');
const blob = new LiquidBlob(canvas);
```

**Performance:** Good (60fps with single blob, degrades with multiple blobs)

---

### 3.4 WebGL Liquid Simulation (Advanced)

**Status:** ⚠️ Not Implemented (Very Advanced)  
**Best For:** Realistic fluid dynamics, multiple interacting blobs

**Note:** This requires WebGL shaders and fluid simulation algorithms. Consider using libraries like:
- **LiquidFun** (Box2D-based, ported to JavaScript)
- **Matter.js** (physics engine with liquid-like behavior)

**Performance:** Excellent (GPU-accelerated) but complex to implement

---

## Implementation Guidelines

### 4.1 Integration with Existing Architecture

**File Structure:**
```
js/
├── core/
│   └── three-hero.js          # Three.js backgrounds (existing)
├── utils/
│   └── three-loader.js        # Dynamic Three.js loader (existing)
└── pages/
    └── [page-name].js         # Page-specific initializations
```

**Pattern to Follow:**
```javascript
// In js/core/three-hero.js or new file (e.g., js/core/particles-hero.js)

import { loadThreeJS } from '../utils/three-loader.js';
import { isMobileDevice } from '../utils/env.js';

let scene = null;
let renderer = null;
let camera = null;
let animationId = null;
let isAnimationPaused = false;
let animateFunction = null;

export async function initParticleHero() {
  const canvas = document.getElementById('particles-hero-canvas');
  if (!canvas) return;
  
  if (isMobileDevice()) {
    return; // Disable on mobile
  }
  
  // Initialize particle system
  // Store animate function
  animateFunction = animate;
  animate();
}

function animate() {
  if (isAnimationPaused) return;
  
  // Animation logic
  animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

export function pauseParticleHero() {
  isAnimationPaused = true;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

export function resumeParticleHero() {
  if (isAnimationPaused && animateFunction) {
    isAnimationPaused = false;
    animateFunction();
  }
}

export function cleanupParticleHero() {
  pauseParticleHero();
  // Cleanup resources
  scene = null;
  renderer = null;
  camera = null;
  animateFunction = null;
}
```

**Initialization in `js/main.js`:**
```javascript
// Check for page-specific hero backgrounds
const pathname = window.location.pathname;

if (pathname === '/' || pathname === '/index.html') {
  // Initialize particle hero
  import('./core/particles-hero.js').then(module => {
    module.initParticleHero();
  });
}
```

---

### 4.2 HTML Structure

**Three.js Canvas:**
```html
<section class="hero">
  <div class="hero-background">
    <canvas id="particles-hero-canvas" class="threejs-canvas"></canvas>
  </div>
  <div class="hero-content">
    <!-- Content -->
  </div>
</section>
```

**Particle System (tsParticles):**
```html
<section class="hero">
  <div class="hero-background">
    <div id="particles-container" class="particles-container"></div>
  </div>
  <div class="hero-content">
    <!-- Content -->
  </div>
</section>
```

**Liquid Blob (CSS):**
```html
<section class="hero">
  <div class="hero-background">
    <div class="liquid-background">
      <div class="liquid-background__blob liquid-background__blob--one"></div>
      <div class="liquid-background__blob liquid-background__blob--two"></div>
      <div class="liquid-background__blob liquid-background__blob--three"></div>
    </div>
  </div>
  <div class="hero-content">
    <!-- Content -->
  </div>
</section>
```

---

### 4.3 CSS Integration

**Add to `css/components/hero.css`:**
```css
/* Particle System Container */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

/* Canvas Particle System */
.particles-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}
```

---

## Performance Considerations

### 5.1 Mobile Optimization

**Always disable heavy animations on mobile:**
```javascript
import { isMobileDevice } from '../utils/env.js';

if (isMobileDevice()) {
  return; // Skip initialization
}
```

**CSS Media Query:**
```css
@media (max-width: 768px) {
  .hero-background::before {
    animation: none !important;
    opacity: 0 !important;
  }
}
```

---

### 5.2 Performance Best Practices

#### Three.js:
- ✅ Limit particle count (500-2000 for hero sections)
- ✅ Use `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` to limit pixel ratio
- ✅ Use `alpha: true` for transparent backgrounds
- ✅ Implement pause/resume on inactivity (already done)
- ✅ Clean up resources on page unload

#### Particle Systems:
- ✅ Limit particle count (50-200 for hero sections)
- ✅ Use `requestAnimationFrame` (not `setInterval`)
- ✅ Disable on mobile devices
- ✅ Use spatial partitioning for connection drawing (if applicable)

#### Liquid/Blob:
- ✅ Use CSS transforms (GPU-accelerated)
- ✅ Limit blur filter intensity (`filter: blur(40-90px)`)
- ✅ Use `will-change` sparingly (only when animating)
- ✅ Respect `prefers-reduced-motion`

---

### 5.3 Loading Strategy

**Lazy Load Heavy Libraries:**
```javascript
// In js/utils/three-loader.js (already implemented)
export async function loadThreeJS() {
  if (window.THREE) {
    return window.THREE;
  }
  
  return new Promise((resolve, reject) => {
    // Load Three.js dynamically
  });
}
```

**Initialize on Idle:**
```javascript
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    initParticleHero();
  });
} else {
  setTimeout(() => {
    initParticleHero();
  }, 100);
}
```

---

### 5.4 Memory Management

**Cleanup on Page Unload:**
```javascript
window.addEventListener('beforeunload', () => {
  cleanupParticleHero();
  // Dispose Three.js resources
  if (renderer) {
    renderer.dispose();
  }
  if (scene) {
    scene.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
  }
});
```

---

## Summary

### Recommended Options by Use Case:

1. **High Performance, Modern Look:** Three.js Particle Systems (already implemented)
2. **Easy Setup, Lots of Presets:** tsParticles
3. **Lightweight, No Dependencies:** Custom Canvas Particle System
4. **Pure CSS, Best Performance:** CSS Blob Background (already implemented)
5. **Smooth Morphing:** SVG Morphing Blobs
6. **Custom Visual Effects:** Three.js Shader Backgrounds
7. **Maximum Particles:** WebGL Particle System or WebGPU Compute

### Current Implementation Status:

- ✅ **Three.js Particles** (index.html)
- ✅ **Three.js Geometric Shapes** (services.html)
- ✅ **Three.js Torus Grid** (projects.html)
- ✅ **CSS Liquid Blobs** (about.html)
- ⚠️ **Particle Systems** (not implemented - tsParticles recommended)
- ⚠️ **Shader Backgrounds** (not implemented - advanced)

---

**Next Steps:**
1. Choose a background type based on design requirements
2. Follow the implementation patterns above
3. Integrate with existing `js/core/three-hero.js` or create new module
4. Add CSS classes to `css/components/hero.css`
5. Initialize in `js/main.js` based on page pathname
6. Test performance on mobile devices
7. Add pause/resume functionality for inactivity

---

**Last Updated:** 2025-01-30

