# Codebase Map - Logi-Ink

**Generated:** 2025-12-04  
**Project:** logi-ink v2.1.0  
**Description:** Complete structural and dependency map of the codebase  
**Generator:** Cursor AI Agent via /codemap command

---

## 📊 Executive Summary

### Project Overview
Logi-Ink is a modern, performance-optimized static website built with:
- **Build Tool:** Vite 7.2.6
- **Architecture:** Modular ES6 JavaScript + Modular CSS
- **Total Source Files:** ~340 files
- **Entry Points:** 9 HTML pages
- **JavaScript Modules:** 44 core modules (9 core, 18 utils, 4 pages, 13 easter-egg)
- **CSS Modules:** 74 files (20 components, 4 pages, 13 utils, 1 easter-egg)
- **Build Scripts:** 44 utility scripts
- **Test Files:** 15 files (3 E2E, 6 unit, 2 HTML, 4 setup)

### Key Characteristics
- ✅ **Modular Architecture:** Well-organized component-based structure
- ✅ **Performance Optimized:** Code-splitting, lazy loading, critical CSS
- ✅ **Modern Stack:** ES6 modules, CSS custom properties, Vite bundling
- ✅ **Comprehensive Tooling:** Image optimization, font subsetting, performance analysis
- ✅ **Testing:** Playwright E2E tests, Vitest unit tests
- ✅ **PWA Support:** Service worker with optimized caching strategy
- ✅ **3D Graphics:** Three.js-based easter egg with procedural generation

---

## 📁 Directory Structure

### Root Level Files

```
logia-ink/
├── HTML Entry Points (9 files)
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── services.html
│   ├── projects.html
│   ├── pricing.html
│   ├── seo-services.html
│   ├── reports.html
│   └── 404.html
│
├── Configuration Files (17 files)
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── playwright.config.js
│   ├── vitest.config.js
│   ├── postcss.config.cjs
│   ├── lighthouserc.json
│   ├── lighthouserc.pwa.json
│   ├── pa11y.config.json
│   ├── pwmetrics.config.cjs
│   ├── .htaccess
│   ├── _headers
│   ├── nginx.conf.example
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── site.webmanifest
│   └── browserconfig.xml
│
├── Vite Plugins (3 files)
│   ├── vite-plugin-html-include.js
│   ├── vite-plugin-critical-css.js
│   └── vite-plugin-csp-nonces.js
│
└── Assets
    ├── fonts/ (20 files: Orbitron + Rajdhani families)
    ├── images/ (496 files: backgrounds, banners, portfolio, responsive)
    ├── audio/ (1 file: space-ambience-optimized.ogg)
    └── video/ (optimized hero/background loops)
```

### JavaScript Architecture

