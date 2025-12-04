# Background Effects & Hero Banners Report

**Generated:** 2025-12-04  
**Last Updated:** 2025-12-04 (CSS particles removed from hero sections)  
**Project:** logi-ink v2.1.0  
**Description:** Comprehensive analysis of all background effects, hero banners, and visual enhancements across the site

> **Note:** As of 2025-12-04, the CSS `.particles` class has been removed from all hero sections. Only Three.js particles remain on index.html. Contact page retains separate `.particles-contact` class (unaffected).

---

## 📊 Executive Summary

This report documents all background effects, hero banners, and visual enhancements used throughout the Logi-Ink website. The site uses a variety of background types including:

- **Hero Banners:** 8 different hero sections with various effects
- **Parallax Backgrounds:** 3 parallax sections with fixed-attachment scrolling
- **Video Backgrounds:** 2 video background implementations
- **CTA Section Backgrounds:** Responsive image backgrounds
- **Project Modal Backgrounds:** Video and image backgrounds for project showcases
- **Particle Effects:** Animated particle systems for contact page

**Total Background Types:** 6 main categories  
**Total Implementations:** 20+ individual background instances

---

## 🎨 Background Types by Category

### 1. Hero Banners

Hero banners are the main visual element at the top of each page. Each hero section uses different background effects optimized for performance and visual impact.

#### 1.1 Index Page Hero (`index.html`)
**Location:** `index.html` - Main homepage hero  
**Type:** Three.js Animated Particles  
**Implementation:** `js/core/three-hero.js` → `initThreeJSHero()`

**Features:**
- 1000 rotating particles in 3D space
- Cyan-colored particles (`#00ffff`)
- Smooth rotation animation (x and y axis)
- Canvas-based rendering with WebGL
- **Mobile:** Disabled for performance

**CSS Classes:**
- `.hero`
- `.hero-background`
- `.threejs-canvas` (hidden until loaded)

**Effects Applied:**
- Ripple wave animation (`.hero-background::before`)
  - Radial gradient animation
  - 8s infinite loop
  - Disabled on mobile
- Video overlay gradient (`.hero-video-overlay`)
  - Dark gradient for text readability

**Note:** CSS particles effect (`.particles`) has been removed from all hero sections as of 2025-12-04

**Assets:**
- Three.js library (dynamically loaded)
- No static images or videos

**Performance:**
- Lazy loaded via `requestIdleCallback`
- Disabled on mobile devices
- Canvas hidden until ready (opacity transition)

---

#### 1.2 Services Page Hero (`services.html`)
**Location:** `services.html` - Services page hero  
**Type:** Three.js Floating Geometric Shapes  
**Implementation:** `js/core/three-hero.js` → `initThreeJSServices()`

**Features:**
- 15 floating icosahedron shapes
- Wireframe rendering
- Multiple colors: cyan, magenta, green, blue
- Floating animation with sine wave movement
- **Mobile:** Disabled for performance

**CSS Classes:**
- `.hero`
- `.hero-background`
- `.threejs-canvas` (with ID: `threejs-services-canvas`)

**Effects Applied:**
- Same ripple wave animation as index
- Same video overlay gradient

**Note:** CSS particles effect removed as of 2025-12-04

**Assets:**
- Three.js library (dynamically loaded)
- No static images or videos

**Performance:**
- Lazy loaded via `requestIdleCallback`
- Disabled on mobile devices

---

#### 1.3 Projects Page Hero (`projects.html`)
**Location:** `projects.html` - Projects page hero  
**Type:** Three.js Torus Grid with Scroll Parallax  
**Implementation:** `js/core/three-hero.js` → `initThreeJSProjects()`

**Features:**
- Torus grid geometry
- Scroll-based parallax effect
- Camera movement on scroll
- **Mobile:** Disabled for performance

**CSS Classes:**
- `.hero`
- `.hero-background`
- `.threejs-canvas` (with ID: `threejs-projects-canvas`)

