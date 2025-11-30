# Project Commands Reference

Quick reference for common commands and tasks in the Logi-Ink project.

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for GitHub Pages (relative assets + SW disabled)
npm run build:gh-pages

# Build GitHub Pages bundle in dist-gh-pages/ (CI artefact)
npm run build:gh-pages:ci

# Produce both standard and GitHub Pages bundles
npm run build:dual

# Preview production build (http://127.0.0.1:4173/)
npm run preview

# Clean dist/ and Vite cache
npm run clean
```

> `npm run clean` uses `rm -rf`; on Windows run via Git Bash/WSL or substitute with `rimraf` if needed.

---

## 🛠️ Optimisation & Utilities

```bash
# Compress and optimise existing images
npm run optimize-images

# Generate responsive AVIF/WebP sets + HTML snippets
npm run responsive-images

# Optimise hero/background videos + poster frames
npm run optimize-video

# Convert poster frames to multiple formats
npm run convert-poster

# Analyse font usage prior to subsetting
npm run subset-fonts

# Inline critical CSS (run after build)
npm run inline-critical-css

# Rebuild sitemap.xml from current routes
npm run generate-sitemap

# Generate media inventory HTML + JSON under reports/
npm run reports:media
```

---

## 📊 Reports & Dashboard

The operational reports dashboard lives at `reports.html` (built to `dist/reports.html`). It is **not linked from the main navigation**; open it directly (e.g. `http://127.0.0.1:4173/reports.html`).

### One-shot refresh

```bash
# Build, run Lighthouse (main + PWA) + Pa11y, rebuild media inventory,
# run Playwright smoke tests, regenerate coverage + performance timeline,
# then rebuild so dist/reports/ is fully up to date.
npm run reports:all
```

### Individual report scripts

```bash
# Run Lighthouse CI (main config) – emits HTML + JSON into .lighthouseci/
npm run reports:lighthouse

# Run Pa11y accessibility audit – writes reports/seo-pa11y.html
npm run reports:pa11y

# Generate route coverage snapshot – writes reports/coverage/index.html
npm run reports:coverage

# Generate performance timeline from the latest Lighthouse JSON – writes reports/performance-timeline.html
npm run reports:performance

# Generate media inventory dashboard + JSON – writes reports/media-inventory.{html,json}
npm run reports:media

# Orchestrate Vite preview + Lighthouse (main + PWA) + Pa11y,
# then sync reports/lighthouse-report.html, reports/pwa-audit.html, and reports/seo-audit.html
npm run reports:dashboard

# OPTIONAL: Run PWMetrics and emit pwmetrics.{json,html} under reports/
# (not wired into the reports dashboard UI; for ad-hoc analysis)
npm run reports:pwmetrics
```

Typical manual flow if `reports:all` fails or you want to see intermediate outputs:

```bash
npm run build
npm run reports:dashboard
npm run reports:media
npm run reports:coverage
npm run reports:performance
npm run test:e2e:only
npm run build
```

Then:

```bash
npm run preview
# open http://127.0.0.1:4173/reports.html
```

---

## 🧹 Quality Gates

```bash
# Format with Prettier
npm run format

# Check formatting only
npm run format:check

# Lint ES modules (js/**/*.js)
npm run lint
npm run lint:fix

# Run format check + lint sequentially
npm run validate
```

---

## 🧪 Testing

```bash
# Run Playwright smoke tests (builds production output first)
npm run test:e2e

# Run Playwright suite without rebuilding (assumes a fresh build already exists)
npm run test:e2e:only

# Install Playwright browsers (first run only)
npx playwright install
```

Manual QA helpers:

- `http://localhost:3000/tests/test-service-worker.html`
- `http://localhost:3000/tests/test-fonts.html`

Coverage: multi-page navigation (desktop + mobile drawer), scroll progress/back-to-top, services modal lifecycle, contact form validation (happy + invalid), service worker registration toast.

---

## 📝 Common Tasks

### Adding a New Component

1. Create CSS in `css/components/component-name.css` (or subdirectory with `index.css` for complex components).
2. Import it in `css/main.css` using `@import './components/component-name.css'` syntax (without `url()`).
3. If JS is required, add a module in `js/core/` or `js/utils/`.
4. Export an `init...` function and wire it up in `js/main.js`.
5. Update `.cursor/rules/cursorrules.mdc` with the new structure.

### Working with the Galaxy Easter Egg

The galaxy easter egg is organized in a dedicated folder for better maintainability:

