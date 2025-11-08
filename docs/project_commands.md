# Project Commands Reference

Quick reference for common commands and tasks in the Logi-Ink project.

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
# Note: Access at http://localhost:4173/ (base path configured in vite.config.js)
```

## 🛠️ Optimization Scripts

```bash
# Optimize images
npm run optimize-images

# Generate responsive images (AVIF/WebP)
npm run responsive-images

# Analyze fonts for subsetting
npm run subset-fonts

# Inline critical CSS
npm run inline-critical-css

# Generate sitemap.xml
npm run generate-sitemap
```

## 📦 Dependencies

```bash
# Install dependencies
npm install

# Update dependencies
npm update
```

## 🔍 Build Analysis

After building, check bundle analysis:
- Open `dist/stats.html` in browser
- View bundle composition, sizes, and compression ratios

## 🧪 Testing

```bash
# Test service worker
# Open http://localhost:3000/tests/test-service-worker.html

# Test fonts
# Open http://localhost:3000/tests/test-fonts.html

# Run Playwright smoke tests (builds production output first)
npm run test:e2e

# Coverage: cross-page navigation, mobile nav drawer, scroll utilities (progress + back-to-top),
# service modals (button & Escape close), contact form happy/invalid flows, service worker registration

# Install Playwright browsers (first run only)
npx playwright install
```

## 🔒 Security & SEO

```bash
# Generate sitemap.xml
npm run generate-sitemap

# Validate code quality
npm run validate
```

## 📝 Common Tasks

### Adding a New Component
1. Create CSS in `css/components/component-name.css`
2. Import in `css/main.css`
3. If JS needed, create module in `js/core/` or `js/utils/`
4. Export init function and import in `js/main.js`
5. Update `.cursor/rules/cursorrules.mdc`

### Modifying Colors
- Edit `css/variables.css` only
- All components use CSS variables

### Adding a New Page
1. Create HTML file in root
2. Create page-specific CSS in `css/pages/page-name.css` if needed
3. Create page-specific JS in `js/pages/page-name.js` if needed
4. Import CSS in `css/main.css`
5. Conditionally initialize JS in `js/main.js`

## 🔧 Build Configuration

- **Vite Config:** `vite.config.js`
- **PostCSS Config:** `postcss.config.cjs`
- **Package Config:** `package.json`
- **ESLint Config:** `eslint.config.js` (ESLint v9 flat config)

## 📚 Documentation

- **Project Rules:** `.cursor/rules/cursorrules.mdc` (MUST READ FIRST)
- **Build Guide:** `docs/BUILD_AND_DEPLOY.md`
- **Quick Start:** `docs/QUICK_START.md`