**Effects Applied:**
- Same ripple wave animation
- Same video overlay gradient
- Scroll parallax (via `js/core/scroll.js`)

**Note:** CSS particles effect removed as of 2025-12-04

**Assets:**
- Three.js library (dynamically loaded)
- No static images or videos

**Performance:**
- Lazy loaded via `requestIdleCallback`
- Disabled on mobile devices

---

#### 1.4 About Page Hero (`about.html`)
**Location:** `about.html` - About page hero  
**Type:** Liquid Motion Background (CSS Blobs)  
**Implementation:** Pure CSS animations

**Features:**
- 3 animated liquid blobs
- Radial gradients with color mixing
- Smooth drift animations (26s, 32s, 30s durations)
- Mix-blend-mode: screen for color blending

**CSS Classes:**
- `.hero`
- `.hero-background`
- `.liquid-background`
- `.liquid-background__blob` (3 variants: `--one`, `--two`, `--three`)

**Blob Details:**
1. **Blob One:**
   - Position: Top-left (-15%, -10%)
   - Colors: Cyan + Magenta glow
   - Animation: `liquidDriftOne` (26s)
   - Size: 65% width/height

2. **Blob Two:**
   - Position: Bottom-right (-20%, -5%)
   - Colors: Magenta + Blue glow
   - Animation: `liquidDriftTwo` (32s)
   - Size: 65% width/height

3. **Blob Three:**
   - Position: Center-right (20%, 35%)
   - Colors: Green + Cyan glow
   - Animation: `liquidDriftThree` (30s)
   - Size: 55% width/height

**Effects Applied:**
- Same ripple wave animation
- Same video overlay gradient

**Note:** CSS particles effect removed as of 2025-12-04

**Assets:**
- No external assets (pure CSS)

**Performance:**
- GPU-accelerated transforms
- Respects `prefers-reduced-motion`
- No JavaScript required

---

#### 1.5 Contact Page Hero (`contact.html`)
**Location:** `contact.html` - Contact page hero  
**Type:** Static Background with Particles  
**Implementation:** CSS + JavaScript particles

**Features:**
- Static dark background
- Animated particle effects (contact-specific)
- Particle rain animation
- Glowing particle effects

**CSS Classes:**
- `.hero`
- `.hero-background`
- `.particles-contact` (contact-specific particles)

**Effects Applied:**
- Contact page particles (`.particles-contact`)
  - Repeating linear gradient rain effect
  - Radial gradient glow effects
  - 18s and 22s animations
- Same ripple wave animation

**Note:** CSS particles effect (`.particles`) removed from hero sections as of 2025-12-04. Contact page retains separate `.particles-contact` class.

**Assets:**
- No external assets (pure CSS)

**Performance:**
- CSS-only animations
- Optimized for mobile

---

#### 1.6 Pricing Page Hero (`pricing.html`)
**Location:** `pricing.html` - Pricing page hero  
**Type:** Static Background  
**Implementation:** Default hero styles

**Features:**
- Standard hero background
- No special effects
- Reduced height (60vh instead of 100vh)

**CSS Classes:**
- `.hero`
- `.hero-background`

**Effects Applied:**
- Same ripple wave animation
- Same video overlay gradient

**Note:** CSS particles effect removed as of 2025-12-04

**Assets:**
- No external assets

**Performance:**
- Lightweight (no Three.js or complex animations)

---

#### 1.7 SEO Services Page Hero (`seo-services.html`)
**Location:** `seo-services.html` - SEO services page hero  
**Type:** Three.js Geometric Shapes (Same as Services)  
**Implementation:** `js/core/three-hero.js` → `initThreeJSServices()`

**Features:**
- Same as Services page hero
- 15 floating icosahedron shapes
- Wireframe rendering

**CSS Classes:**
- `.hero`
- `.hero-background`
- `.threejs-canvas`

**Effects Applied:**
- Same as Services page

**Assets:**
- Three.js library (dynamically loaded)

