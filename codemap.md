# Logi-Ink Codebase Map

**Generated:** 2025-01-30  
**Project:** logi-ink v2.1.0  
**Description:** Complete structural and dependency map of the Logi-Ink codebase

---

## 📊 Overview

This codebase is a modern, modular web application built with:
- **Build System:** Vite 7.2.2
- **Architecture:** Modular ES6 modules with CSS modules
- **Entry Points:** `js/main.js` (JavaScript), `css/main.css` (CSS)
- **Total Files:** 213+ (excluding node_modules, dist, test-results)

### Quick Stats

- **JavaScript Modules:** 45 files
  - Core: 9 modules
  - Utils: 18 modules
  - Pages: 4 modules
  - Easter Egg: 13 modules
- **CSS Modules:** 64 files
  - Components: 20 modules
  - Pages: 4 modules
  - Utils: 13 modules
  - Easter Egg: 1 module
- **HTML Pages:** 9 entry points
- **Build Scripts:** 39 utility scripts
- **Configuration Files:** 14 files

---

## 📁 Directory Structure

```
logi-ink/
├── js/                    # JavaScript modules (45 files)
│   ├── main.js           # Main entry point
│   ├── core/             # Core functionality (9 modules)
│   ├── utils/            # Utility modules (18 modules)
│   ├── pages/            # Page-specific modules (4 modules)
│   └── easter-egg/       # Galaxy easter egg feature (13 modules)
├── css/                   # CSS modules (64 files)
│   ├── main.css          # Main entry point
│   ├── variables.css     # CSS custom properties
│   ├── base.css          # Base/reset styles
│   ├── fonts.css         # Font declarations
│   ├── components/       # Reusable components (20 modules)
│   ├── pages/            # Page-specific styles (4 modules)
│   ├── utils/            # Utility styles (13 modules)
│   └── easter-egg/       # Easter egg styles (1 module)
├── generate/             # Standalone image generator tool
│   ├── generate.html     # Generator interface
│   ├── css/              # Generator styles (8 files)
│   └── js/               # Generator modules (31 files)
├── scripts/              # Build and utility scripts (39 files)
├── partials/              # HTML partials (2 files)
├── tests/                # Test files (5 files)
├── docs/                  # Documentation (27 files)
├── assets/               # Static assets
│   ├── fonts/            # Self-hosted fonts (WOFF2)
│   ├── images/           # Images (AVIF/WebP/PNG)
│   ├── video/            # Video assets
│   └── audio/            # Audio assets
└── [root HTML files]     # 9 entry point HTML files
```

---

## 🔗 Dependency Graph

### JavaScript Module Dependencies

```
js/main.js (Entry Point)
│
├── CSS Import
│   └── css/main.css
│
├── Core Modules (Immediate Load)
│   ├── scroll-manager.js
│   ├── navigation.js → scroll-manager.js
│   ├── scroll.js → scroll-manager.js
│   ├── animations.js
│   ├── cursor.js
│   ├── mouse-tilt.js
│   ├── page-transitions.js
│   └── service-worker.js → utils/env.js
│
├── Utils (Immediate Load)
│   ├── interactions.js
│   ├── ripples-lazyload.js
│   ├── lazy-background-images.js
│   ├── accessibility.js
│   ├── error-handler.js → utils/env.js
│   └── dynamic-prefetch.js
│
├── Lazy Loaded Modules
│   ├── three-hero.js → utils/three-loader.js, utils/env.js
│   ├── performance.js → web-vitals, utils/env.js
│   ├── easter-egg.js → utils/env.js
│   │   └── runtime.js → [10+ easter-egg modules]
│   └── pages/*.js (conditionally loaded)
│       ├── contact.js → utils/toast.js, utils/env.js
│       ├── services.js
│       ├── projects.js
│       └── reports.js
│
└── Utils (Lazy Loaded)
    └── env.js (Most Imported Module - 7+ imports)
```

### CSS Module Dependencies

```
css/main.css (Entry Point)
│
├── Foundation (Order Critical)
│   ├── variables.css (1st - defines CSS custom properties)
│   ├── fonts.css (2nd - font declarations)
│   └── base.css (3rd - reset/typography)
│
├── Components (20 modules)
│   ├── navigation.css
│   ├── hero.css
│   ├── buttons.css
│   ├── cards/index.css → [9 card submodules]
│   ├── footer.css
│   ├── forms/index.css → [4 form submodules]
│   └── [14 more component modules]
│
├── Pages (4 modules)
│   ├── contact/index.css → [6 contact submodules]
│   ├── projects/index.css → [2 project submodules]
│   ├── about.css
│   └── reports.css
│
├── Effects & Animations
│   ├── animations.css
│   ├── cursor.css
│   ├── 3d-effects.css
│   ├── fluid-effects.css
│   └── easter-egg/easter-egg.css
│
├── Utilities
│   ├── loading.css
│   ├── empty-state.css
│   ├── dividers.css
│   └── skip-link.css
│
└── Responsive (Must Be Last)
    ├── _responsive-breakpoints.css
    ├── _responsive-images.css
    ├── _fluid-typography.css
    ├── _performance-optimizations.css
    └── responsive.css
```

