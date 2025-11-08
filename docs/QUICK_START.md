# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- **Vite** – Multi-page build tool with lightning-fast dev server
- **Sharp** – Image optimisation pipeline
- **Playwright** (dev dependency) – Browser automation for the smoke suite

### 2. Start Development Server

```bash
npm run dev
```

Your site will open at `http://localhost:3000` with hot module replacement (changes auto-reload).

### 3. Build for Production

```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

---

## 📝 Common Commands

```bash
# Development
npm run dev               # Start dev server with HMR
npm run preview           # Preview the production build locally

# Production
npm run build             # Build for production
npm run clean             # Clear dist/ and Vite cache

# Quality Gates
npm run format            # Format with Prettier
npm run format:check      # Check formatting only
npm run lint              # ESLint over js/**/*.js
npm run lint:fix          # ESLint with auto-fix
npm run validate          # Run format:check + lint

# Testing
npm run test:e2e          # Build + Playwright smoke suite
npx playwright install    # (one-time) install browsers for Playwright

# Optimisation
npm run optimize-images       # Optimise existing images
npm run responsive-images     # Generate responsive AVIF/WebP sets
npm run optimize-video        # Optimise hero/background videos
npm run inline-critical-css   # Extract + inline above-the-fold CSS
npm run generate-sitemap      # Rebuild sitemap.xml
```

---

## 🖼️ Image Optimization

### Quick Image Optimization

```bash
npm run optimize-images
```

This will:
- Compress WebP/PNG/JPEG assets
- Emit optimised variants alongside the originals
- Report size savings per file

### Generate Responsive Images

```bash
npm run responsive-images
```

This creates multiple sizes for responsive `srcset` usage.

### Optimise Video Backgrounds

```bash
npm run optimize-video
```

Outputs WebM/H.264 derivatives, generates poster frames, and prints before/after stats for hero/background loops.

---

## 🚢 Deploy

### Option 1: Netlify (Easiest)

1. Push to GitHub
2. Connect repository in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

### Option 2: Vercel

1. Push to GitHub
2. Connect repository in Vercel
3. Vercel auto-detects Vite
4. Deploy!

### Option 3: GitHub Pages

```bash
# Produce a GitHub Pages-ready bundle
npm run build:gh-pages

# Or build both standard and GH Pages output in one shot
npm run build:dual
```

Publish `dist/` (or `dist-gh-pages/` if you used `build:dual`) to your GitHub Pages branch. The GitHub-specific build sets `VITE_BASE_PATH=./` and disables the service worker so relative assets and updates work reliably.

### Option 4: Manual

```bash
npm run build
# Upload dist/ folder to your web server
```

---

## 📚 More Information

- **Detailed Build Guide:** See `docs/BUILD_AND_DEPLOY.md`
- **Project Structure:** See `README.md`
- **Project Rules:** See `.cursor/rules/cursorrules.mdc` (MUST READ FIRST)
- **Documentation Audit Status:** See `docs/documentation-audit-progress.md`

---

**Need Help?** Check the troubleshooting section in `BUILD_AND_DEPLOY.md`