```
js/
├── main.js                    # Main entry point (imports all modules)
│
├── core/ (9 modules)
│   ├── scroll-manager.js      # Centralized scroll event handler
│   ├── navigation.js          # Navbar, mobile menu, active states
│   ├── scroll.js              # Scroll progress, parallax, back-to-top
│   ├── animations.js          # Scroll-triggered animations
│   ├── cursor.js              # Custom cursor effects
│   ├── mouse-tilt.js          # 3D tilt effects on cards
│   ├── page-transitions.js    # Page transition animations
│   ├── service-worker.js      # PWA service worker registration
│   └── three-hero.js          # Three.js hero backgrounds
│
├── utils/ (18 modules)
│   ├── accessibility.js       # Accessibility utilities
│   ├── env.js                 # Environment detection
│   ├── error-handler.js       # Centralized error handling
│   ├── interactions.js        # Button hover effects, card interactions
│   ├── performance.js         # Web Vitals tracking
│   ├── ripples-lazyload.js    # Background video lazy loader
│   ├── lazy-background-images.js # Lazy loads CSS background images
│   ├── three-loader.js        # Dynamic Three.js loader
│   ├── toast.js               # Toast notification system
│   ├── dynamic-prefetch.js    # Dynamic resource hints
│   ├── web-worker-helper.js   # Web Worker utilities
│   └── video-*-lazyload.js    # 7 page-specific video lazy loaders
│
├── pages/ (4 modules)
│   ├── contact.js             # Contact form handling
│   ├── services.js            # Service modals handling
│   ├── projects.js            # Project details modal
│   └── reports.js             # Reports dashboard
│
└── easter-egg/ (13 modules - 3D galaxy scene)
    ├── easter-egg.js          # Trigger/initialization
    ├── runtime.js             # Milky Way 3D scene runtime
    ├── celestial-textures.js  # Procedural texture generation
    ├── texture-wrapping.js    # Seamless texture wrapping
    ├── procedural-noise.js    # Procedural noise generation
    ├── celestial-mechanics.js # Orbital mechanics
    ├── camera-controls.js     # Camera animation and controls
    ├── galaxy-generator.js    # Multi-layer galaxy generation
    ├── star-field.js          # Background star field
    ├── lighting-atmosphere.js # Dynamic lighting and glow
    ├── nebula-clouds.js       # Nebula and interstellar medium
    ├── particle-effects.js    # Asteroids, comets, solar wind
    └── post-processing.js     # Post-processing effects
```

### CSS Architecture

```
css/
├── main.css                   # Main entry point (imports all modules)
├── variables.css              # CSS custom properties
├── base.css                   # Reset, typography, foundational styles
├── fonts.css                  # Self-hosted font declarations
├── critical.css               # Critical CSS (above-the-fold)
│
├── components/ (20 components)
│   ├── navigation.css
│   ├── hero.css
│   ├── buttons.css
│   ├── footer.css
│   ├── cta.css
│   ├── parallax.css
│   ├── back-to-top.css
│   ├── modals.css
│   ├── alerts.css
│   ├── service-worker.css
│   ├── badges.css
│   ├── tables.css
│   ├── tabs.css
│   ├── accordions.css
│   ├── tooltips.css
│   ├── typography.css
│   ├── breadcrumbs.css
│   ├── toast.css
│   ├── cards/
│   │   ├── index.css         # Main card component index
│   │   ├── _card-base.css
│   │   ├── _service-card.css
│   │   ├── _pricing-card.css
│   │   ├── _offer-panel.css
│   │   ├── _project-card.css
│   │   ├── _card-container-queries.css
│   │   ├── _card-variants.css
│   │   ├── _card-sections.css
│   │   └── _card-animations.css
│   └── forms/
│       ├── index.css          # Main form component index
│       ├── _form-base.css
│       ├── _form-inputs.css
│       ├── _form-validation.css
│       └── _form-variants.css
│
├── pages/ (4 pages)
│   ├── about.css
│   ├── reports.css
│   ├── contact/
│   │   ├── index.css          # Main contact page index
│   │   ├── _contact-base.css
│   │   ├── _contact-form.css
│   │   ├── _contact-map.css
│   │   ├── _contact-testimonials.css
│   │   ├── _contact-particles.css
│   │   └── _contact-responsive.css
│   └── projects/
│       ├── index.css          # Main projects page index
│       ├── _projects-grid.css
│       └── _project-modal.css
│
├── utils/ (13 utilities)
│   ├── animations.css         # All @keyframes and animation utilities
│   ├── cursor.css             # Custom cursor and scroll progress
│   ├── 3d-effects.css         # 3D transform effects
│   ├── fluid-effects.css      # Fluid morphing effects
│   ├── loading.css            # Loading spinners and overlays
│   ├── empty-state.css        # Empty state styles
│   ├── dividers.css           # Divider/separator styles
│   ├── skip-link.css          # Skip link accessibility styles
│   ├── _responsive-breakpoints.css
│   ├── _responsive-images.css
│   ├── _fluid-typography.css
│   ├── _performance-optimizations.css
│   └── responsive.css         # All @media queries (MUST BE LAST)
│
└── easter-egg/
    └── easter-egg.css         # Black hole vortex and Milky Way scene styles
```