- **`js/easter-egg/easter-egg.js`** - Trigger/initialization (logo clicks, footer trigger)
- **`js/easter-egg/runtime.js`** - Milky Way 3D scene runtime (Three.js scene, animation, controls, single wrapper UI hiding/restoration, navbar/footer handling)
- **`js/easter-egg/celestial-textures.js`** - Main texture generator (sun, moon, planets) - accepts THREE parameter, uses MIN_POLE_SCALE_THRESHOLD constant
- **`js/easter-egg/texture-wrapping.js`** - Seamless wrapping utilities (featherPoles for pole distortion, isSafeForPolePlacement, multi-pixel blending)
- **`js/easter-egg/procedural-noise.js`** - Procedural noise generation (fractal, seamless, 3D noise support)
- **`js/easter-egg/celestial-mechanics.js`** - Orbital mechanics (calculateKeplerianOrbitalSpeedApproximation, calculateLagrangePoints returns plain objects for module purity, deltaTime support)
- **`js/easter-egg/camera-controls.js`** - Camera animation and orbital controls (optimized THREE checks)
- **`js/easter-egg/galaxy-generator.js`** - Multi-layer galaxy generation (spatial hash grid optimization for O(1) neighbor lookup)
- **`js/easter-egg/lighting-atmosphere.js`** - Dynamic lighting (initial camera position parameter to prevent first-frame glitches)
- **`js/easter-egg/particle-effects.js`** - Particle systems (frame-rate independent with deltaTime, squared distance checks)
- **`js/easter-egg/post-processing.js`** - Post-processing effects (recursive raycasting for accurate DoF, standardized ES module imports)
- **`css/easter-egg/easter-egg.css`** - Styles for vortex effect and Milky Way scene (simplified selectors, single wrapper approach)

**Key Features:**
- Textures use equirectangular projection (2:1 aspect ratio) for optimal sphere mapping
- Lower initial resolution for faster loading (0.5x default, upgradeable)
- Seamless horizontal wrapping with multi-pixel blending
- Pole-aware feature placement and radius scaling to minimize distortion (featherPoles utility)
- Seamless noise functions for path generation (cracks, mountains) to prevent visible seams
- Quadratic feature count scaling for consistent visual density across resolution levels
- Texture caching to avoid regeneration
- Advanced blending modes (e.g., `lighter` for atmospheric clouds)
- Frame-rate independent animations (all particle systems and mechanics use deltaTime)
- Module purity (celestial-mechanics.js math functions are framework-agnostic)
- Optimized performance (spatial hash grid for particle distribution, squared distance checks)
- Accurate depth of field (recursive raycasting for nested scene hierarchies)

### Modifying Colors

- Edit `css/variables.css` only (all components reference tokens).

### Adding a New Page

1. Create the HTML file at the repository root.
2. Add page-specific CSS in `css/pages/` if needed (use subdirectory with `index.css` for complex pages like contact/projects).
3. Add page-specific JS in `js/pages/` if required.
4. Import the CSS in `css/main.css` using `@import './pages/page-name.css'` syntax.
5. Conditionally initialise the JS in `js/main.js`.
6. Include the page-transition preload snippet in `<head>` (see `.cursor/rules/cursorrules.mdc`).
7. Link CSS in HTML: `<link rel="stylesheet" href="css/main.css" />` (CSS is also imported in `js/main.js` for Vite compatibility).
8. Use HTML includes for navigation and footer:
   - Add `<!-- include partials/navbar.html -->` where navigation should appear
   - Add `<!-- include partials/footer.html -->` where footer should appear
   - Active navigation states are handled automatically by `js/core/navigation.js`

---

## 🔧 Build Configuration

- `vite.config.js` – multipage build pipeline, plugins, compression, manual chunks, report copying.
- `postcss.config.cjs` – PurgeCSS scaffold (currently disabled; CSS purge is disabled).
- `package.json` – scripts and dependency manifest.
- `eslint.config.js` – ESLint v9 flat config.
- `playwright.config.js` – Playwright webServer + device matrix.

## ⚡ Performance Optimizations

The project includes several performance optimizations:

- **Font Loading:** Critical fonts (Orbitron Regular, Rajdhani Regular) use `font-display: swap`, non-critical variants use `font-display: optional` to prevent layout shift.
- **Image Optimization:** Images use `fetchpriority="high"` for LCP candidates, `fetchpriority="low"` for below-the-fold, and `decoding="async"` to prevent main thread blocking.
- **Service Worker:** Optimized cache strategy with `stale-while-revalidate` for hashed assets (CSS/JS) and `cache-first` for truly static assets (images, fonts).
- **Resource Hints:** Dynamic prefetching on link hover/focus, modulepreload for critical ES modules, preconnect for third-party resources.
- **Analytics:** Plausible analytics loads after page load event to reduce impact on Core Web Vitals.
- **Video Lazy Loading:** Background videos use `loading="lazy"` attribute.

See `docs/PERFORMANCE_OPTIMIZATION_ANALYSIS.md` for detailed recommendations.

---

## 📚 Documentation

- `.cursor/rules/cursorrules.mdc` – MUST READ FIRST (authoritative rules and structure).
- `docs/BUILD_AND_DEPLOY.md` – Detailed build/deploy workflows.
- `docs/QUICK_START.md` – Three-step onboarding checklist.
- `docs/STYLE_GUIDE.md` – Design system and interaction patterns.
- `docs/project_commands.md` – This file.
- `docs/TODO.MD` – Outstanding documentation and analytics follow-ups.

