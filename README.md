# Logi-Ink Website

A cyberpunk-inspired marketing site for the Logi-Ink digital agency. The site ships as static HTML, modular CSS, and ES6 modules bundled with Vite, featuring rich motion design, PWA support, and an operational reports dashboard.

> **Must read first:** `.cursor/rules/cursorrules.mdc` is the canonical source for architecture, naming, and workflow rules. Keep it updated whenever structure or tooling changes.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20.x** (see `.nvmrc`; run `nvm use` if you use nvm)
- **npm 10+** (bundled with Node 20)
- Optional: `npx playwright install` (one-time) to run the smoke e2e tests

### Setup

```bash
npm install             # install dependencies
npm run dev             # dev server with HMR at http://localhost:3000

# Optional environment override for subdirectory deploys
echo "VITE_BASE_PATH=/your-path/" > .env

npm run build           # production build (outputs to dist/)
npm run preview         # serve built files at http://127.0.0.1:4173
```

For a static preview without the toolchain you can open `index.html` directly in a browser, but service worker behaviour, ES modules, and page transitions require the dev/preview server.

---

## 📁 Directory Overview

```text
logi-ink/
├── .cursor/
│   └── rules/cursorrules.mdc     # Project rules & architecture guide (authoritative)
├── assets/
│   ├── fonts/                    # Self-hosted Orbitron & Rajdhani subsets
│   ├── images/                   # Backgrounds, banners, logos, responsive variants
│   ├── audio/                    # Audio assets (space ambience for easter egg)
│   └── video/                    # Optimised hero/background videos + poster frames
├── css/
│   ├── main.css                  # Imports variables → base → components → pages → utils
│   ├── variables.css             # Color tokens, spacing, shadows, breakpoints
│   ├── base.css                  # Reset + typography
│   ├── fonts.css                 # @font-face declarations for self-hosted fonts
│   ├── critical.css              # Above-the-fold styles (used by build tooling)
│   ├── components/               # 20 component styles (buttons, cards, toast, etc.)
│   ├── pages/                    # Page-specific overrides (about, contact, projects, reports)
│   └── utils/                    # 10 utility/animation bundles (responsive last)
├── docs/
│   ├── BUILD_AND_DEPLOY.md
│   ├── QUICK_START.md
│   ├── STYLE_GUIDE.md
│   ├── project_commands.md
│   ├── README.md                 # Documentation index
│   ├── TODO.MD
│   ├── IMAGE_GENERATION_PROMPTS.md
│   └── VIDEO_BACKGROUND_GUIDE.md
├── js/
│   ├── main.js                   # Boots core modules and page-specific logic
│   ├── core/                     # 9 core modules (navigation, scroll, three-hero, etc.)
│   ├── easter-egg/               # Galaxy easter egg feature (dedicated folder)
│   │   ├── easter-egg.js         # Trigger/initialization
│   │   ├── runtime.js            # Milky Way 3D scene runtime
│   │   ├── celestial-textures.js # Procedural texture generation
│   │   ├── texture-wrapping.js   # Seamless texture wrapping utilities
│   │   ├── procedural-noise.js   # Procedural noise generation
│   │   ├── celestial-mechanics.js # Orbital mechanics and planet configuration
│   │   ├── camera-controls.js    # Camera animation and orbital controls
│   │   ├── galaxy-generator.js   # Multi-layer galaxy generation
│   │   ├── star-field.js         # Background star field generation
│   │   ├── lighting-atmosphere.js # Dynamic lighting and atmospheric effects
│   │   ├── nebula-clouds.js      # Nebula and interstellar medium effects
│   │   ├── particle-effects.js   # Asteroid belts, comets, solar wind, space dust
│   │   └── post-processing.js   # Post-processing effects (bloom, depth of field)
│   ├── utils/                    # 8 utilities (accessibility, interactions, toast, performance, env, error handler, three-loader, ripples lazy-load)
│   └── pages/                    # Page hooks (contact form, services modals, projects, reports dashboard)
├── partials/                     # HTML partials (included at build time via Vite plugin)
│   ├── navbar.html               # Navigation component (used across all pages)
│   └── footer.html               # Footer component (used across all pages)
├── scripts/
│   ├── optimize-images.js
│   ├── optimize-video.js
│   ├── generate-responsive-images.js
│   ├── inline-critical-css.js
│   ├── generate-sitemap.js
│   ├── generate-seo-meta.js
│   ├── generate-structured-data.js
│   ├── subset-fonts.js
│   ├── subset-fonts-with-glyphhanger.{sh,ps1}
│   ├── test-fonts.ps1
│   ├── generate-media-inventory.js
│   ├── generate-dashboard-reports.js
│   ├── generate-coverage-report.js
│   ├── generate-performance-timeline.js
│   ├── generate-pwmetrics-report.js
│   └── run-pa11y-report.js
├── reports/                      # Source reports (copied to dist/reports/ on build)
│   ├── bundle-report.html        # Rollup visualizer treemap (from Vite build)
│   ├── bundle-stats.json         # Raw Rollup bundle stats
│   ├── coverage/
│   │   └── index.html            # Route coverage snapshot (from smoke.spec.js)
│   ├── lighthouse-report.html    # Latest full Lighthouse HTML report
│   ├── pwa-audit.html            # PWA-only Lighthouse HTML report
│   ├── performance-timeline.html # (Currently unused; superseded by Lighthouse embed)
│   ├── seo-pa11y.html            # Pa11y HTML output
│   ├── seo-audit.html            # Wrapper embedding Pa11y report
│   ├── media-inventory.html      # Asset inventory dashboard
│   ├── media-inventory.json      # Asset inventory data
│   └── stats.html                # Legacy stats view (copied from dist/stats.html)
├── tests/
│   ├── e2e/smoke.spec.js         # Playwright smoke suite
│   ├── test-fonts.html
│   └── test-service-worker.html
├── about.html
├── contact.html
├── index.html
├── pricing.html
├── projects.html
├── seo-services.html
├── services.html
├── reports.html                  # Reports dashboard (not linked from nav; direct URL only)
├── sw.js
├── CHANGELOG.md
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── site.webmanifest
├── vite.config.js
├── vite-plugin-html-include.js  # Custom Vite plugin for HTML includes
├── eslint.config.js
├── playwright.config.js
├── robots.txt
├── sitemap.xml
├── _headers
├── .htaccess
├── nginx.conf.example
└── dist/                         # Generated build output (kept for reference)
```