### Scripts Directory

```
scripts/ (44 files)
├── Optimization (7 files)
│   ├── optimize-images.js
│   ├── optimize-video.js
│   ├── convert-poster-formats.js
│   ├── generate-responsive-images.js
│   ├── subset-fonts.js
│   ├── inline-critical-css.js
│   └── inline-cursor.js
│
├── Analysis (12 files)
│   ├── analyze-bundle-size.js
│   ├── analyze-critical-css.js
│   ├── analyze-font-loading.js
│   ├── analyze-important.js
│   ├── analyze-remaining-opportunities.js
│   ├── analyze-specificity.js
│   ├── audit-font-declarations.js
│   ├── audit-images.js
│   ├── css-inventory.js
│   ├── font-inventory.js
│   ├── find-duplicate-selectors.js
│   └── find-hardcoded-values.js
│
├── Generation (9 files)
│   ├── generate-sitemap.js
│   ├── generate-seo-meta.js
│   ├── generate-structured-data.js
│   ├── generate-coverage-report.js
│   ├── generate-dashboard-reports.js
│   ├── generate-media-inventory.js
│   ├── generate-performance-timeline.js
│   ├── generate-pwmetrics-report.js
│   └── generate-csp-nonces.js
│
├── Migration (4 files)
│   ├── migrate-font-values.js
│   ├── migrate-high-priority-spacing.js
│   ├── enhance-variables-and-replace.js
│   └── replace-hardcoded-values.js
│
└── Utilities (12 files)
    ├── run-pa11y-report.js
    ├── update-html-seo.js
    ├── delete-unused-fonts.js
    ├── split-cards-css.js
    ├── test-fonts.ps1
    ├── unregister-service-worker.js
    ├── find-chrome-path.js
    └── subset-fonts-with-glyphhanger.*
```

### Tests Directory

```
tests/ (15 files)
├── e2e/ (3 files)
│   ├── smoke.spec.js
│   ├── mobile-optimizations.spec.js
│   └── responsive.spec.js
│
├── unit/ (6 files)
│   ├── vite-plugin-critical-css.test.js
│   ├── scripts/inline-critical-css.test.js
│   ├── utils/accessibility.test.js
│   ├── utils/toast.test.js
│   ├── utils/error-handler.test.js
│   └── utils/env.test.js
│
└── HTML (2 files)
    ├── test-fonts.html
    └── test-service-worker.html
```

### Generate Directory (Social Media Image Generator)

```
generate/
├── generate.html              # Main generator interface
├── preview-popout-window.html # Popout preview window
├── css/ (8 files)
│   ├── base.css
│   ├── layout.css
│   ├── controls.css
│   ├── color-picker.css
│   ├── canvas.css
│   ├── tabs.css
│   ├── toast.css
│   └── skeleton.css
└── js/ (31 files)
    ├── main.js
    ├── preview.js
    ├── export.js
    ├── config.js
    ├── templates.js
    ├── preset-storage.js
    ├── history.js
    ├── color-picker.js
    ├── background-patterns.js
    ├── grid-overlay.js
    ├── ruler-guides.js
    ├── preview-popout.js
    └── utils/ (3 files)
        ├── export-high-res.js
        ├── export-high-res-worker.js
        └── dither-worker.js
```

---

## 🔗 Dependency Graph

### NPM Dependencies

#### Runtime Dependencies (2)
- `html-to-image` ^1.11.13 - Used by generate/ tool for image export
- `web-vitals` ^5.1.0 - Performance metrics tracking

