# Hero Sections Documentation

Complete documentation of animations and backgrounds for each hero section across all pages.

**Last Updated:** 2025-01-30

---

## Overview

This document catalogs all visual effects, animations, and backgrounds used in hero sections across the site. Each hero section may include:
- Three.js 3D animations (desktop only)
- Liquid motion backgrounds
- Particle effects
- Text reveal animations
- Scroll indicators (present on all pages)

---

## 1. Index Page (`index.html`)

**Hero Section Location:** Lines 894-927

### Backgrounds & Effects:
1. **Three.js Canvas** (`#threejs-hero-canvas`)
   - **Type:** Rotating particles
   - **Animation:** 1000 cyan particles (0x00ffff) rotating on X and Y axes
   - **Speed:** `rotation.x += 0.001`, `rotation.y += 0.001` per frame
   - **Opacity:** 0.6
   - **Mobile:** Disabled (hidden on mobile devices)
   - **Pause/Resume:** Pauses after 10s inactivity, resumes on user interaction

2. **Ripple Wave** (`.hero-background::before`)
   - **Animation:** `ripple-wave` - 8s infinite
   - **Effect:** Radial gradient with cyan glow, rotating and scaling
   - **Mobile:** Disabled for performance

### Text Animations:
- **Title:** Text reveal animation with staggered delays (0s, 0.2s, 0.4s, 0.6s)
- **Subtitle:** Fade-in with 0.8s delay
- **Buttons:** Fade-in with 1s delay

### Scroll Indicator:
- **Type:** Mouse scroll indicator with bouncing animation
- **Animation:** `bounce` - 2s infinite vertical bounce
- **Wheel Animation:** `scroll` - 2s infinite vertical scroll effect

---

## 2. About Page (`about.html`)

**Hero Section Location:** Lines 789-812

### Backgrounds & Effects:
1. **Liquid Motion Background** (`.liquid-background`)
   - **Blob 1** (`liquid-background__blob--one`):
     - Position: top-left (-15%, -10%)
     - Size: 65% width/height
     - Colors: Cyan + magenta radial gradients
     - Animation: `liquidDriftOne` - 26s infinite
     - Effect: Blurred (90px), opacity 0.45, mix-blend-mode: screen
   
   - **Blob 2** (`liquid-background__blob--two`):
     - Position: bottom-right (-20%, -5%)
     - Size: 65% width/height
     - Colors: Magenta + blue radial gradients
     - Animation: `liquidDriftTwo` - 32s infinite
     - Effect: Blurred (90px), opacity 0.45, mix-blend-mode: screen
   
   - **Blob 3** (`liquid-background__blob--three`):
     - Position: top-right (20%, 35%)
     - Size: 55% width/height
     - Colors: Green + cyan radial gradients
     - Animation: `liquidDriftThree` - 30s infinite
     - Effect: Blurred (90px), opacity 0.45, mix-blend-mode: screen

### Text Animations:
- **Title:** Text reveal animation with staggered delays (0s, 0.2s)
- **Subtitle:** Fade-in with 0.4s delay

### Scroll Indicator:
- **Type:** Mouse scroll indicator with bouncing animation
- **Animation:** `bounce` - 2s infinite vertical bounce
- **Wheel Animation:** `scroll` - 2s infinite vertical scroll effect

---

## 3. Services Page (`services.html`)

**Hero Section Location:** Lines 888-907

### Backgrounds & Effects:
1. **Three.js Canvas** (`#threejs-services-canvas`)
   - **Type:** Particle Swarm (Boids/Flocking Algorithm)
   - **Particle Count:** 1200 particles
   - **Algorithm:** Classic boids with separation, alignment, and cohesion rules
   - **Features:**
     - **Flocking Behavior:** Organic bird-like flocking patterns
     - **Mouse Interaction:** Particles react to mouse movement, forming temporary clusters
     - **Spatial Grid Optimization:** O(1) neighbor lookup for performance
     - **Color Gradients:** Smooth color transitions based on velocity and neighbor density
       - Cyan (low speed) → Magenta (high speed) → Green (high density)
       - HSL color space with dynamic hue/saturation/lightness
   - **Boids Rules:**
     - **Separation:** Avoid crowding neighbors (distance: 2.0 units, weight: 1.5)
     - **Alignment:** Steer towards average heading of neighbors (distance: 4.0 units, weight: 1.0)
     - **Cohesion:** Steer towards average position of neighbors (distance: 6.0 units, weight: 1.0)
     - **Mouse Interaction:** Repulsion from mouse cursor (distance: 8.0 units, weight: 2.0)
   - **Performance:**
     - Spatial grid (20x20x20 cells) for efficient neighbor detection
     - Max speed: 0.15 units/frame
     - Max force: 0.02 units/frame
     - Boundary wrapping for continuous movement
   - **Material:** PointsMaterial with vertex colors, additive blending for glow effect
   - **Particle Size:** 0.05 units
   - **Opacity:** 0.8
   - **Mobile:** Disabled (hidden on mobile devices)
   - **Pause/Resume:** Pauses after 10s inactivity, resumes on user interaction