---

#### 1.8 Reports Page Hero (`reports.html`)
**Location:** `reports.html` - Reports dashboard hero  
**Type:** Custom Static Background  
**Implementation:** Custom CSS class

**Features:**
- Custom background class: `.reports-hero__background`
- Static background
- Meta information display

**CSS Classes:**
- `.hero.reports-hero`
- `.reports-hero__background`
- `.hero-content`

**Effects Applied:**
- Minimal effects (dashboard-focused)

**Assets:**
- No external assets

---

### 2. Parallax Backgrounds

Parallax backgrounds use fixed-attachment scrolling to create depth. All parallax sections use responsive images (AVIF/WebP) with lazy loading.

#### 2.1 Mission Parallax Section
**Location:** `about.html` - Mission section  
**CSS Class:** `.mission-parallax`  
**Background Image:** `mission-parallax-bg.webp`

**Responsive Variants:**
- 1280w: `mission-parallax-bg-1280w.avif/webp`
- 1024w: `mission-parallax-bg-1024w.avif/webp`
- 768w: `mission-parallax-bg-768w.avif/webp`
- 480w: `mission-parallax-bg-480w.avif/webp`

**Features:**
- Fixed attachment scrolling
- Dark overlay for text readability
- Responsive image loading

**CSS Classes:**
- `.parallax-section.mission-parallax`
- `.parallax-background`
- `.parallax-overlay`

**Assets:**
- `assets/images/backgrounds/mission-parallax-bg.webp`
- `assets/images/responsive/backgrounds/mission-parallax-bg-*.avif/webp`

**Performance:**
- Lazy loaded via `lazy-background-images.js`
- Fixed attachment disabled on mobile (scroll instead)

---

#### 2.2 Process Parallax Section
**Location:** `services.html` - Process section  
**CSS Class:** `.process-parallax`  
**Background Image:** `process-parallax-bg.webp`

**Responsive Variants:**
- 1280w: `process-parallax-bg-1280w.avif/webp`
- 1024w: `process-parallax-bg-1024w.avif/webp`
- 768w: `process-parallax-bg-768w.avif/webp`
- 480w: `process-parallax-bg-480w.avif/webp`

**Features:**
- Same as Mission Parallax
- Fixed attachment scrolling
- Dark overlay

**CSS Classes:**
- `.parallax-section.process-parallax`
- `.parallax-background`
- `.parallax-overlay`

**Assets:**
- `assets/images/backgrounds/process-parallax-bg.webp`
- `assets/images/responsive/backgrounds/process-parallax-bg-*.avif/webp`

---

#### 2.3 Testimonials Parallax Section
**Location:** `projects.html`, `services.html` - Testimonials sections  
**CSS Class:** `.testimonials-parallax`  
**Background Image:** `testimonials-parallax-bg.webp`

**Responsive Variants:**
- 1280w: `testimonials-parallax-bg-1280w.avif/webp`
- 1024w: `testimonials-parallax-bg-1024w.avif/webp`
- 768w: `testimonials-parallax-bg-768w.avif/webp`
- 480w: `testimonials-parallax-bg-480w.avif/webp`

**Features:**
- Same as other parallax sections
- Used in multiple locations

**CSS Classes:**
- `.parallax-section.testimonials-parallax`
- `.parallax-background`
- `.parallax-overlay` (sometimes `.parallax-overlay--neutral`)

**Assets:**
- `assets/images/backgrounds/testimonials-parallax-bg.webp`
- `assets/images/responsive/backgrounds/testimonials-parallax-bg-*.avif/webp`

---

### 3. Video Backgrounds

Video backgrounds provide dynamic, looping video content. All videos are optimized with multiple quality variants and lazy loading.

#### 3.1 Ripples Video Background
**Location:** `index.html`, `contact.html` - Section video backgrounds  
**Type:** Water Ripples Loop  
**Implementation:** `js/utils/ripples-lazyload.js`