Additional tooling/config: `.editorconfig`, `.prettierrc`, `.npmrc`, `.gitattributes`, `.vscode/`.

---

## 🧰 npm Scripts & Tooling

| **Category**   | **Script**                    | **Description**                                                                 |
| -------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| **Dev**        | `npm run dev`                 | Vite dev server with HMR (port 3000)                                           |
|                | `npm run build`               | Production build (terser minification, hashed assets)                          |
|                | `npm run build:gh-pages`      | Build for GitHub Pages (relative paths, SW disabled)                           |
|                | `npm run build:gh-pages:ci`   | GitHub Pages build to `dist-gh-pages/` (CI artefact)                           |
|                | `npm run build:dual`          | Run standard build + GitHub Pages build sequentially                           |
|                | `npm run preview`             | Serve `dist/` locally (http://127.0.0.1:4173)                                  |
| **Quality**    | `npm run format`              | Format with Prettier                                                           |
|                | `npm run format:check`        | Check formatting only                                                          |
|                | `npm run lint` / `lint:fix`   | ESLint (flat config) over `js/**/*.js`                                         |
|                | `npm run validate`            | `format:check` + `lint`                                                        |
| **Testing**    | `npm run test:e2e`            | Build, then run Playwright smoke suite                                         |
|                | `npm run test:e2e:only`       | Run Playwright against an existing build (re-uses `npm run preview` webServer) |
| **Optimisation** | `npm run optimize-images`   | Lossy image optimisation with Sharp                                            |
|                | `npm run optimize-video`      | Transcode hero videos + poster frames                                          |
|                | `npm run responsive-images`   | Generate AVIF/WebP responsive sets + HTML snippets                             |
|                | `npm run subset-fonts`        | Analyse font usage prior to subsetting                                         |
|                | `npm run inline-critical-css` | Extract & inline critical CSS (post-build)                                     |
|                | `npm run generate-sitemap`    | Regenerate `sitemap.xml`                                                       |
| **Reports**    | `npm run reports:lighthouse`  | Run Lighthouse CI using `lighthouserc.json` (HTML + JSON into `.lighthouseci`) |
|                | `npm run reports:pa11y`       | Run Pa11y and emit `reports/seo-pa11y.html`                                    |
|                | `npm run reports:coverage`    | Regenerate synthetic route coverage snapshot at `reports/coverage/index.html`  |
|                | `npm run reports:performance` | Build `reports/performance-timeline.html` from latest Lighthouse JSON          |
|                | `npm run reports:media`       | Rebuild media inventory HTML/JSON under `reports/`                             |
|                | `npm run reports:dashboard`   | Orchestrate preview, Lighthouse (main + PWA) and Pa11y, then sync HTML reports |
|                | `npm run reports:all`         | Build → dashboard → media → e2e tests → coverage/perf → final build           |
| **Optional**   | `npm run reports:pwmetrics`   | Run PWMetrics and emit `reports/pwmetrics.{json,html}` (not wired into UI)     |
| **Maintenance** | `npm run clean`             | Remove `dist/` and Vite cache (`node_modules/.vite`)                           |

> The **reports dashboard** lives at `reports.html` (built to `dist/reports.html`). It is **not linked from the main nav** and is intended as an internal health/QA hub.

---

## 🧱 Architecture Highlights

- **Static HTML pages:** `index`, `about`, `services`, `projects`, `pricing`, `seo-services`, `contact`, plus a dedicated `reports.html` dashboard.
- **HTML Includes:** Navigation and footer are modularized via `partials/navbar.html` and `partials/footer.html`, included at build time using a custom Vite plugin (`vite-plugin-html-include.js`). Pages use `<!-- include partials/navbar.html -->` comments which are processed during the build.
- **CSS:** Modular imports from `main.css` with strict ordering (variables → base → components → pages → utilities). Animations/utilities live under `css/utils/` with `responsive.css` last for overrides.
- **JavaScript:** `js/main.js` wires 9 core modules (navigation, scroll manager, animations, cursor, mouse tilt, page transitions, service worker, three.js hero, performance) and conditionally boots page modules (`contact`, `services`, `projects`, `reports`). Navigation active states are handled dynamically by `js/core/navigation.js`.
- **Galaxy easter egg:** Interactive 3D galaxy feature organized in dedicated `js/easter-egg/` folder. Includes trigger/initialization (`easter-egg.js`), runtime (`runtime.js`), and modular texture system (`celestial-textures.js`, `texture-wrapping.js`, `procedural-noise.js`). Features realistic orbital mechanics (inclined orbits), optimized loading (reduced texture resolution, pre-loading Three.js, optimized particle generation), improved seamless texture wrapping for sphere mapping, and pole-aware feature scaling to correct equirectangular projection distortion.
- **Background video lazy-load:** `js/utils/ripples-lazyload.js` swaps hero/background video sources based on connection speed, viewport width, and codec support, only loading media once the container enters the viewport.
- **Page transitions:** A sessionStorage-backed preload flow (`js/core/page-transitions.js`) coordinates the blur/fade animation and relies on a small inline script in each HTML head to avoid flashes on navigation.
- **Assets:** Self-hosted fonts (WOFF2 subsets), optimised images (WebP/AVIF) with responsive variants, pre-optimised hero videos, and audio assets for the easter egg feature.
- **PWA:** `sw.js` handles caching and update prompts; `site.webmanifest` defines install metadata; comprehensive favicon implementation (SVG, multiple PNG sizes, ICO fallback, Apple Touch Icon, Windows Tiles, Safari Pinned Tab) ensures proper branding across all platforms and devices.
- **Reports dashboard:** `reports.html` surfaces bundle treemap/raw stats, synthetic coverage, Lighthouse, PWA audit, accessibility audit, media inventory, and legacy `stats.html` in a tabbed iframe interface.

---

## 📊 Reports Dashboard Overview

The reports hub (`reports.html`) is designed to be opened after running the reporting scripts. Tabs are **lazy-loaded** and show a placeholder until their backing artefact is present:

- **Bundle Treemap** → `dist/reports/bundle-report.html` (from `npm run build` via rollup-plugin-visualizer).
- **Bundle Raw Stats** → `dist/reports/bundle-stats.json` (also from `npm run build`).
- **Coverage** → `dist/reports/coverage/index.html` generated by `npm run reports:coverage`.
  - This is a *route coverage snapshot* derived from URLs hit inside `tests/e2e/smoke.spec.js`.
- **Lighthouse** → `dist/reports/lighthouse-report.html` from the main Lighthouse CI run inside `npm run reports:dashboard`.
- **Performance Timeline** → currently points at `dist/reports/lighthouse-report.html` as a convenient performance-focused view of the main Lighthouse report.
- **PWA Audit** → `dist/reports/pwa-audit.html`, produced by a PWA-only Lighthouse run (`lighthouserc.pwa.json`) inside `npm run reports:dashboard`.
- **Accessibility Audit** → `dist/reports/seo-audit.html`, which embeds Pa11y output from `reports/seo-pa11y.html` generated by `npm run reports:pa11y` (called by `reports:dashboard`).
- **Media Inventory** → `dist/reports/media-inventory.html` from `npm run reports:media`.
- **/stats.html** → `dist/reports/stats.html`, a mirrored copy of `dist/stats.html` for legacy bundle analysis.

Recommended one-shot refresh:

```bash
npm run reports:all
npm run preview
# then open http://127.0.0.1:4173/reports.html
```

---

## 🔬 Testing & QA

- **Playwright smoke suite** (`tests/e2e/smoke.spec.js`) covers:
  - Global navigation (desktop + mobile drawer)
  - Back-to-top + scroll progress synchronisation
  - Services modal open/close (button + keyboard/Escape)
  - Contact form validation (happy path + error states)
  - Service worker registration flow
- **Manual utilities:**
  - `http://localhost:3000/tests/test-service-worker.html`
  - `http://localhost:3000/tests/test-fonts.html`
- **Setup:** Run `npx playwright install` once before using `npm run test:e2e`.

---

## ⚙️ Config Reference

| **File**                   | **Purpose**                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `vite.config.js`           | Multi-page build, asset copy plugins, compression (Gzip/Brotli), bundle visualiser, HTML includes plugin                    |
| `vite-plugin-html-include.js` | Custom Vite plugin that processes `<!-- include partials/... -->` comments at build time |
| `postcss.config.cjs`       | PurgeCSS scaffold (currently disabled; update safelist before re-enabling)              |
| `eslint.config.js`         | ESLint v9 flat config (extends `@eslint/js`)                                             |
| `playwright.config.js`     | Playwright config; webServer points at `npm run preview` on port 4173                   |
| `lighthouserc.json`        | Main Lighthouse CI configuration (full categories, HTML + JSON into `.lighthouseci`)    |
| `lighthouserc.pwa.json`    | PWA-only Lighthouse CI configuration (for `reports/pwa-audit.html`)                     |
| `pwmetrics.config.cjs`     | PWMetrics config (used only by `reports:pwmetrics`, not wired into dashboard UI)        |
| `pa11y.config.json`        | Pa11y configuration (used by `reports:pa11y` / `reports:dashboard`)                     |
| `.editorconfig`            | Editor defaults (spacing, line endings)                                                  |
| `.prettierrc`              | Prettier formatting rules                                                                |
| `.npmrc`, `.gitattributes` | Registry + line ending consistency                                                       |
| `site.webmanifest`         | PWA metadata and shortcuts                                                               |
| `browserconfig.xml`        | Windows tile configuration (mstile icons)                                                |

---

## 🛡️ Security, SEO & Accessibility

- **Security:** HTML security meta tags plus server-side configs (`.htaccess`, `_headers`, `nginx.conf.example`). CSP is tuned for self-hosted assets and Plausible.
- **SEO:** Canonical URLs, Open Graph/Twitter meta tags, and JSON-LD (Organization, WebSite, Service, Breadcrumbs, FAQ, Contact) across core pages; sitemap/robots managed via `npm run generate-sitemap`.
- **Favicons:** Complete favicon implementation with SVG (modern browsers), multiple PNG sizes (16x16, 32x32, 48x48, 64x64), ICO fallback (legacy browsers), Apple Touch Icon (iOS), Windows Tiles (browserconfig.xml), Safari Pinned Tab, and Web App Manifest integration for optimal branding across all platforms.
- **Accessibility:** Skip links, ARIA live region, focus management, keyboard navigation, `prefers-reduced-motion` support, and an `accessibility.js` helper module.
- **Analytics & Performance:** Plausible is wired in, with additional Web Vitals reporting from `js/utils/performance.js`.

---

## 📚 Documentation

- `docs/BUILD_AND_DEPLOY.md` – Build/deploy workflow and environment notes
- `docs/QUICK_START.md` – Fast onboarding checklist
- `docs/project_commands.md` – Single-page command reference
- `docs/STYLE_GUIDE.md` – Design system, component markup, and animation patterns
- `docs/IMAGE_GENERATION_PROMPTS.md` – Prompts for on-brand imagery
- `docs/VIDEO_BACKGROUND_GUIDE.md` – Workflow for sourcing and optimising hero videos
- `docs/TODO.MD` – Outstanding documentation/analytics follow-ups

`CHANGELOG.md` tracks release history; update it alongside notable feature, tooling, or pipeline changes.

---

## 📌 Notes

- The **Reports** dashboard is intentionally treated as an internal tool: it's not in the main navigation and is expected to be driven by CI/local scripts.
- When adding or relocating files, update `.cursor/rules/cursorrules.mdc` and relevant docs so they stay in sync with the actual codebase.
- New pages must include the inline page-transition preload snippet in `<head>` (see `.cursor/rules/cursorrules.mdc`) so the blur/fade effect stays seamless.
- **HTML Includes:** Navigation and footer are managed via `partials/navbar.html` and `partials/footer.html`. Use `<!-- include partials/navbar.html -->` and `<!-- include partials/footer.html -->` in HTML files. Active navigation states are handled dynamically by JavaScript, so no page-specific variants are needed.

---

## 📄 License

This project is proprietary and confidential. Redistribution or reuse requires written permission from Logi-Ink.
