# Logi-Ink Website

A cyberpunk-inspired marketing site for the Logi-Ink digital agency. The site ships as static HTML, modular CSS, and ES6 modules bundled with Vite, featuring rich motion design, PWA support, and automated optimisation tooling.

> **Must read first:** [.cursor/rules/cursorrules.mdc](.cursor/rules/cursorrules.mdc) is the canonical source for architecture, naming, and workflow rules. Keep it updated whenever structure changes.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20.x** (see `.nvmrc`; run `nvm use` if you have nvm installed)
- **npm 10+** (bundled with Node 20)
- Optional: `npx playwright install` (one-time) to run the smoke e2e tests

### Setup
```bash
npm install             # install dependencies
npm run dev             # dev server with HMR at http://localhost:3000

# Optional environment override for subdirectory deploys
echo "VITE_BASE_PATH=/your-path/" > .env

npm run build           # production build (outputs to dist/)
npm run preview         # serve built files at http://localhost:4173
```

For a static preview without the toolchain you can open `index.html` directly in a browser, but service worker behaviour, module loading, and routing previews require the dev server.

---

## 📁 Directory Overview
```
logia-ink/
├── .cursor/
│   └── rules/cursorrules.mdc     # Project rules & architecture guide (authoritative)
├── assets/
│   ├── fonts/                    # Self-hosted Orbitron & Rajdhani subsets
│   ├── images/                   # Backgrounds, banners, logos, responsive variants
│   └── video/                    # Optimised hero/background videos + poster frames
├── css/
│   ├── main.css                  # Imports variables → base → components → pages → utils
│   ├── variables.css             # Color tokens, spacing, shadows, breakpoints
│   ├── components/               # 19 component styles (buttons, cards, toast, etc.)
│   ├── pages/                    # Page-specific overrides (about, contact, projects)
│   └── utils/                    # 10 utility/animation bundles (responsive last)
├── docs/
│   ├── BUILD_AND_DEPLOY.md
│   ├── QUICK_START.md
│   ├── STYLE_GUIDE.md
│   ├── project_commands.md
│   ├── documentation-audit-progress.md
│   ├── IMAGE_GENERATION_PROMPTS.md
│   └── VIDEO_BACKGROUND_GUIDE.md
├── js/
│   ├── main.js                   # Boots core modules and page-specific logic
│   ├── core/                     # 10 core modules (navigation, scroll, three-hero, etc.)
│   ├── utils/                    # 7 utilities (interactions, toast, performance, env, …)
│   └── pages/                    # Page hooks (contact form, services modals)
├── scripts/
│   ├── optimize-images.js
│   ├── optimize-video.js
│   ├── generate-responsive-images.js
│   ├── inline-critical-css.js
│   ├── generate-sitemap.js
│   ├── generate-seo-meta.js
│   ├── generate-structured-data.js
│   ├── subset-fonts.js
│   ├── test-fonts.ps1
│   ├── subset-fonts-with-glyphhanger.{sh,ps1}
│   └── update-html-seo.js
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
├── sw.js
├── CHANGELOG.md
├── README.md
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── site.webmanifest
├── vite.config.js
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

| Category | Script | Description |
| --- | --- | --- |
| Development | `npm run dev` | Vite dev server with HMR |
|  | `npm run build` | Production build (terser minification, hashed assets) |
|  | `npm run preview` | Serve `dist/` locally |
| Quality | `npm run format` / `format:check` | Prettier formatting |
|  | `npm run lint` / `lint:fix` | ESLint (flat config) over `js/**/*.js` |
|  | `npm run validate` | Combines `format:check` + `lint` |
| Testing | `npm run test:e2e` | Build then run Playwright smoke suite |
| Optimisation | `npm run optimize-images` | Lossy image optimisation with Sharp |
|  | `npm run optimize-video` | Transcodes hero videos + poster frames |
|  | `npm run responsive-images` | Generate AVIF/WebP responsive sets + snippets |
|  | `npm run inline-critical-css` | Extract & inline critical CSS (post-build) |
|  | `npm run subset-fonts` | Inspect usage and prep font subsetting |
|  | `npm run generate-sitemap` | Regenerate `sitemap.xml` |
| Maintenance | `npm run clean` | Remove `dist/` and Vite cache |

Manual utilities in `scripts/` (run via `node scripts/<name>.js`) help with SEO metadata, structured data, and automated HTML updates.

---

## 🧱 Architecture Highlights

- **Static HTML pages:** `index`, `about`, `services`, `projects`, `pricing`, `seo-services`, `contact` (all include security headers, SEO meta, JSON-LD, accessibility scaffolding, and service worker hook).
- **CSS:** Modular imports from `main.css` with strict ordering (variables → base → components → pages → utilities). Animations/utilities live under `css/utils/` with `responsive.css` last for overrides.
- **JavaScript:** `js/main.js` wires 10 core modules (navigation, scroll manager, animations, cursor, mouse tilt, easter egg, page transitions, service worker, three.js hero, performance) and conditionally boots page modules (`contact`, `services`). Utilities include accessibility helpers, toast system, interaction effects, performance + web vitals tracking, and environment detection.
- **Assets:** Self-hosted fonts (WOFF2 subsets), optimised images (WebP/AVIF) with responsive variants, and pre-optimised hero videos.
- **PWA:** `sw.js` handles caching and update prompts; `site.webmanifest` defines install metadata; favicons and manifest icons copied directly in the Vite build via a custom plugin.

---

## 🔬 Testing & QA

- **Playwright smoke suite** (`tests/e2e/smoke.spec.js`) covers:
  - Global navigation (desktop + mobile drawer)
  - Back-to-top + scroll progress synchronisation
  - Services modal open/close (button + keyboard/Escape)
  - Contact form validation (happy path + error states)
  - Service worker registration flow
- **Manual utilities:** `tests/test-fonts.html` and `tests/test-service-worker.html` help verify font loading and service worker behaviour during development.
- **Setup:** Run `npx playwright install` once before using `npm run test:e2e`.

---

## ⚙️ Config Reference

| File | Purpose |
| --- | --- |
| `vite.config.js` | Multi-page build, asset copy plugins, terser settings, gzip/brotli, bundle visualiser |
| `postcss.config.cjs` | PurgeCSS scaffold (currently disabled; keep safelist updated before re-enabling) |
| `eslint.config.js` | ESLint v9 flat config (extends `@eslint/js`) |
| `.prettierrc` | Prettier formatting rules |
| `.editorconfig` | Editor defaults (spacing, line endings) |
| `.npmrc`, `.gitattributes` | Registry + line ending consistency |
| `playwright.config.js` | Browser/device matrix for smoke suite |
| `site.webmanifest` | PWA metadata and shortcuts |

---

## 📊 Performance & Features Checklist

- ✅ Critical CSS extraction script (`npm run inline-critical-css`)
- ✅ Gzip + Brotli assets (via `vite-plugin-compression`)
- ✅ Image optimisation & responsive sources (`vite-plugin-imagemin` + Sharp scripts)
- ✅ Console stripping via terser in production
- ✅ Manual chunking for vendor bundles (with special-case handling for Three.js)
- ✅ Web Vitals + navigation timing sent to Plausible (see `js/utils/performance.js`)
- ✅ Dynamic Three.js loader with SRI support (`js/utils/three-loader.js`)
- ✅ Service worker update toast (`css/components/service-worker.css`)

See `docs/BUILD_AND_DEPLOY.md` for deployment performance checklist (cache headers, Lighthouse targets, etc.).

---

## 📚 Documentation

- `docs/documentation-audit-progress.md` – live tracker for the ongoing documentation refresh
- `docs/BUILD_AND_DEPLOY.md` – detailed build → deploy workflow (including Netlify, Vercel, Docker options)
- `docs/QUICK_START.md` – fast onboarding cheatsheet
- `docs/project_commands.md` – single-page command reference
- `docs/STYLE_GUIDE.md` – design system, component markup, animation patterns
- `docs/IMAGE_GENERATION_PROMPTS.md` – Midjourney/DALL·E prompts for art direction
- `docs/VIDEO_BACKGROUND_GUIDE.md` – workflow for creating and optimising hero videos

`CHANGELOG.md` tracks release history; update alongside major feature or tooling shifts.

---

## 🛡️ Security, SEO & Accessibility

- Security headers mirrored in HTML plus server configs (`.htaccess`, `_headers`, `nginx.conf.example`)
- CSP tuned for self-hosted assets; ready for SRI if external resources are introduced
- SEO: canonical URLs, Open Graph/Twitter meta, JSON-LD (Organization, Service, FAQ, Breadcrumbs, Contact)
- Accessibility: skip links, ARIA live region, focus management, reduced motion support, semantic markup
- Analytics: Plausible script embedded; Web Vitals + navigation metrics auto-published as custom events

---

## 📌 Additional Notes

- Contact form currently surfaces a success toast; integrate with your preferred backend (e.g., Formspree, Netlify Forms, custom API) for production.
- Animations prefer `transform`/`opacity` for GPU acceleration; test new effects against `prefers-reduced-motion`.
- When adding or relocating files, update `.cursor/rules/cursorrules.mdc` and relevant docs to keep the architecture guide authoritative.

---

## 📄 License

This project is proprietary and confidential. Redistribution or reuse requires written permission from Logi-Ink.
