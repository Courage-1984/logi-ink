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

# Produce both standard and GitHub Pages bundles
npm run build:dual

# Preview production build (http://localhost:4173/)
npm run preview

# Clean dist/ and Vite cache
npm run clean
```

## 🛠️ Optimisation & Utilities

```bash
# Compress and optimise existing images
npm run optimize-images

# Generate responsive AVIF/WebP sets + HTML snippets
npm run responsive-images

# Optimise hero/background videos + poster frames
npm run optimize-video

# Analyse font usage prior to subsetting
npm run subset-fonts

# Inline critical CSS (run after build)
npm run inline-critical-css

# Rebuild sitemap.xml from current routes
npm run generate-sitemap
```

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

## 📦 Dependencies

```bash
# Install dependencies
npm install

# Update dependencies (use with caution)
npm update
```

## 🔍 Build Analysis

After `npm run build`, open `dist/stats.html` to inspect bundle composition, gzip/brotli sizes, and manual chunking output. When using `npm run build:dual`, open `dist-gh-pages/stats.html` to review the GitHub Pages bundle as well.

## 🧪 Testing

```bash
# Run Playwright smoke tests (builds production output first)
npm run test:e2e

# Install Playwright browsers (first run only)
npx playwright install
```

Manual QA helpers:
- `http://localhost:3000/tests/test-service-worker.html`
- `http://localhost:3000/tests/test-fonts.html`

Coverage: multi-page navigation (desktop + mobile drawer), scroll progress/back-to-top, services modal lifecycle, contact form validation (happy + invalid), service worker registration toast.

## 📝 Common Tasks

### Adding a New Component
1. Create CSS in `css/components/component-name.css`
2. Import it in `css/main.css`
3. If JS is required, add a module in `js/core/` or `js/utils/`
4. Export an `init...` function and wire it up in `js/main.js`
5. Update `.cursor/rules/cursorrules.mdc` with the new structure

### Modifying Colors
- Edit `css/variables.css` only (all components reference tokens)

### Adding a New Page
1. Create the HTML file at the repository root
2. Add page-specific CSS in `css/pages/` if needed
3. Add page-specific JS in `js/pages/` if required
4. Import the CSS in `css/main.css`
5. Conditionally initialise the JS in `js/main.js`

## 🔧 Build Configuration

- `vite.config.js` – build pipeline, plugins, compression, manual chunks
- `postcss.config.cjs` – PurgeCSS scaffold (disabled by default; review safelist first)
- `package.json` – scripts and dependency manifest
- `eslint.config.js` – ESLint v9 flat config

## 📚 Documentation

- `.cursor/rules/cursorrules.mdc` – MUST READ FIRST (authoritative rules)
- `docs/BUILD_AND_DEPLOY.md` – detailed build/deploy workflows
- `docs/QUICK_START.md` – three-step onboarding checklist
- `docs/STYLE_GUIDE.md` – design system and interaction patterns
- `docs/documentation-audit-progress.md` – current status of documentation maintenance

