# Final Recommendation: Three.js Backgrounds Showcase Page

**Date:** 2025-01-30  
**Status:** Approved for Implementation

---

## Chosen Approach

### Architecture Pattern
**Lazy-Initialized, Viewport-Sectioned Showcase with Intersection Observer**

### Key Components
1. **HTML:** Single page (`showcase.html`) with 20 full-viewport sections
2. **CSS:** Viewport-sized sections (100vh), CSS hover tooltips
3. **JavaScript:** 
   - Extended `js/core/three-hero.js` with 20 showcase functions
   - New `js/pages/showcase.js` controller with Intersection Observer
   - Lazy initialization (only visible section active)

---

## Justification & Tradeoffs

### ✅ Advantages
1. **Performance:** Only one Three.js scene active at a time (minimal GPU/memory usage)
2. **User Experience:** Smooth scrolling, instant hover feedback
3. **Maintainability:** Follows existing patterns (`three-hero.js` structure)
4. **Scalability:** Easy to add/remove backgrounds
5. **Accessibility:** CSS-only tooltips (no JS dependency for hover)

### ⚠️ Tradeoffs
1. **Initial Load:** Lazy initialization means slight delay when scrolling to new section
   - **Acceptable:** Better than loading all 20 scenes upfront
2. **Memory:** One renderer per section (20 total)
   - **Mitigated:** Only active section renders, others paused
3. **Code Size:** 20 functions in `three-hero.js` (~2000-3000 lines)
   - **Acceptable:** Modular, well-documented, follows existing patterns

---

## Compatibility Statement

✅ **No Breaking Changes**
- Extends existing `js/core/three-hero.js` (additive changes only)
- Uses existing `js/utils/three-loader.js` (no changes needed)
- Follows existing CSS architecture (`css/pages/` pattern)
- Compatible with existing pause/resume system
- Mobile detection already in place (`isMobileDevice()`)

✅ **Dependencies**
- Three.js r128 (already loaded via CDN)
- No new external dependencies
- Uses existing Intersection Observer API (widely supported)

✅ **Browser Support**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation on mobile (disable Three.js)
- WebGL fallback detection already implemented

---

## Implementation Blueprint

### File Structure
```
showcase.html                    # New showcase page
css/pages/showcase.css          # New CSS module
js/core/three-hero.js           # Extended (20 new functions)
js/pages/showcase.js            # New controller module
js/main.js                      # Updated (add showcase init)
css/main.css                    # Updated (import showcase.css)
```

### Function Signatures

#### `js/core/three-hero.js` (Extended)
```javascript
// 20 new functions (one per background)
async function initThreeJSShowcase1(THREE) { /* Rotating Particles */ }
async function initThreeJSShowcase2(THREE) { /* Particle Swarm */ }
async function initThreeJSShowcase3(THREE) { /* Floating Geometric Shapes */ }
// ... (17 more functions)

// Router function
export async function initThreeJSShowcase(index) {
  const THREE = await loadThreeJS();
  switch(index) {
    case 1: return initThreeJSShowcase1(THREE);
    case 2: return initThreeJSShowcase2(THREE);
    // ... (18 more cases)
  }
}
```

#### `js/pages/showcase.js` (New)
```javascript
export function initShowcase() {
  const sections = document.querySelectorAll('.showcase-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.bg);
        initSection(index);
      } else {
        pauseSection(parseInt(entry.target.dataset.bg));
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => observer.observe(section));
}

function initSection(index) {
  // Lazy initialize Three.js scene if not already initialized
  // Call initThreeJSShowcase(index)
}

function pauseSection(index) {
  // Pause Three.js animation for this section
}
```

### CSS Structure (`css/pages/showcase.css`)
```css
.showcase-section {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.threejs-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.showcase-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  text-align: center;
}

.showcase-title {
  font-size: clamp(2rem, 5vw, 4rem);
  color: var(--text-primary);
  cursor: pointer;
  transition: opacity 0.3s;
}

.showcase-title:hover + .showcase-description,
.showcase-title:focus + .showcase-description {
  opacity: 1;
  visibility: visible;
}

.showcase-description {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: var(--text-secondary);
  margin-top: 1rem;
}
```

---

## Clean Code Example

### Example: Rotating Particles (Showcase #1)
```javascript
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

    // Store in global state for pause/resume
    showcaseScenes[0] = { scene, renderer, camera, animate, isPaused: () => isPaused, setPaused: (p) => { isPaused = p; } };

    animate();
  } catch (error) {
    console.warn('Three.js Showcase #1 failed to initialize:', error);
  }
}
```

---

## Performance Optimization Strategy

1. **Lazy Initialization:** Only initialize Three.js when section enters viewport
2. **Single Active Scene:** Only one section's animation runs at a time
3. **Pause/Resume:** Pause non-visible sections (save GPU cycles)
4. **Mobile Detection:** Disable Three.js on mobile (show static placeholders)
5. **Cleanup:** Properly dispose of Three.js resources when section leaves viewport
6. **Throttling:** Intersection Observer with `threshold: 0.5` (not too frequent)

---

## Testing Strategy

1. **Manual Testing:**
   - Scroll through all 20 sections
   - Verify each background renders correctly
   - Test hover tooltips
   - Test on mobile (graceful degradation)

2. **Performance Testing:**
   - Memory usage (DevTools)
   - GPU usage (Chrome Task Manager)
   - Frame rate (60fps target)

3. **E2E Testing:**
   - Playwright test: Navigate to showcase, scroll, verify backgrounds

---

## Success Criteria

✅ All 20 backgrounds render correctly  
✅ Each section fits viewport (100vh)  
✅ Hover tooltips show name and description  
✅ Only visible section's animation runs  
✅ Mobile devices show graceful fallback  
✅ Page loads in < 3 seconds (initial)  
✅ Smooth scrolling between sections  
✅ No memory leaks (proper cleanup)  
✅ Accessibility: keyboard navigation works  

---

**Next Step:** Proceed with Phase 2 Implementation