### Text Animations:
- **Title:** Text reveal animation with staggered delays (0s, 0.2s)
- **Subtitle:** Fade-in with 0.4s delay

### Scroll Indicator:
- **Type:** Mouse scroll indicator with bouncing animation
- **Animation:** `bounce` - 2s infinite vertical bounce
- **Wheel Animation:** `scroll` - 2s infinite vertical scroll effect

---

## 4. Projects Page (`projects.html`)

**Hero Section Location:** Lines 789-808

### Backgrounds & Effects:
1. **Three.js Canvas** (`#threejs-projects-canvas`)
   - **Type:** Torus grid with scroll parallax
   - **Grid:** 4x4 grid (16 toruses total)
   - **Spacing:** 2.5 units between toruses
   - **Color:** Cyan wireframe (0x00ffff)
   - **Animation:**
     - Rotation: `rotation.x += 0.002`, `rotation.y += 0.002` per frame
     - Z-position: `position.z = initialZ + Math.sin(time + phase) * 0.3` (time-based)
     - Camera parallax: `camera.position.y = initialCameraY + smoothScrollY * 0.0005`
     - Camera rotation: `camera.rotation.z = smoothScrollY * 0.0001`
   - **Opacity:** 0.4
   - **Scroll Tracking:** Smooth scroll interpolation with 0.1 lerp factor
   - **Mobile:** Disabled (hidden on mobile devices)
   - **Pause/Resume:** Pauses after 10s inactivity, resumes on user interaction

### Text Animations:
- **Title:** Text reveal animation with staggered delays (0s, 0.2s)
- **Subtitle:** Fade-in with 0.4s delay

### Scroll Indicator:
- **Type:** Mouse scroll indicator with bouncing animation
- **Animation:** `bounce` - 2s infinite vertical bounce
- **Wheel Animation:** `scroll` - 2s infinite vertical scroll effect

---

## 5. Pricing Page (`pricing.html`)

**Hero Section Location:** Lines 862-881

### Backgrounds & Effects:
### Backgrounds & Effects:
None (text-only hero section)

### Text Animations:
- **Title:** Text reveal animation with staggered delays (0s, 0.2s)
- **Subtitle:** Fade-in with 0.4s delay

### Scroll Indicator:
- **Type:** Mouse scroll indicator with bouncing animation
- **Animation:** `bounce` - 2s infinite vertical bounce
- **Wheel Animation:** `scroll` - 2s infinite vertical scroll effect

### Notes:
- **Height:** Reduced to 60vh (other pages use 100vh)

---

## 6. SEO Services Page (`seo-services.html`)

**Hero Section Location:** Lines 874-908

### Backgrounds & Effects:
1. **Three.js Canvas** (`#threejs-seo-canvas`)
   - **Type:** Floating geometric shapes (IcosahedronGeometry)
   - **Count:** 15 wireframe shapes
   - **Colors:** Cyan (0x00ffff), Magenta (0xff00ff), Green (0x00ff00), Blue (0x0066ff)
   - **Animation:** 
     - Rotation: `rotation.x += 0.005`, `rotation.y += 0.005` per frame
     - Vertical float: `position.y = initialY + Math.sin(time + phase) * 0.5` (sine wave floating)
   - **Opacity:** 0.3
   - **Size:** Random 0.2-0.7 radius
   - **Mobile:** Disabled (hidden on mobile devices)
   - **Pause/Resume:** Pauses after 10s inactivity, resumes on user interaction

### Text Animations:
- **Title:** Text reveal animation with staggered delays (0s, 0.2s)
- **Subtitle:** Fade-in with 0.4s delay
- **Buttons:** Fade-in with 0.6s delay

### Scroll Indicator:
- **Type:** Mouse scroll indicator with bouncing animation
- **Animation:** `bounce` - 2s infinite vertical bounce
- **Wheel Animation:** `scroll` - 2s infinite vertical scroll effect

---

## 7. Contact Page (`contact.html`)

**Hero Section Location:** Lines 913-933

