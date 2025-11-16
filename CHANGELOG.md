# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-11-16

### Changed
- **Easter Egg Organization**: Moved all galaxy easter egg code to dedicated `js/easter-egg/` folder
  - Moved `js/core/easter-egg.js` → `js/easter-egg/easter-egg.js`
  - Moved `js/modules/easter-egg/runtime.js` → `js/easter-egg/runtime.js`
  - Moved texture modules from `js/utils/` → `js/easter-egg/`:
    - `celestial-textures.js`
    - `texture-wrapping.js`
    - `procedural-noise.js`
  - Moved `css/utils/easter-egg.css` → `css/easter-egg/easter-egg.css`
  - Updated all import paths accordingly
  - Updated documentation to reflect new structure
- **Celestial Texture Improvements**: Enhanced procedural texture generation with better equirectangular projection handling
  - **Pole-Aware Radius Scaling**: Features (sunspots, craters, lava blobs, etc.) now scale their radius based on pole proximity to correct for equirectangular distortion
  - **Seamless Noise for Paths**: Replaced `fractalNoise` with `seamlessFractalNoise` in path generation (volcanic cracks, mountain ranges) to prevent visible horizontal seams
  - **Quadratic Feature Scaling**: Small, numerous features (sunspots, small craters, impact pits, lava, hot spots, clouds) now scale quadratically (`* resolution * resolution`) for consistent visual density across resolution levels
  - **Advanced Blending**: Added `globalCompositeOperation = 'lighter'` for Terra planet clouds to achieve more luminous, integrated atmospheric effects
  - **Function Cleanup**: Removed unused `size` parameter from `createPlanetTexture()` function signature and simplified cache key

### Added
- **Texture Modularization**: Separated texture generation into modular system (now in `js/easter-egg/`)
  - `js/easter-egg/texture-wrapping.js` - Seamless texture wrapping utilities for equirectangular sphere mapping
  - `js/easter-egg/procedural-noise.js` - Procedural noise generation (fractal, seamless)
  - `js/easter-egg/celestial-textures.js` - Refactored to use modular imports
- **Galaxy Loading Optimizations**:
  - Lower initial texture resolution (0.5x = 1024x512) for faster loading
  - Three.js pre-loading during vortex animation
  - Optimized galaxy particle generation (pre-calculated random values)
  - Texture caching to avoid regeneration
  - Reduced initial delay from 2000ms to 1500ms
- **Orbital Mechanics Improvements**:
  - Added orbital inclinations to planets for realistic orbits
  - Each planet now orbits at a different angle relative to the reference plane
- **Improved Texture Wrapping**:
  - Multi-pixel edge blending (3 pixels horizontal, 2 pixels vertical)
  - Seamless noise functions for better horizontal wrapping
  - Pole-aware feature placement to minimize distortion
  - Better edge blending algorithms

### Changed
- Texture generation now uses modular architecture with separate wrapping and noise modules
- Galaxy loading is significantly faster (~50-70% improvement)
- Planet orbits are more realistic with varied inclinations
- Texture wrapping improved with seamless algorithms

### Fixed
- Fixed naming conflict in `texture-wrapping.js` that prevented texture generation
- Improved seamless wrapping to eliminate visible seams on spheres

## [1.0.0] - 2024-12-19

### Added

- Initial project setup with modular CSS and JavaScript architecture
- Vite build system with optimization plugins
- Service worker for PWA support
- Self-hosted fonts (Orbitron, Rajdhani)
- Responsive image generation (AVIF/WebP)
- Critical CSS inlining
- Image optimization pipeline
- CSS purging with PurgeCSS
- Gzip and Brotli compression
- Bundle analysis with rollup-plugin-visualizer
- Complete documentation in `docs/` directory
- Project rules and conventions in `.cursor/rules/cursorrules.mdc`

### Security & SEO
- Security headers (meta tags and server configuration)
- SEO meta tags (Open Graph, Twitter Cards) on all pages
- Structured data (JSON-LD) - Organization, WebSite, Service, BreadcrumbList schemas
- Sitemap.xml generation script
- Robots.txt for search engine crawling
- Server-level security headers configuration (.htaccess, _headers, nginx.conf.example)