**Video Files:**
- High Quality: `ripples-hq.mp4` (≥1200px width)
- Medium Quality: `ripples-mq.mp4` (≥768px width)
- Low Quality: `ripples-lq.mp4` (<768px or slow connection)
- WebM: `ripples-webm.webm` (VP9 codec, ≥769px)
- Poster: `ripples-poster.jpg`

**Features:**
- Adaptive quality selection based on viewport and connection
- Lazy loading via Intersection Observer
- Autoplay, muted, loop
- Poster image fallback

**CSS Classes:**
- `.section-video-background`
- `.background-video-container`
- `.background-video`

**Assets:**
- `assets/video/optimized/ripples-*.mp4`
- `assets/video/optimized/ripples-webm.webm`
- `assets/video/optimized/ripples-poster.jpg`

**Performance:**
- Lazy loaded when section enters viewport
- Connection-aware quality selection
- Poster image preloads for instant display

---

#### 3.2 Project Modal Video Backgrounds
**Location:** `projects.html` - Project detail modals  
**Type:** Project-Specific Video Loops  
**Implementation:** `js/pages/projects.js`

**Projects with Videos:**
1. **E-commerce Platform**
   - Video: `video-e-commerce-platform-*.mp4`
   - Background: `background-e-commerce-platform.png`
   - Poster: `video-e-commerce-platform-poster.jpg`

2. **Fintech Mobile App**
   - Video: `video-fintech-mobile-app-*.mp4`
   - Background: `background-fintech-mobile-app.png`
   - Poster: `video-fintech-mobile-app-poster.jpg`

3. **Tech Startup Rebrand**
   - Video: `video-tech-startup-rebrand-*.mp4`
   - Background: `background-tech-startup-rebrand.png`
   - Poster: `video-tech-startup-rebrand-poster.jpg`

4. **Corporate Website**
   - Video: `video-corporate-website-*.mp4`
   - Background: `background-corporate-website.png`
   - Poster: `video-corporate-website-poster.jpg`

5. **Fitness Tracking App**
   - Video: `video-fitness-tracking-app-*.mp4`
   - Background: `background-fitness-tracking-app.png`
   - Poster: `video-fitness-tracking-app-poster.jpg`

6. **Marketing Campaign**
   - Video: `video-marketing-campaign-*.mp4`
   - Background: `background-marketing-campaign.png`
   - Poster: `video-marketing-campaign-poster.jpg`

**Features:**
- Toggle between image and video views
- Background image behind video for seamless transition
- Video starts at frame 0 to match image
- Hover videos on project cards

**CSS Classes:**
- `.project-modal__video-background`
- `.project-modal__media.has-video`
- `.project-modal__media.show-video`
- `.project-hover-video` (card hover videos)

**Assets:**
- `assets/video/optimized/video-*-hq/mq/lq.mp4`
- `assets/video/optimized/video-*-webm.webm`
- `assets/video/optimized/video-*-poster.jpg`
- `assets/images/portfolio/backgrounds/background-*.png`

**Performance:**
- Videos load on modal open
- Hover videos prepare on card viewport entry
- Metadata preload for faster start

---

### 4. CTA Section Backgrounds

Call-to-action sections use responsive image backgrounds with lazy loading.

#### 4.1 CTA Get In Touch Section
**Location:** `index.html` - CTA section  
**CSS Class:** `.cta-section`  
**Background Image:** `cta-get-in-touch.webp`

**Responsive Variants:**
- 1920w: `cta-get-in-touch-1920w.avif/webp`
- 1280w: `cta-get-in-touch-1280w.avif/webp`
- 1024w: `cta-get-in-touch-1024w.avif/webp`
- 768w: `cta-get-in-touch-768w.avif/webp`
- 480w: `cta-get-in-touch-480w.avif/webp`

**Features:**
- Fixed attachment scrolling (desktop)
- Portal glow effect (animated border)
- Portal dividers (curved SVG edges)
- Lazy loading via JavaScript