#### Dev Dependencies (19)
- `vite` ^7.2.6 - Build tool
- `@playwright/test` ^1.57.0 - E2E testing
- `vitest` ^4.0.15 - Unit testing
- `eslint` ^9.39.1 - Linting
- `prettier` ^3.7.4 - Code formatting
- `sharp` ^0.34.5 - Image optimization
- `@lhci/cli` ^0.15.1 - Lighthouse CI
- `pa11y` ^9.0.1 - Accessibility auditing
- `rollup-plugin-visualizer` ^6.0.5 - Bundle analysis
- `vite-plugin-compression` ^0.5.1 - Gzip/Brotli compression
- And 9 more...

### JavaScript Module Dependencies

#### Main Entry Point (`js/main.js`)
**Imports:**
- `../css/main.css` - CSS entry point
- `./core/scroll-manager.js` - Scroll event management
- `./core/navigation.js` - Navigation functionality
- `./core/scroll.js` - Scroll effects
- `./utils/interactions.js` - UI interactions
- `./utils/ripples-lazyload.js` - Video lazy loading
- `./utils/lazy-background-images.js` - Image lazy loading
- `./core/page-transitions.js` - Page transitions
- `./core/service-worker.js` - PWA support
- `./utils/accessibility.js` - Accessibility features
- `./utils/error-handler.js` - Error handling
- `./utils/dynamic-prefetch.js` - Resource prefetching

**Dynamic Imports (Lazy Loaded):**
- `./core/animations.js` - Scroll animations
- `./core/cursor.js` - Cursor effects
- `./core/mouse-tilt.js` - 3D tilt effects
- `./core/three-hero.js` - Three.js hero backgrounds
- `./utils/performance.js` - Performance tracking
- `./easter-egg/easter-egg.js` - Easter egg feature
- `./pages/contact.js` - Contact page logic
- `./pages/services.js` - Services page logic
- `./pages/projects.js` - Projects page logic
- `./pages/reports.js` - Reports page logic

#### Core Modules

**scroll-manager.js**
- **Exports:** `addScrollHandler`
- **Dependencies:** None (base module)

**navigation.js**
- **Exports:** `initNavigation`
- **Dependencies:** `./scroll-manager.js`

**scroll.js**
- **Exports:** `initScroll`
- **Dependencies:** `./scroll-manager.js`

**three-hero.js**
- **Exports:** `initThreeHero`, `cleanupThreeHero`
- **Dependencies:** `../utils/three-loader.js`, `../utils/env.js`

**service-worker.js**
- **Exports:** `registerServiceWorker`, `autoUnregisterServiceWorkers`, `checkForUpdates`
- **Dependencies:** `../utils/env.js`

#### Utility Modules

**env.js**
- **Exports:** `isDevelopmentEnv`, `isProductionEnv`, `isServiceWorkerDisabled`, `getEnvironmentMode`, `isMobileDevice`
- **Dependencies:** None (utility module)

**performance.js**
- **Exports:** `initPerformanceTracking`, `trackWebVitals`
- **Dependencies:** `web-vitals`, `./env.js`

**toast.js**
- **Exports:** `showToast`
- **Dependencies:** None (standalone utility)

**three-loader.js**
- **Exports:** `loadThreeJS`, `isThreeJSAvailable`
- **Dependencies:** None (dynamic loader)

#### Page Modules

**contact.js**
- **Exports:** `initContactForm`
- **Dependencies:** `../utils/toast.js`, `../utils/env.js`

**services.js**
- **Exports:** `initServiceModals`
- **Dependencies:** None

**projects.js**
- **Exports:** `initProjectsPage`
- **Dependencies:** None

**reports.js**
- **Exports:** `initReportsPage`
- **Dependencies:** None

#### Easter Egg Modules (3D Galaxy Scene)

**easter-egg.js**
- **Exports:** `initEasterEgg`
- **Dependencies:** `../utils/env.js`