### Backgrounds & Effects:
1. **Particles Contact** (`.particles-contact`)
   - **Type:** CSS-based particle effects (not Three.js)
   - **Effect 1** (`::before`):
     - **Type:** Repeating linear gradient "rain" effect
     - **Colors:** Blue glow (var(--glow-blue))
     - **Animation:** `particlesContactRain` - 18s linear infinite
     - **Effect:** Vertical scrolling gradient lines
     - **Opacity:** 0.5, mix-blend-mode: screen
   
   - **Effect 2** (`::after`):
     - **Type:** Radial gradient glow
     - **Colors:** Cyan, magenta, and blue radial gradients
     - **Animation:** `particlesContactGlow` - 22s ease-in-out infinite
     - **Effect:** Blurred (45px), drifting and scaling
     - **Opacity:** 0.35

### Text Animations:
- **Title:** Text reveal animation with staggered delays (0s, 0.2s)
- **Subtitle:** Fade-in with 0.4s delay
- **Button:** Fade-in with 0.6s delay

### Scroll Indicator:
- **Type:** Mouse scroll indicator with bouncing animation
- **Animation:** `bounce` - 2s infinite vertical bounce
- **Wheel Animation:** `scroll` - 2s infinite vertical scroll effect

---

## Animation Details

### Three.js Animations

All Three.js animations:
- **Pause on inactivity:** After 10 seconds of no user interaction
- **Resume triggers:** Mouse move, keydown, scroll, touchstart
- **Visibility handling:** Pause when page is hidden, resume when visible
- **Mobile:** Completely disabled on mobile devices (canvas hidden)

### CSS Animations

#### Liquid Drift Animations
- **liquidDriftOne:** 26s, translate + scale
- **liquidDriftTwo:** 32s, translate + scale
- **liquidDriftThree:** 30s, translate + scale

#### Text Reveal (`textReveal`)
- **Duration:** 1s
- **Timing:** ease
- **Effect:** Opacity 0→1, translateY(20px)→translateY(0)
- **Delays:** 0s, 0.2s, 0.4s, 0.6s

#### Fade In (`fadeIn`)
- **Duration:** 1s
- **Timing:** ease
- **Effect:** Opacity 0→1
- **Delays:** 0.8s, 1s

#### Scroll Indicator
- **Bounce:** 2s infinite vertical bounce
- **Scroll:** 2s infinite vertical scroll (wheel animation)

#### Ripple Wave (`ripple-wave`)
- **Duration:** 8s
- **Timing:** ease-in-out
- **Iteration:** infinite
- **Effect:** Scale (1-1.2), rotation (0-180deg), opacity (0.3-0.1)
- **Mobile:** Disabled

#### Particles Contact
- **Rain:** 18s linear infinite vertical scrolling
- **Glow:** 22s ease-in-out infinite drift and scale

---

## Performance Considerations

1. **Three.js Animations:**
   - Disabled on mobile devices
   - Pause after 10s inactivity for Lighthouse CPU idle detection
   - Pixel ratio limited to 2 for better performance

2. **CSS Animations:**
   - Ripple wave disabled on mobile
   - Respects `prefers-reduced-motion` media query
   - Uses `transform` and `opacity` for GPU acceleration where possible

---

## Summary Table

| Page | Three.js | Liquid Background | Particles | Scroll Indicator |
|------|----------|------------------|-----------|-----------------|
| **index.html** | ✅ Particles | ❌ | ❌ | ✅ |
| **about.html** | ❌ | ✅ (3 blobs) | ❌ | ✅ |
| **services.html** | ✅ Particle Swarm (Boids) | ❌ | ❌ | ✅ |
| **projects.html** | ✅ Torus Grid | ❌ | ❌ | ✅ |
| **pricing.html** | ❌ | ❌ | ❌ | ✅ |
| **seo-services.html** | ✅ Geometric | ❌ | ❌ | ✅ |
| **contact.html** | ❌ | ❌ | ✅ (CSS) | ✅ |

**Legend:**
- ✅ = Present
- ❌ = Not present
- Numbers in parentheses = Count of elements

---

## Notes

1. **Three.js Canvas IDs:**
   - `threejs-hero-canvas` - Used on index.html
   - `threejs-services-canvas` - Used on services.html and seo-services.html
   - `threejs-projects-canvas` - Used on projects.html

3. **Mobile Optimization:** All Three.js animations are disabled on mobile devices. The canvas elements are hidden via CSS (`display: none`, `visibility: hidden`).

4. **Accessibility:** All animations respect `prefers-reduced-motion` media query where applicable.

---

**Document Maintained By:** Development Team  
**For Questions:** Refer to `.cursor/rules/cursorrules.mdc` for project structure and conventions