**CSS Classes:**
- `.cta-section`
- `.portal-glow`
- `.portal-divider`
- `.bg-loaded` (when image loaded)

**Effects Applied:**
- Portal glow animation (8s infinite)
- Fluid gradient background
- Portal divider SVG curves

**Assets:**
- `assets/images/backgrounds/cta-get-in-touch.webp`
- `assets/images/responsive/backgrounds/cta-get-in-touch-*.avif/webp`

**Performance:**
- Lazy loaded via `lazy-background-images.js`
- Fixed attachment disabled on mobile
- Portal glow disabled on mobile

---

### 5. Other Background Images

#### 5.1 Static Background Images
**Location:** Various sections  
**Images:**
- `clients.webp` - Clients section
- `enhance-bg.webp` - Enhancement section
- `green-hexagon-grid.webp` - Grid pattern background
- `tron-grid.webp` - Tron-style grid
- `ripples.webp` - Ripples pattern

**Usage:**
- Section backgrounds
- Pattern overlays
- Decorative elements

**Assets:**
- `assets/images/backgrounds/*.webp`
- Responsive variants in `assets/images/responsive/backgrounds/`

---

### 6. Particle Effects

#### 6.1 Contact Page Particles
**Location:** `contact.html` - Contact page  
**CSS Class:** `.particles-contact`  
**Implementation:** Pure CSS animations

**Features:**
- Repeating linear gradient rain effect
- Radial gradient glow effects
- 18s and 22s animation loops
- Mix-blend-mode: screen

**CSS Classes:**
- `.particles-contact`
- `.particles-contact::before` (rain effect)
- `.particles-contact::after` (glow effect)

**Effects:**
- `particlesContactRain` - Vertical scrolling rain
- `particlesContactGlow` - Pulsing glow animation

**Assets:**
- No external assets (pure CSS)

**Performance:**
- GPU-accelerated transforms
- Optimized for mobile

---

## 📁 Asset Inventory

### Image Assets

#### Background Images (9 files)
```
assets/images/backgrounds/
├── clients.webp
├── cta-get-in-touch.webp
├── enhance-bg.webp
├── green-hexagon-grid.webp
├── mission-parallax-bg.webp
├── process-parallax-bg.webp
├── ripples.webp
├── testimonials-parallax-bg.webp
└── tron-grid.webp
```

#### Banner Images (1 file)
```
assets/images/banners/
└── banner_home.webp
```

#### Responsive Background Images
Multiple responsive variants (AVIF + WebP) in:
```
assets/images/responsive/backgrounds/
├── cta-get-in-touch-*.avif/webp (5 sizes)
├── mission-parallax-bg-*.avif/webp (4 sizes)
├── process-parallax-bg-*.avif/webp (4 sizes)
├── testimonials-parallax-bg-*.avif/webp (4 sizes)
└── [other responsive variants]
```

### Video Assets

#### Optimized Videos (7 projects + 1 ripples)
```
assets/video/optimized/
├── ripples-hq/mq/lq.mp4
├── ripples-webm.webm
├── ripples-poster.jpg
├── video-e-commerce-platform-*.mp4/webm/poster
├── video-fintech-mobile-app-*.mp4/webm/poster
├── video-tech-startup-rebrand-*.mp4/webm/poster
├── video-corporate-website-*.mp4/webm/poster
├── video-fitness-tracking-app-*.mp4/webm/poster
└── video-marketing-campaign-*.mp4/webm/poster
```

#### Source Videos (7 files)
```
assets/video/
├── ripples.mp4
├── video-corporate-website.mp4
├── video-e-commerce-platform.mp4
├── video-fintech-mobile-app.mp4
├── video-fitness-tracking-app.mp4
├── video-marketing-campaign.mp4
└── video-tech-startup-rebrand.mp4
```

---

## 🎯 Implementation Details

### JavaScript Modules

1. **`js/core/three-hero.js`**
   - Handles all Three.js hero backgrounds
   - Different animations per page
   - Mobile detection and disabling