**runtime.js** (Central Hub)
- **Exports:** `activateEasterEgg`
- **Dependencies:**
  - `../utils/env.js`
  - `./celestial-textures.js`
  - `./galaxy-generator.js`
  - `./star-field.js`
  - `./procedural-noise.js`
  - `./texture-wrapping.js`
  - `./celestial-mechanics.js`
  - `./camera-controls.js`
  - `./lighting-atmosphere.js`
  - `./nebula-clouds.js`
  - `./particle-effects.js`
  - `./post-processing.js`

**celestial-textures.js**
- **Exports:** `createSunTexture`, `createMoonTexture`, `createPlanetTexture`
- **Dependencies:** `./procedural-noise.js`, `./texture-wrapping.js`

**procedural-noise.js**
- **Exports:** `noise`, `noise3D`, `smoothstep`, `fractalNoise`, `fractalNoise3D`, `seamlessNoise`, `seamlessFractalNoise`
- **Dependencies:** None (pure functions)

**texture-wrapping.js**
- **Exports:** `createEquirectangularCanvas`, `uvToEquirectangular`, `equirectangularToUV`, `isNearPole`, `makeSeamless`, `featherPoles`, `isSafeForPolePlacement`, `shouldPlaceFeatureAtPole`, `getPoleScaleFactor`, `createSphereTexture`
- **Dependencies:** None (pure functions)

### CSS Import Hierarchy

#### Main CSS (`css/main.css`)
**Import Order:**
1. Variables (`./variables.css`) - Must be first
2. Fonts (`./fonts.css`) - Font declarations
3. Base (`./base.css`) - Reset and foundational styles
4. Components (18 imports) - Reusable UI components
5. Pages (4 imports) - Page-specific styles
6. Animations & Effects (8 imports) - Visual effects
7. Responsive Utilities (4 imports) - Responsive helpers
8. Responsive (`./utils/responsive.css`) - Must be last

#### Component Index Files

**cards/index.css**
- Imports 9 card module files

**forms/index.css**
- Imports 4 form module files

**contact/index.css**
- Imports 6 contact page module files

**projects/index.css**
- Imports 2 projects page module files

---

## 🏗️ Build Configuration

### Build Tool: Vite 7.2.6

**Entry Points:**
- `index.html`
- `about.html`
- `services.html`
- `projects.html`
- `contact.html`
- `pricing.html`
- `seo-services.html`
- `reports.html`
- `sw.js` (Service Worker)

**Custom Plugins:**
1. `vite-plugin-html-include` - Processes `<!-- include -->` comments
2. `vite-plugin-critical-css` - Inlines critical CSS post-build
3. `vite-plugin-csp-nonces` - Adds CSP nonces post-build

**Build Plugins:**
- `vite-plugin-compression` (Gzip & Brotli)
- `rollup-plugin-visualizer` (Bundle analysis)

**Output Structure:**
- JS: `assets/js/[name]-[hash].js`
- CSS: Bundled per entry point
- Images: `assets/images/[name]-[hash][extname]`
- Fonts: `assets/fonts/[name]-[hash][extname]`
- Videos: `assets/video/optimized/[name][extname]`
- Service Worker: `[name].js` (root)

---

## 📈 Statistics

### File Counts
- **JavaScript:** 140 files
- **CSS:** 74 files
- **HTML:** 68 files
- **Scripts:** 44 files
- **Tests:** 15 files
- **Config:** 17 files

### Module Counts
- **Core JS Modules:** 9
- **Utility JS Modules:** 18
- **Page JS Modules:** 4
- **Easter Egg JS Modules:** 13
- **CSS Components:** 20
- **CSS Pages:** 4
- **CSS Utils:** 13

### Dependencies
- **Runtime:** 2 packages
- **Dev Dependencies:** 19 packages

---

## ⚠️ Potential Issues & Hotspots

### High Coupling (Expected)
1. **`js/easter-egg/runtime.js`**
   - Imports 11 other easter-egg modules
   - **Severity:** Low
   - **Note:** Expected architecture for 3D scene orchestration