### Easter Egg Module Dependencies

```
easter-egg/runtime.js (Orchestrator)
│
├── Utils
│   └── env.js (isDevelopmentEnv, isMobileDevice)
│
├── Textures
│   ├── celestial-textures.js
│   │   ├── texture-wrapping.js
│   │   └── procedural-noise.js
│   └── [Sun, Moon, Planet texture generators]
│
├── Galaxy & Stars
│   ├── galaxy-generator.js (Multi-layer galaxy)
│   └── star-field.js (Background stars with twinkling)
│
├── Lighting & Atmosphere
│   └── lighting-atmosphere.js (Dynamic lighting, atmospheric glow)
│
├── Particle Effects
│   └── particle-effects.js (Asteroids, comets, solar wind, space dust, stations)
│
├── Celestial Mechanics
│   └── celestial-mechanics.js (Orbital mechanics, Lagrange points)
│
├── Camera
│   └── camera-controls.js (Orbital controls, presets, animations)
│
├── Nebula
│   └── nebula-clouds.js (Nebula, star-forming regions, interstellar medium)
│
└── Post-Processing
    └── post-processing.js (Bloom, depth of field, motion blur)
```

---

## 📦 Dependencies

### Runtime Dependencies

- `html-to-image` ^1.11.13 - Image export (generate tool)
- `web-vitals` ^5.1.0 - Performance metrics tracking

### Development Dependencies

- **Build Tools:**
  - `vite` ^7.2.2 - Build system
  - `vite-plugin-compression` ^0.5.1 - Gzip/Brotli compression
  - `rollup-plugin-visualizer` ^6.0.5 - Bundle analysis
  - `terser` ^5.44.1 - JavaScript minification
  - `sharp` ^0.32.6 - Image optimization
  - `postcss` ^8.5.6 - CSS processing
  - `@fullhuman/postcss-purgecss` ^7.0.2 - CSS purging (disabled)

- **Linting & Formatting:**
  - `eslint` ^9.39.1 - JavaScript linting
  - `@eslint/js` ^9.39.1 - ESLint config
  - `prettier` ^3.6.2 - Code formatting

- **Testing:**
  - `@playwright/test` ^1.49.0 - E2E testing
  - `pa11y` ^9.0.1 - Accessibility testing
  - `pwmetrics` ^4.1.5 - Performance metrics

- **Reporting:**
  - `@lhci/cli` ^0.13.0 - Lighthouse CI
  - `pa11y-reporter-html` ^2.0.0 - Pa11y HTML reports

- **Utilities:**
  - `cross-env` ^7.0.3 - Cross-platform env vars
  - `glob` ^11.0.3 - File globbing
  - `css` ^3.0.0 - CSS parsing

### Engine Requirements

- Node.js: >=20.0.0
- npm: >=10.0.0

---

## 🏗️ Build System

### Vite Configuration

**Entry Points:**
- `index.html` (Homepage)
- `about.html`
- `services.html`
- `projects.html`
- `contact.html`
- `pricing.html`
- `seo-services.html`
- `reports.html`
- `sw.js` (Service Worker)

**Build Output:**
- Directory: `dist/`
- CSS Code Splitting: Disabled (single bundle)
- CSS Minification: Disabled
- JS Minification: Terser (with console removal)
- Source Maps: Disabled in production

**Chunking Strategy:**
- Manual chunking for vendor libraries
- Three.js separated into `vendor-three` chunk
- Application code: Single bundle

**Custom Plugins:**
1. **HTML Include Plugin** - Processes `<!-- include -->` comments
2. **Clean URLs** - Dev/preview server middleware + build plugin
3. **Asset Copy Plugins:**
   - Favicons (root files)
   - Videos (optimized + root)
   - Audio files
   - Images (entire directory structure)
   - Fonts (entire directory structure)
   - Logos (root files)
   - SEO files (robots.txt, sitemap.xml, etc.)
   - Reports directory
4. **Compression:**
   - Gzip (threshold: 1KB)
   - Brotli (threshold: 1KB)
