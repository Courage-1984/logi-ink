# Logi-Ink Website

A modern, cyberpunk-themed website for Logi-Ink digital agency, featuring stunning animations, motion effects, and a sleek design.

## 🏗️ Project Structure

This project uses a **modular architecture** for better organization and maintainability:

- **CSS:** Modular CSS files organized by component/feature (see `css/` directory)
- **JavaScript:** ES6 modules organized by functionality (see `js/` directory)
- **HTML:** Static HTML pages with reusable partials (see `partials/` directory)

**For detailed structure and conventions, see [.cursor/rules/cursorrules.mdc](.cursor/rules/cursorrules.mdc)**

## 🚀 Quick Start

### Prerequisites

- **Node.js:** Version 20 (see `.nvmrc` for exact version)
  - If using `nvm`: `nvm use` (automatically uses version from `.nvmrc`)
  - Download from [nodejs.org](https://nodejs.org/) if not using nvm
- **npm:** Comes with Node.js

### Option 1: Development (Recommended)

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables (optional):**
   - Copy `.env.example` to `.env` (if it exists)
   - Set `VITE_BASE_PATH` for your deployment (default: `/logia-ink/`)
   - For root domain deployment, set `VITE_BASE_PATH=/`

3. **Start development server:**

   ```bash
   npm run dev
   ```

   Opens at `http://localhost:3000` with hot module replacement

4. **Build for production:**
   ```bash
   npm run build
   ```
   Creates optimized `dist/` folder

5. **Preview production build:**
   ```bash
   npm run preview
   ```
   Opens at `http://localhost:4173/logia-ink/` (note the base path)

### Option 2: Simple Preview

1. Open `index.html` in a web browser to view the site
2. All pages are linked and functional
3. Note: Some features may require a local server (use Option 1 for full functionality)

## 📁 Directory Structure

```
logia-ink/
├── .cursor/              # Cursor IDE configuration
│   └── rules/
│       └── cursorrules.mdc # Project rules and structure guide
├── docs/                 # Documentation files
│   ├── BUILD_AND_DEPLOY.md
│   ├── PERFORMANCE_OPTIMIZATION.md
│   ├── QUICK_START.md
│   ├── README_BUILD.md
│   ├── STYLE_GUIDE.md
│   ├── project_commands.md # Quick command reference
│   ├── SEO_AND_SECURITY_IMPLEMENTATION.md # SEO and security guide
│   ├── SERVER_SECURITY_HEADERS.md # Server security headers guide
│   └── analysis/         # Analysis and research files
├── tests/                # Test files
│   ├── test-fonts.html
│   └── test-service-worker.html
├── scripts/              # Build and optimization scripts
│   ├── optimize-images.js
│   ├── generate-responsive-images.js
│   ├── generate-sitemap.js
│   ├── generate-seo-meta.js
│   ├── generate-structured-data.js
│   ├── subset-fonts.js
│   └── inline-critical-css.js
├── partials/             # Reusable HTML components
│   ├── seo-meta.html
│   ├── security-headers.html
│   ├── structured-data.html
│   └── accessibility.html
├── robots.txt            # Search engine crawling rules
├── sitemap.xml           # Sitemap for search engines
├── .htaccess             # Apache security headers configuration
├── _headers              # Netlify/Vercel security headers
├── nginx.conf.example    # Nginx security headers example
├── index.html            # Homepage (entry point)
├── about.html            # About page (entry point)
├── services.html         # Services page (entry point)
├── projects.html         # Projects page (entry point)
├── contact.html          # Contact page (entry point)
├── sw.js                 # Service worker (PWA/offline support)
├── README.md             # Project documentation
├── package.json          # Node.js dependencies and scripts
├── vite.config.js        # Vite build configuration
├── postcss.config.cjs    # PostCSS configuration (PurgeCSS)
├── site.webmanifest      # PWA manifest
├── css/                  # Modular CSS files
│   ├── main.css          # Main entry point (imports all modules)
│   ├── variables.css     # CSS custom properties
│   ├── base.css          # Base/reset styles
│   ├── fonts.css         # Self-hosted font declarations
│   ├── critical.css      # Critical CSS (above-the-fold)
│   ├── components/       # 19 component CSS files
│   ├── pages/            # Page-specific styles (3 files)
│   └── utils/            # Utility styles (10 files)
├── js/                   # Modular JavaScript (ES6 modules)
│   ├── main.js           # Main entry point
│   ├── core/             # Core functionality modules (9 modules)
│   ├── utils/            # Utility modules (2 files)
│   └── pages/            # Page-specific scripts (2 files)
├── assets/               # Static assets
│   ├── fonts/            # Self-hosted fonts (WOFF2, subsetted)
│   │   ├── Orbitron/     # Orbitron font family
│   │   └── Rajdhani/     # Rajdhani font family
│   └── images/            # Images
│       ├── backgrounds/  # Background images
│       ├── banners/      # Banner images
│       ├── logos/        # Logo images
│       └── responsive/   # Responsive image variants (AVIF/WebP)
├── dist/                 # Production build output (generated by Vite)
└── *.html                # Page files (entry points)
```

## 🎨 Website Structure

- **Home** (`index.html`) - Hero section, services preview, and featured projects
- **About** (`about.html`) - Company mission, values, and approach
- **Services** (`services.html`) - Detailed service offerings and process
- **Projects** (`projects.html`) - Portfolio showcase
- **Contact Us** (`contact.html`) - Contact form and information

## 🎨 Color Palette

The website uses a cyberpunk-inspired color scheme:

- **Primary Background**: `#0a0a0a` (Deep Black)
- **Secondary Background**: `#1a1a2e` (Dark Blue-Black)
- **Tertiary Background**: `#16213e` (Navy Blue)
- **Accent Colors**:
  - Cyan: `#00ffff` (Electric Cyan)
  - Magenta: `#ff00ff` (Hot Magenta)
  - Green: `#00ff00` (Electric Green)
  - Blue: `#0066ff` (Electric Blue)
  - Pink: `#ff0080` (Hot Pink)

All colors are defined as CSS variables in `css/variables.css` - **modify colors there**, not throughout the codebase.

## 🛠️ Development

### Development Setup

**VS Code (Recommended):**

- Install recommended extensions (VS Code will prompt you)
- Settings are configured in `.vscode/settings.json`
- Format on save is enabled with Prettier

**Code Formatting:**

- **Prettier** is configured via `.prettierrc`
- Format code: `npm run format`
- Check formatting: `npm run format:check`

**Code Linting:**

- **ESLint** is configured via `.eslintrc.js`
- Lint code: `npm run lint`
- Auto-fix issues: `npm run lint:fix`

**Editor Configuration:**

- **EditorConfig** ensures consistent formatting across editors (`.editorconfig`)
- **Git Attributes** ensures consistent line endings (`.gitattributes`)

### Build System

This project uses **Vite** for development and production builds:

- **Development:** `npm run dev` - Fast dev server with HMR
- **Production:** `npm run build` - Optimized, minified build to `dist/`
- **Preview:** `npm run preview` - Preview production build locally

**Environment Variables:**

- Base path can be configured via `VITE_BASE_PATH` environment variable
- Create `.env` file with `VITE_BASE_PATH=/` for root domain deployment
- Default: `/logia-ink/` (for GitHub Pages)

### Available Scripts

**Development:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Code Quality:**

- `npm run format` - Format all code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint` - Lint JavaScript files
- `npm run lint:fix` - Fix linting issues automatically
- `npm run validate` - Run format check and linting

**Optimization:**

- `npm run optimize-images` - Optimize images
- `npm run responsive-images` - Generate responsive images
- `npm run subset-fonts` - Analyze fonts for subsetting
- `npm run inline-critical-css` - Inline critical CSS

**Utilities:**

- `npm run clean` - Clean build artifacts and cache

### CSS Architecture

- All CSS is modular - edit component files in `css/components/`
- Colors are in `css/variables.css` - change them there
- Import order matters in `css/main.css` - don't change unless you know what you're doing
- CSS is automatically minified and purged during production build
- Critical CSS is extracted and inlined in HTML

### JavaScript Architecture

- All JS is modular ES6 - edit modules in `js/core/` or `js/utils/`
- Main entry point is `js/main.js`
- Use `export function initModuleName()` pattern for new modules
- JavaScript is automatically bundled and minified during production build
- Page-specific modules are lazy-loaded

### Performance Optimizations

- ✅ **Service Worker / PWA** - Offline support and faster repeat visits
- ✅ **Self-Hosted Fonts** - Subsetted WOFF2 fonts for faster loading
- ✅ **Critical CSS** - Inlined above-the-fold styles
- ✅ **Image Optimization** - Automated optimization in build (WebP/AVIF)
- ✅ **Code Splitting** - Manual chunks for better caching
- ✅ **CSS Purging** - Removes unused CSS in production
- ✅ **Compression** - Gzip and Brotli compression
- ✅ **Bundle Analysis** - Visual bundle analysis (`dist/stats.html`)

### Current Module Counts

- **CSS Components:** 19 files in `css/components/`
- **CSS Utils:** 10 files in `css/utils/`
- **CSS Pages:** 3 files in `css/pages/`
- **JS Core Modules:** 9 files in `js/core/` (navigation, scroll, animations, cursor, mouse-tilt, easter-egg, page-transitions, scroll-manager, service-worker)
- **JS Utils:** 3 files in `js/utils/` (interactions, toast, accessibility)
- **JS Pages:** 2 files in `js/pages/` (contact, services)

### Adding New Components

1. Create CSS file in `css/components/component-name.css`
2. Import it in `css/main.css`
3. If it needs JS, create module in `js/core/` or `js/utils/`
4. Export init function and import in `js/main.js`
5. **Update `.cursor/rules/cursorrules.mdc`** file with the new component

## 📖 Documentation

**Project Structure:**

- **[.cursor/rules/cursorrules.mdc](.cursor/rules/cursorrules.mdc)** - Complete project structure and conventions guide (MUST READ FIRST)

**Guides:**

- **[docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md)** - Design system and component library
- **[docs/BUILD_AND_DEPLOY.md](docs/BUILD_AND_DEPLOY.md)** - Build and deployment guide
- **[docs/PERFORMANCE_OPTIMIZATION.md](docs/PERFORMANCE_OPTIMIZATION.md)** - Performance optimization guide
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Quick reference guide
- **[docs/README_BUILD.md](docs/README_BUILD.md)** - Quick build reference
- **[docs/project_commands.md](docs/project_commands.md)** - Quick command reference

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Security & SEO

### Security Headers
- ✅ **Meta Tags** - Security headers in HTML (X-Frame-Options, CSP, etc.)
- ✅ **Server Configuration** - `.htaccess` (Apache), `_headers` (Netlify/Vercel), `nginx.conf.example` (Nginx)
- ✅ **Documentation** - See `docs/SERVER_SECURITY_HEADERS.md` for configuration

### SEO Optimization
- ✅ **Meta Tags** - Open Graph, Twitter Cards, descriptions on all pages
- ✅ **Structured Data** - JSON-LD schemas (Organization, WebSite, Service, BreadcrumbList)
- ✅ **Sitemap** - Auto-generated `sitemap.xml` (run `npm run generate-sitemap`)
- ✅ **Robots.txt** - Search engine crawling rules
- ✅ **Documentation** - See `docs/SEO_AND_SECURITY_IMPLEMENTATION.md` for details

### Accessibility
- ✅ **Skip Links** - Keyboard navigation skip to content
- ✅ **ARIA Live Regions** - Screen reader announcements
- ✅ **Focus Management** - Keyboard navigation and focus trapping
- ✅ **Accessibility Utilities** - `js/utils/accessibility.js` for enhanced accessibility

## 📝 Notes

- The contact form currently shows an alert on submission. You'll need to integrate it with a backend service (e.g., Formspree, Netlify Forms, or custom API)
- All animations are CSS-based for optimal performance
- The site is fully responsive and mobile-friendly
- Uses ES6 modules with Vite bundler for optimal performance
- Service worker provides offline support and faster repeat visits
- Fonts are self-hosted and subsetted for optimal performance
- All HTML pages include security headers, SEO meta tags, structured data, and accessibility features

## 🔧 Configuration Files

The project includes several configuration files for code quality and consistency:

**Code Quality:**
- **`.editorconfig`** - Editor configuration for consistent formatting
- **`.prettierrc`** - Prettier code formatting configuration
- **`eslint.config.js`** - ESLint JavaScript linting configuration (ESLint v9 flat config)
- **`.nvmrc`** - Node.js version specification
- **`.gitattributes`** - Git line ending normalization
- **`.npmrc`** - npm configuration
- **`.vscode/`** - VS Code workspace settings and recommended extensions

**Build & Deployment:**
- **`vite.config.js`** - Vite build configuration (supports environment variables)
- **`postcss.config.cjs`** - PostCSS configuration (PurgeCSS)
- **`package.json`** - Node.js dependencies and scripts

**Security & SEO:**
- **`.htaccess`** - Apache security headers configuration
- **`_headers`** - Netlify/Vercel security headers
- **`nginx.conf.example`** - Nginx security headers example
- **`robots.txt`** - Search engine crawling rules
- **`sitemap.xml`** - Sitemap for search engines (generated)

**Documentation:**
- **`CHANGELOG.md`** - Version history and changes
- **`README.md`** - This file

## 🚀 Deployment

See **[docs/BUILD_AND_DEPLOY.md](docs/BUILD_AND_DEPLOY.md)** for detailed deployment instructions.

**Quick deploy:**

1. Build: `npm run build`
2. Upload `dist/` folder to your web server
3. Or use Netlify/Vercel with auto-deploy from Git

## 📄 License

This project is proprietary and confidential.
