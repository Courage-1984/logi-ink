# Codebase Map - Logi-Ink

**Generated:** 2025-01-30  
**Project:** logi-ink v2.1.0  
**Description:** Complete structural and dependency map of the codebase

---

## 📊 Executive Summary

### Project Overview
Logi-Ink is a modern, performance-optimized static website built with:
- **Build Tool:** Vite 7.2.2
- **Architecture:** Modular ES6 JavaScript + Modular CSS
- **Total Files:** ~170 source files
- **Entry Points:** 9 HTML pages
- **JavaScript Modules:** 50 files
- **CSS Modules:** 60 files
- **Build Scripts:** 39 utility scripts

### Key Characteristics
- ✅ **Modular Architecture:** Well-organized component-based structure
- ✅ **Performance Optimized:** Code-splitting, lazy loading, critical CSS
- ✅ **Modern Stack:** ES6 modules, CSS custom properties, Vite bundling
- ✅ **Comprehensive Tooling:** Image optimization, font subsetting, performance analysis

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
├── Configuration Files (12 files)
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── playwright.config.js
│   ├── lighthouserc.json
│   └── ... (security headers, SEO configs)
│
├── Assets
│   ├── fonts/ (Orbitron, Rajdhani - subsetted WOFF2)
│   ├── images/ (responsive AVIF/WebP sets)
│   ├── video/ (optimized hero loops)
│   └── audio/ (space ambience for easter egg)
│
└── Source Code
    ├── css/ (modular stylesheets)
    ├── js/ (ES6 modules)
    ├── scripts/ (build & analysis tools)
    ├── generate/ (social media image generator)
    └── partials/ (HTML components)
```

---

## 🎨 CSS Architecture

### Structure Overview
The CSS follows a modular architecture with clear separation of concerns:

```
css/
├── Core Files
│   ├── main.css (entry point)
│   ├── variables.css (design tokens)
│   ├── base.css (reset & typography)
│   ├── fonts.css (@font-face declarations)
│   └── critical.css (above-the-fold styles)
│
├── Components/ (20 component files)
│   ├── Standalone components (18 files)
│   │   ├── navigation.css
│   │   ├── hero.css
│   │   ├── buttons.css
│   │   └── ...
│   │
│   └── Modular components (index.css imports)
│       ├── cards/index.css → 9 sub-modules
│       └── forms/index.css → 4 sub-modules
│
├── Pages/ (4 page-specific styles)
│   ├── Standalone: about.css, reports.css
│   └── Modular:
│       ├── contact/index.css → 6 sub-modules
│       └── projects/index.css → 2 sub-modules
│
├── Utils/ (13 utility files)
│   ├── animations.css
│   ├── cursor.css
│   ├── 3d-effects.css
│   ├── fluid-effects.css
│   └── responsive.css (must be last)
│
└── easter-egg/ (galaxy easter egg styles)
    └── easter-egg.css