5. **Bundle Analyzer:**
   - `stats.html` (treemap)
   - `reports/bundle-report.html` (treemap)
   - `reports/bundle-stats.json` (raw data)

---

## 🔍 Module Analysis

### Most Imported Modules

1. **`js/utils/env.js`** - 7+ imports
   - Used by: service-worker, three-hero, contact, error-handler, performance, easter-egg modules
   - Exports: `isDevelopmentEnv`, `isProductionEnv`, `isServiceWorkerDisabled`, `getEnvironmentMode`, `isMobileDevice`
   - Risk: Medium (high coupling, but appropriate for utility)

2. **`js/core/scroll-manager.js`** - 2 imports
   - Used by: navigation, scroll
   - Purpose: Centralized scroll event handler
   - Risk: Low (appropriate architecture)

3. **`css/main.css`** - Single entry point
   - Imports: 64 CSS files
   - Risk: Low (well-organized modular structure)

### Large/Complex Modules

1. **`vite.config.js`** - 800+ lines
   - Contains: Multiple plugin configurations, asset copying logic
   - Recommendation: Consider extracting plugin configs to separate files

2. **`js/easter-egg/runtime.js`** - Orchestrates 10+ modules
   - Complexity: High (but well-separated concerns)
   - Risk: Low (appropriate for feature scope)

3. **`js/easter-egg/celestial-textures.js`** - Complex texture generation
   - Dependencies: texture-wrapping, procedural-noise
   - Risk: Low (well-modularized)

### Circular Dependencies

✅ **None Detected** - All import/export relationships are acyclic.

---

## 🎯 Architecture Patterns

### JavaScript

- **Pattern:** Modular ES6 with lazy loading
- **Entry:** `js/main.js` imports and initializes all modules
- **Initialization:** Uses `requestIdleCallback` for non-critical modules
- **Lazy Loading:**
  - Easter egg (heavy 3D)
  - Three.js hero backgrounds
  - Page-specific modules (conditional)
  - Performance tracking

### CSS

- **Pattern:** Modular CSS with @import
- **Entry:** `css/main.css` imports all modules
- **Order:** Critical (variables → base → components → pages → utils → responsive)
- **Organization:**
  - Component indexes (cards, forms, contact, projects) aggregate submodules
  - Utilities separated by concern
  - Responsive styles must be last

### HTML

- **Pattern:** Static HTML with build-time includes
- **Includes:** `<!-- include partials/navbar.html -->` (processed by Vite plugin)
- **Clean URLs:** All internal links use clean URLs (no .html extension)
- **SEO:** Comprehensive meta tags, structured data, favicons

---

## 📈 Potential Hotspots & Recommendations

### High Coupling Areas

1. **`js/utils/env.js`**
   - **Current:** 7+ modules depend on it
   - **Risk:** Medium
   - **Recommendation:** Monitor growth; consider splitting if it exceeds 10-12 exports

2. **`css/main.css`**
   - **Current:** Single entry point for 64 files
   - **Risk:** Low
   - **Recommendation:** Current structure is appropriate; maintain import order

### Large Files

1. **`vite.config.js`** (800+ lines)
   - **Recommendation:** Extract plugin configurations:
     - `vite-plugins/favicons.js`
     - `vite-plugins/assets.js`
     - `vite-plugins/compression.js`

2. **Easter Egg Runtime** (orchestrates 10+ modules)
   - **Status:** ✅ Well-separated concerns
   - **Recommendation:** No changes needed

### Unused Files (Candidates)

- `js/utils/video-*-lazyload.js` (7 similar files)
  - **Note:** May be project-specific; requires runtime analysis to confirm

---

## 📝 File Classification

### JavaScript Files by Category

**Core (9):**
- navigation.js, scroll.js, scroll-manager.js, animations.js, cursor.js, mouse-tilt.js, page-transitions.js, service-worker.js, three-hero.js

**Utils (18):**
- accessibility.js, env.js, error-handler.js, interactions.js, performance.js, ripples-lazyload.js, three-loader.js, toast.js, dynamic-prefetch.js, web-worker-helper.js, lazy-background-images.js, [7 video-lazyload variants]

**Pages (4):**
- contact.js, services.js, projects.js, reports.js

**Easter Egg (13):**
- easter-egg.js, runtime.js, celestial-textures.js, texture-wrapping.js, procedural-noise.js, celestial-mechanics.js, camera-controls.js, galaxy-generator.js, star-field.js, lighting-atmosphere.js, nebula-clouds.js, particle-effects.js, post-processing.js

### CSS Files by Category