### Accessibility
- Skip to content links on all pages
- ARIA live regions for screen reader announcements
- Focus management utilities (js/utils/accessibility.js)
- Enhanced keyboard navigation
- Screen reader announcement functions

### Code Quality
- ESLint v9 flat config (eslint.config.js)
- Prettier configuration (.prettierrc)
- EditorConfig (.editorconfig)
- Git attributes (.gitattributes)
- npm configuration (.npmrc)
- VS Code workspace settings (.vscode/)
- Node version management (.nvmrc)

### Scripts & Tools
- generate-sitemap.js - Generate sitemap.xml
- generate-seo-meta.js - SEO meta tags helper
- generate-structured-data.js - Structured data helper
- update-html-seo.js - HTML SEO update helper

### Features

- Homepage with hero section
- About page
- Services page with modal interactions
- Projects portfolio page
- Contact form page
- Navigation with mobile menu
- Scroll animations and effects
- Custom cursor effects
- 3D card tilt effects
- Easter egg interactive feature
- Page transition animations
- Toast notification system

### Performance

- Optimized images (WebP/AVIF formats)
- Subsetted fonts (WOFF2)
- Code splitting for better caching
- CSS code splitting per page
- Minified and compressed assets
- Web Vitals tracking (LCP, FID, CLS)
- Dynamic Three.js loading (loads only when needed)
- Centralized error handling with graceful degradation
- Mobile performance optimizations

## [1.1.0] - 2024-12-19

### Added

- **Error Handling:** Centralized error handling utility (`js/utils/error-handler.js`)
- **Performance Tracking:** Web Vitals tracking utility (`js/utils/performance.js`)
- **Three.js Loader:** Dynamic Three.js loader with SRI support (`js/utils/three-loader.js`)
- **Content Security Policy:** CSP meta tags on all pages
- **Subresource Integrity:** SRI infrastructure for CDN resources
- **Enhanced Accessibility:** Improved ARIA labels, keyboard navigation, and focus management
- **Mobile Performance:** Optimized animations and effects for mobile devices
- **SEO Enhancements:** FAQ schema, enhanced structured data, canonical URLs

### Changed

- **Image Loading:** Added `decoding="async"` and dimensions to hero images
- **Service Worker:** Enhanced error handling with graceful degradation
- **Navigation:** Improved keyboard navigation and ARIA attributes
- **Form Accessibility:** Enhanced required field indicators and error handling
- **Three.js:** Now loads dynamically only when needed (easter egg)

### Security

- **CSP:** Added Content Security Policy meta tags to all pages
- **SRI:** Infrastructure ready for Subresource Integrity on CDN resources

### Accessibility

- **ARIA:** Enhanced ARIA labels and roles throughout
- **Keyboard Navigation:** Full keyboard support with focus management
- **Reduced Motion:** Respects `prefers-reduced-motion` media query

### Performance

- **Mobile:** Reduced animation complexity and disabled 3D effects on mobile
- **Three.js:** Dynamic loading reduces initial bundle size by ~500KB
- **Error Handling:** Graceful degradation ensures site works even if features fail

## [2.1.0] - 2025-11-16

### Changed

- **Dependencies:** Upgraded Vite from 5.0.0 to 7.2.2 (security and performance improvements)
- **Dependencies:** Upgraded Pa11y from 6.2.3 to 9.0.1 (security fixes, improved accessibility auditing)
- **Build System:** Removed `vite-plugin-imagemin` (replaced with manual optimization via `npm run optimize-images` and `npm run responsive-images` scripts)
- **Image Optimization:** Image optimization now handled via dedicated Sharp-based scripts instead of build-time plugin

### Security

- **Vulnerabilities:** Reduced npm audit vulnerabilities from 75 to 45 (all remaining are dev-only dependencies)
- **Production Security:** Production dependencies have 0 vulnerabilities
- **Dev Dependencies:** Upgraded critical dev tools to secure versions

### Documentation

- Updated all documentation to reflect dependency changes and new build process
- Clarified image optimization workflow in build documentation