```

### Import Chain
```
main.css
├── variables.css (1st - design tokens)
├── fonts.css (1.5 - font declarations)
├── base.css (2nd - reset & typography)
├── components/* (3rd - UI components)
│   ├── cards/index.css
│   │   └── _card-*.css (9 files)
│   └── forms/index.css
│       └── _form-*.css (4 files)
├── pages/* (4th - page-specific)
│   ├── contact/index.css
│   │   └── _contact-*.css (6 files)
│   └── projects/index.css
│       └── _project-*.css (2 files)
├── utils/* (5th - animations & effects)
└── utils/responsive.css (last - media queries)
```

---

## 💻 JavaScript Architecture

### Module Structure
```
js/
├── main.js (entry point)
│
├── core/ (9 core modules)
│   ├── scroll-manager.js (centralized scroll handler)
│   ├── navigation.js
│   ├── scroll.js
│   ├── animations.js
│   ├── cursor.js
│   ├── mouse-tilt.js
│   ├── page-transitions.js
│   ├── service-worker.js
│   └── three-hero.js
│
├── utils/ (18 utility modules)
│   ├── env.js (environment detection)
│   ├── error-handler.js
│   ├── accessibility.js
│   ├── performance.js
│   ├── three-loader.js
│   ├── toast.js
│   └── ... (12 more utilities)
│
├── pages/ (4 page-specific modules)
│   ├── contact.js
│   ├── services.js
│   ├── projects.js
│   └── reports.js
│
└── easter-egg/ (13 3D scene modules)
    ├── easter-egg.js (initialization)
    ├── runtime.js (scene orchestrator)
    ├── celestial-textures.js
    ├── texture-wrapping.js
    ├── procedural-noise.js
    ├── celestial-mechanics.js
    ├── camera-controls.js
    ├── galaxy-generator.js
    ├── star-field.js
    ├── lighting-atmosphere.js
    ├── nebula-clouds.js
    ├── particle-effects.js
    └── post-processing.js
```

### Dependency Graph

#### Main Entry Point (js/main.js)
```
main.js
├── Immediate Imports (critical)
│   ├── css/main.css
│   ├── core/scroll-manager.js
│   ├── core/navigation.js
│   ├── core/scroll.js
│   ├── core/page-transitions.js
│   ├── utils/error-handler.js
│   ├── utils/accessibility.js
│   └── utils/interactions.js
│
├── Deferred Imports (non-critical)
│   ├── core/animations.js
│   ├── core/cursor.js
│   ├── core/mouse-tilt.js
│   └── utils/dynamic-prefetch.js
│
└── Lazy Imports (on-demand)
    ├── utils/performance.js
    ├── easter-egg/easter-egg.js
    ├── core/three-hero.js
    └── pages/*.js (route-based)
```

#### Core Module Dependencies
```
scroll-manager.js
└── Used by: navigation.js, scroll.js

env.js
└── Used by: service-worker.js, three-hero.js, easter-egg/*, pages/contact.js

three-loader.js
└── Used by: core/three-hero.js
```

#### Easter Egg Module Dependencies
```
runtime.js (orchestrator)
├── celestial-textures.js
│   ├── texture-wrapping.js
│   └── procedural-noise.js
├── galaxy-generator.js
├── star-field.js
├── lighting-atmosphere.js
├── nebula-clouds.js
├── particle-effects.js
├── camera-controls.js
├── post-processing.js
└── celestial-mechanics.js
```

---

## 📦 Dependencies

### NPM Packages

#### Production Dependencies (2)
- `html-to-image` ^1.11.13 - Image export for social media generator
- `web-vitals` ^5.1.0 - Performance metrics tracking

#### Development Dependencies (20)
**Build Tools:**
- `vite` ^7.2.2 - Build tool and dev server
- `terser` ^5.44.1 - JavaScript minification
- `postcss` ^8.5.6 - CSS processing
- `vite-plugin-compression` ^0.5.1 - Gzip/Brotli compression

**Code Quality:**
- `eslint` ^9.39.1 - JavaScript linting
- `prettier` ^3.6.2 - Code formatting
- `@eslint/js` ^9.39.1 - ESLint configuration

**Testing & Analysis:**
- `@playwright/test` ^1.49.0 - E2E testing
- `@lhci/cli` ^0.13.0 - Lighthouse CI
- `pa11y` ^9.0.1 - Accessibility auditing
- `pwmetrics` ^4.1.5 - Performance metrics

**Utilities:**
- `glob` ^11.0.3 - File pattern matching
- `sharp` ^0.32.6 - Image processing
- `cross-env` ^7.0.3 - Cross-platform env vars
- `rollup-plugin-visualizer` ^6.0.5 - Bundle analysis

### External Dependencies

#### CDN Resources
- **Three.js r128** - Loaded from `cdnjs.cloudflare.com` (dynamic, only when needed)
- **Plausible Analytics** - Privacy-first analytics from `plausible.io`

#### Third-Party Services
- **Google Tag Manager** - Analytics (deferred loading)
- **Plausible Analytics** - Web analytics

---

## 🔗 Component Relationships

### Core Utilities (High Reusability)

#### `js/utils/env.js`
**Purpose:** Environment detection and configuration  
**Used By:**
- `core/service-worker.js`
- `core/three-hero.js`
- `easter-egg/runtime.js`
- `pages/contact.js`
- `utils/performance.js`

**Coupling Level:** Medium (acceptable - core utility)

#### `js/core/scroll-manager.js`
**Purpose:** Centralized scroll event handler (performance optimization)  
**Used By:**
- `core/navigation.js`
- `core/scroll.js`

**Coupling Level:** Low (intentional centralization)

### Easter Egg System (Complex Interdependencies)

#### `js/easter-egg/runtime.js`
**Purpose:** Main 3D scene orchestrator  
**Orchestrates:**
- Celestial textures (sun, planets, moons)
- Galaxy generation (multi-layer)
- Star field (background)
- Lighting and atmosphere
- Nebula clouds
- Particle effects (asteroids, comets, solar wind)
- Camera controls
- Post-processing (bloom, DoF, motion blur)
- Celestial mechanics (orbital physics)

**Complexity:** High (13 interconnected modules)  
**Modularity:** Excellent (each module has single responsibility)

### Page-Specific Modules

#### `js/pages/contact.js`
**Dependencies:**
- `utils/toast.js` - User feedback
- `utils/env.js` - Environment detection

**Coupling Level:** Low (isolated page logic)

---

## 🏗️ Build Configuration

### Vite Configuration Highlights

**Build Settings:**
- Minification: Terser (with console removal)
- CSS Minification: Enabled
- CSS Code Splitting: Disabled (single bundle)
- Source Maps: Disabled (production)

**Entry Points:**
- 9 HTML pages (index, about, services, projects, contact, pricing, seo-services, reports, 404)
- Service worker (sw.js)

**Custom Plugins:**
1. **html-include** - Processes `<!-- include -->` comments
2. **clean-urls** - Dev/preview server URL rewriting
3. **copy-favicons** - Copies favicon files to dist root
4. **copy-videos** - Copies optimized video files
5. **copy-audio** - Copies audio assets
6. **copy-images** - Copies entire images directory
7. **copy-fonts** - Copies fonts directory structure
8. **copy-logos** - Copies logo files
9. **copy-seo-files** - Copies robots.txt, sitemap.xml, etc.
10. **copy-static-reports** - Copies reports directory
11. **vite-compression** - Gzip and Brotli compression
12. **rollup-plugin-visualizer** - Bundle analysis

**Chunking Strategy:**
- Manual chunking for vendor code
- Separate chunk for Three.js (if installed)
- Application code not chunked (small enough)

---

## 🔍 Potential Issues & Recommendations

### ✅ Strengths

1. **Excellent Modularity**
   - Clear separation of concerns
   - Single responsibility principle followed
   - Well-organized directory structure

2. **Performance Optimizations**
   - Code-splitting with dynamic imports
   - Lazy loading for non-critical modules
   - Critical CSS separation
   - Image optimization pipeline

3. **Maintainability**
   - Consistent naming conventions
   - Modular CSS with index files
   - Clear dependency chains

### ⚠️ Areas for Consideration

#### 1. Video Lazy-Load Modules (Low Priority)
**Issue:** 7 similar video lazy-load modules  
**Files:**
- `video-water-ripples-lazyload.js`
- `video-corporate-website-lazyload.js`
- `video-e-commerce-platform-lazyload.js`
- `video-fintech-mobile-app-lazyload.js`
- `video-fitness-tracking-app-lazyload.js`
- `video-marketing-campaign-lazyload.js`
- `video-tech-startup-rebrand-lazyload.js`

**Recommendation:** Consider consolidating into a single configurable module if patterns are similar. Current approach is acceptable for page-specific implementations.

#### 2. Vite Config Size (Low Priority)
**Issue:** `vite.config.js` is 804 lines  
**Recommendation:** Consider splitting into separate plugin files if it grows further. Current organization is clear and acceptable.

#### 3. Easter Egg Complexity (Medium Priority)
**Issue:** 13 interconnected modules for 3D scene  
**Status:** ✅ Well-modularized - each module has clear responsibility  
**Recommendation:** Current structure is excellent. Consider adding JSDoc comments for complex functions if not already present.

#### 4. CSS Import Depth (Low Priority)
**Issue:** Deep nesting (main.css → cards/index.css → _card-*.css)  
**Status:** ✅ Well-organized, Vite handles bundling efficiently  
**Recommendation:** Current structure is optimal for maintainability.

### 🎯 Optimization Opportunities

1. **Bundle Analysis**
   - Use `npm run build` to generate `dist/stats.html`
   - Review bundle sizes regularly
   - Monitor chunk sizes

2. **Code Splitting**
   - Consider splitting easter-egg modules further if bundle size grows
   - Monitor Three.js loading (currently dynamic)

3. **CSS Optimization**
   - Critical CSS inlining script available (`npm run inline-critical-css`)
   - Consider running after major CSS changes

---

## 📈 Statistics

### File Counts
- **HTML Files:** 9 entry points
- **JavaScript Modules:** 50 files
  - Core: 9 modules
  - Utils: 18 modules
  - Pages: 4 modules
  - Easter Egg: 13 modules
  - Generate Tool: 31 modules
- **CSS Files:** 60 files
  - Components: 20 files
  - Pages: 4 files
  - Utils: 13 files
  - Core: 5 files
- **Build Scripts:** 39 utility scripts
- **Configuration Files:** 12 files

### Dependency Counts
- **NPM Dependencies:** 22 packages
- **External CDN:** 2 resources (Three.js, Plausible)
- **Third-Party Services:** 2 (GTM, Plausible)

---

## 🗺️ Module Dependency Map

### Critical Path (Initial Load)
```
index.html
└── js/main.js
    ├── css/main.css
    │   └── (all CSS imports)
    ├── core/scroll-manager.js
    ├── core/navigation.js
    ├── core/scroll.js
    ├── core/page-transitions.js
    ├── utils/error-handler.js
    └── utils/accessibility.js
```

### Deferred Path (After Initial Load)
```
main.js (deferred)
├── core/animations.js
├── core/cursor.js
├── core/mouse-tilt.js
└── utils/dynamic-prefetch.js
```

### Lazy Path (On-Demand)
```
main.js (lazy)
├── utils/performance.js (analytics)
├── easter-egg/easter-egg.js (user interaction)
├── core/three-hero.js (idle callback)
└── pages/*.js (route-based)
```

---

## 📝 Notes

### Architecture Decisions

1. **Modular CSS with Index Files**
   - Cards, forms, contact, and projects use index.css pattern
   - Allows sub-modules while maintaining single import point
   - Improves maintainability

2. **Dynamic Imports for Performance**
   - Heavy modules (easter-egg, three-hero) loaded on-demand
   - Page-specific modules loaded route-based
   - Reduces initial bundle size

3. **Centralized Scroll Management**
   - `scroll-manager.js` prevents scroll event handler proliferation
   - Performance optimization through event delegation

4. **Environment Detection Utility**
   - `env.js` provides consistent environment detection
   - Used for mobile detection, service worker control, etc.

### Build Process

1. **Development:** `npm run dev` - Vite dev server with HMR
2. **Production:** `npm run build` - Optimized build with minification
3. **Analysis:** `npm run reports:all` - Comprehensive performance analysis

### Testing

- **E2E Tests:** Playwright smoke tests (`npm run test:e2e`)
- **Lighthouse:** CI integration (`npm run reports:lighthouse`)
- **Accessibility:** Pa11y audits (`npm run reports:pa11y`)

---

## 🔄 Update History

- **2025-01-30:** Initial codebase map generation
- Comprehensive analysis of structure, dependencies, and relationships

---

**Generated by:** Cursor AI Agent  
**For:** logi-ink project  
**Purpose:** Codebase documentation and dependency analysis