**Components (20):**
- navigation, hero, buttons, cards (9 submodules), footer, forms (4 submodules), cta, parallax, back-to-top, modals, alerts, service-worker, badges, tables, tabs, accordions, tooltips, typography, breadcrumbs, toast

**Pages (4):**
- contact (6 submodules), projects (2 submodules), about, reports

**Utils (13):**
- animations, cursor, 3d-effects, fluid-effects, loading, empty-state, dividers, skip-link, _responsive-breakpoints, _responsive-images, _fluid-typography, _performance-optimizations, responsive

**Easter Egg (1):**
- easter-egg.css

### Scripts by Category

**Optimization (6):**
- optimize-images.js, optimize-video.js, convert-poster-formats.js, generate-responsive-images.js, subset-fonts.js, inline-critical-css.js

**Analysis (11):**
- analyze-bundle-size.js, analyze-critical-css.js, analyze-font-loading.js, analyze-important.js, analyze-remaining-opportunities.js, analyze-specificity.js, audit-font-declarations.js, css-inventory.js, font-inventory.js, find-duplicate-selectors.js, find-hardcoded-values.js

**Reporting (6):**
- generate-coverage-report.js, generate-dashboard-reports.js, generate-media-inventory.js, generate-performance-timeline.js, generate-pwmetrics-report.js, run-pa11y-report.js

**SEO (4):**
- generate-sitemap.js, generate-seo-meta.js, generate-structured-data.js, update-html-seo.js

**Migration (5):**
- enhance-variables-and-replace.js, migrate-font-values.js, migrate-high-priority-spacing.js, replace-hardcoded-values.js, split-cards-css.js

**Utilities (3):**
- find-chrome-path.js, delete-unused-fonts.js, unregister-service-worker.js

**Shell (3):**
- subset-fonts-with-glyphhanger.sh, subset-fonts-with-glyphhanger.ps1, test-fonts.ps1

---

## 🛠️ Generate Tool (Standalone)

The `generate/` directory contains a standalone social media image generator tool:

- **HTML:** `generate.html` (main interface), `preview-popout-window.html`
- **CSS:** 8 modules (base, layout, controls, color-picker, canvas, tabs, toast, skeleton)
- **JavaScript:** 31 modules
  - Main: `main.js` (orchestrator)
  - Core: config, preview, export, background-patterns, color-picker, history, preset-storage, templates
  - UI: grid-overlay, ruler-guides, preview-popout, tabs, various dropdowns and tooltips
  - Utils: export-high-res, dither-worker, toast

**Dependencies:**
- `html-to-image` ^1.11.13 (runtime)

---

## 🔐 Security & SEO

### Security Headers
- Meta tags in HTML (X-Content-Type-Options, CSP, etc.)
- Server configs: `.htaccess` (Apache), `_headers` (Netlify/Vercel), `nginx.conf.example`

### SEO Features
- Meta tags (Open Graph, Twitter Cards)
- Structured data (JSON-LD)
- Sitemap (`sitemap.xml`)
- Robots.txt
- Comprehensive favicon implementation

---

## 📊 Statistics Summary

| Category | Count |
|----------|-------|
| JavaScript Modules | 45 |
| CSS Modules | 64 |
| HTML Pages | 9 |
| Build Scripts | 39 |
| Config Files | 14 |
| Runtime Dependencies | 2 |
| Dev Dependencies | 20 |
| Core JS Modules | 9 |
| Utils JS Modules | 18 |
| Pages JS Modules | 4 |
| Easter Egg JS Modules | 13 |
| CSS Components | 20 |
| CSS Pages | 4 |
| CSS Utils | 13 |

---

## 🎓 Key Takeaways

1. **Modular Architecture:** Well-organized ES6 modules and CSS modules
2. **Lazy Loading:** Non-critical modules loaded on idle
3. **Clean URLs:** All internal links use clean URLs (no .html extensions)
4. **Build System:** Comprehensive Vite setup with custom plugins
5. **Easter Egg:** Complex 3D galaxy feature with 13 well-separated modules
6. **Generate Tool:** Standalone image generator with 31 modules
7. **No Circular Dependencies:** All import/export relationships are acyclic
8. **High Reusability:** Utils like `env.js` appropriately shared across modules

---

## 📚 Related Documentation

- `.cursor/rules/cursorrules.mdc` - Complete project rules and structure guide
- `docs/README.md` - Documentation index
- `docs/BUILD_AND_DEPLOY.md` - Build and deployment guide
- `docs/STYLE_GUIDE.md` - Design system and component guidelines

---

**Last Updated:** 2025-01-30  
**Generated By:** Cursor AI Codebase Mapping Tool