2. **`js/main.js`**
   - Imports and initializes all core modules
   - **Severity:** Low
   - **Note:** Expected for main entry point

### Large Modules (Expected)
1. **`vite.config.js`**
   - 812 lines - complex build configuration
   - **Severity:** Low
   - **Note:** Contains multiple plugin configurations

2. **`js/easter-egg/runtime.js`**
   - Large 3D scene orchestration module
   - **Severity:** Low
   - **Note:** Expected for complex 3D rendering

### Circular Dependencies
✅ **None detected** - Clean dependency graph

### Unused Exports
✅ **None detected** - All exports are used

### Missing Dependencies
✅ **None detected** - All imports resolve correctly

---

## 🎯 Architecture Patterns

### JavaScript Architecture
- **Pattern:** Modular ES6 with lazy loading
- **Entry Point:** `js/main.js`
- **Lazy Loading Strategy:** `requestIdleCallback` with dynamic imports
- **Code Splitting:** Automatic via dynamic imports

### CSS Architecture
- **Pattern:** Modular CSS with `@import` hierarchy
- **Entry Point:** `css/main.css`
- **Import Order:** Variables → Base → Components → Pages → Utils → Responsive
- **Component Organization:** Index files for complex components (cards, forms, pages)

### Performance Optimizations
1. Code splitting via dynamic imports
2. Critical CSS inlining
3. Font subsetting
4. Image optimization (AVIF/WebP)
5. Video lazy loading
6. Service worker caching (stale-while-revalidate for hashed assets, cache-first for static)
7. Resource hints (prefetch, preload, modulepreload)
8. Lazy loading of non-critical modules
9. Mobile-specific optimizations

---

## 🔍 Module Relationships

### Core Module Flow
```
main.js
├── scroll-manager.js (base)
├── navigation.js → scroll-manager.js
├── scroll.js → scroll-manager.js
├── page-transitions.js
├── service-worker.js → env.js
└── [lazy loaded]
    ├── animations.js
    ├── cursor.js
    ├── mouse-tilt.js
    ├── three-hero.js → three-loader.js, env.js
    └── easter-egg.js → [11 easter-egg modules]
```

### Easter Egg Module Flow
```
easter-egg.js
└── runtime.js
    ├── celestial-textures.js → procedural-noise.js, texture-wrapping.js
    ├── galaxy-generator.js
    ├── star-field.js
    ├── procedural-noise.js (pure functions)
    ├── texture-wrapping.js (pure functions)
    ├── celestial-mechanics.js (pure functions)
    ├── camera-controls.js
    ├── lighting-atmosphere.js
    ├── nebula-clouds.js
    ├── particle-effects.js
    └── post-processing.js
```

### CSS Import Flow
```
main.css
├── variables.css
├── fonts.css
├── base.css
├── components/*.css
│   ├── cards/index.css → [9 card modules]
│   └── forms/index.css → [4 form modules]
├── pages/*.css
│   ├── contact/index.css → [6 contact modules]
│   └── projects/index.css → [2 project modules]
├── utils/*.css
└── responsive.css (last)
```

---

## 📝 Notes

### Code Quality
- ✅ No circular dependencies
- ✅ Clean module boundaries
- ✅ Proper separation of concerns
- ✅ Consistent naming conventions
- ✅ Comprehensive error handling

### Performance
- ✅ Lazy loading for non-critical modules
- ✅ Code splitting via dynamic imports
- ✅ Critical CSS inlining
- ✅ Optimized asset loading
- ✅ Service worker caching strategy

### Maintainability
- ✅ Modular architecture
- ✅ Clear dependency graph
- ✅ Well-organized file structure
- ✅ Comprehensive documentation
- ✅ Testing infrastructure

---

**Last Updated:** 2025-12-04  
**Next Review:** When major structural changes occur