2. **`js/utils/ripples-lazyload.js`**
   - Video background lazy loading
   - Adaptive quality selection
   - Connection-aware loading

3. **`js/utils/lazy-background-images.js`**
   - CTA section background lazy loading
   - Responsive image selection
   - Viewport-based loading

4. **`js/pages/projects.js`**
   - Project modal video backgrounds
   - Hover video functionality
   - Image/video toggle

5. **`js/core/scroll.js`**
   - Parallax scroll effects
   - Hero background parallax

### CSS Modules

1. **`css/components/hero.css`**
   - Hero section base styles
   - Ripple wave animations
   - Liquid motion backgrounds
   - **Note:** CSS particles (`.particles`) removed as of 2025-12-04

2. **`css/components/parallax.css`**
   - Parallax section styles
   - Responsive background images
   - Overlay gradients

3. **`css/components/cta.css`**
   - CTA section backgrounds
   - Portal effects
   - Responsive images

4. **`css/pages/contact/_contact-particles.css`**
   - Contact page particle effects
   - Rain and glow animations

5. **`css/pages/projects/_project-modal.css`**
   - Project modal video backgrounds
   - Image/video toggle styles

---

## ⚡ Performance Optimizations

### Loading Strategies

1. **Lazy Loading:**
   - All video backgrounds lazy load on viewport entry
   - Background images lazy load via Intersection Observer
   - Three.js backgrounds load on idle

2. **Adaptive Quality:**
   - Videos: HQ/MQ/LQ based on viewport and connection
   - Images: Responsive variants (AVIF/WebP)
   - Connection-aware selection

3. **Mobile Optimizations:**
   - Three.js disabled on mobile
   - Fixed attachment → scroll on mobile
   - Reduced animations on mobile
   - Portal glow disabled on mobile

4. **Preloading:**
   - Poster images preload for videos
   - Critical hero images preload
   - Font preloading for text overlays

### Performance Features

- **GPU Acceleration:** Transform-based animations
- **Will-Change:** Removed (animation handles optimization)
- **Containment:** CSS containment for layout stability
- **Reduced Motion:** Respects `prefers-reduced-motion`
- **Code Splitting:** Dynamic imports for Three.js

---

## 📊 Summary Statistics

### Background Types
- **Hero Banners:** 8 implementations
- **Parallax Backgrounds:** 3 sections
- **Video Backgrounds:** 2 implementations (ripples + project modals)
- **CTA Backgrounds:** 1 section
- **Particle Effects:** 1 implementation (contact page)
- **Static Backgrounds:** 9 image files

### Total Assets
- **Background Images:** 9 base + responsive variants
- **Video Files:** 7 project videos + 1 ripples video
- **Poster Images:** 8 poster images
- **Banner Images:** 1 banner image

### Performance Impact
- **Three.js Backgrounds:** 3 pages (disabled on mobile)
- **Video Backgrounds:** 8 videos (lazy loaded)
- **Parallax Sections:** 3 sections (fixed attachment disabled on mobile)
- **Particle Effects:** 1 page (CSS-only)

---

## 🔍 Recommendations

### Current State
✅ **Well Optimized:**
- Lazy loading implemented
- Responsive images with AVIF/WebP
- Mobile optimizations in place
- Connection-aware quality selection

### Potential Improvements
1. **Image Optimization:**
   - Consider WebP conversion for remaining PNGs
   - Audit unused background images

2. **Video Optimization:**
   - Consider H.264 fallback for older devices
   - Implement video preloading for above-fold videos

3. **Performance Monitoring:**
   - Track LCP for hero backgrounds
   - Monitor video playback performance
   - Measure parallax scroll performance

4. **Accessibility:**
   - Ensure video backgrounds have proper ARIA labels
   - Verify reduced motion support
   - Test keyboard navigation

---

**Last Updated:** 2025-12-04  
**Next Review:** When adding new background effects or optimizing existing ones

