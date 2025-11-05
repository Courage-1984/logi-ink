# Logi-Ink Website

A modern, cyberpunk-themed website for Logi-Ink digital agency, featuring stunning animations, motion effects, and a sleek design.

## 🏗️ Project Structure

This project uses a **modular architecture** for better organization and maintainability:

- **CSS:** Modular CSS files organized by component/feature (see `css/` directory)
- **JavaScript:** ES6 modules organized by functionality (see `js/` directory)
- **HTML:** Static HTML pages with reusable partials (see `partials/` directory)

**For detailed structure and conventions, see [.cursorrules](.cursorrules)**

## 🚀 Quick Start

### Option 1: Development (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000` with hot module replacement

3. **Build for production:**
   ```bash
   npm run build
   ```
   Creates optimized `dist/` folder

### Option 2: Simple Preview

1. Open `index.html` in a web browser to view the site
2. All pages are linked and functional
3. Note: Some features may require a local server (use Option 1 for full functionality)

## 📁 Directory Structure

```
logia-ink/
├── css/                  # Modular CSS files
│   ├── main.css         # Main entry point (imports all modules)
│   ├── variables.css    # CSS custom properties
│   ├── base.css         # Base/reset styles
│   ├── components/      # Reusable UI components (18 components)
│   ├── pages/           # Page-specific styles
│   └── utils/           # Utilities (animations, responsive, etc. - 10 files)
├── js/                  # Modular JavaScript (ES6 modules)
│   ├── main.js          # Main entry point
│   ├── core/            # Core functionality modules (7 modules)
│   ├── utils/           # Utility modules
│   └── pages/           # Page-specific scripts
├── docs/                # Documentation files
│   ├── BUILD_AND_DEPLOY.md
│   ├── MIGRATION_GUIDE.md
│   ├── STYLE_GUIDE.md
│   ├── README_BUILD.md   # Quick build reference
│   ├── ANIMATION_IMPROVEMENTS.md # Animation improvement guide
│   └── ...              # Other documentation
├── scripts/             # Build and optimization scripts
│   ├── optimize-images.js
│   └── generate-responsive-images.js
├── partials/            # Reusable HTML components
├── assets/              # Static assets (images, videos)
├── dist/                # Production build output (generated)
├── package.json         # Node.js dependencies and scripts
├── vite.config.js       # Vite build configuration
└── *.html               # Page files (entry points)
```

## 🎨 Website Structure

- **Home** (`index.html`) - Hero section, services preview, and featured projects
- **About** (`about.html`) - Company mission, values, and approach
- **Services** (`services.html`) - Detailed service offerings and process ✅ EXISTS
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

## Image Recommendations

### Hero Section Images
- **Abstract Tech Backgrounds**: Dark, futuristic images with neon accents
  - Cyberpunk cityscapes with neon lights
  - Abstract digital network patterns
  - Holographic/glitch effects
  - Grid patterns with glowing lines
  - **Recommended Size**: 1920x1080px or larger
  - **Format**: JPG or PNG with transparency where needed

### Project Images
- **Screenshots/Mockups**: High-quality project showcases
  - Website mockups on devices
  - App interface screenshots
  - Brand identity presentations
  - **Recommended Size**: 1200x800px minimum
  - **Format**: PNG or JPG

### Team/About Images
- **Professional Headshots**: Modern, clean portraits
  - Dark backgrounds with neon accent lighting
  - Professional yet edgy styling
  - **Recommended Size**: 800x800px (square format)
  - **Format**: JPG

### Service Icons/Illustrations
- **Custom Illustrations**: Tech-focused, minimalist designs
  - Abstract technology concepts
  - Geometric shapes with neon outlines
  - **Recommended Size**: 512x512px or larger (SVG preferred)
  - **Format**: SVG or PNG with transparency

### Background Images
- **Subtle Patterns**: Low-opacity overlays
  - Grid patterns
  - Circuit board designs
  - Hexagonal patterns
  - **Recommended Size**: 1920x1080px
  - **Format**: PNG with transparency

## Logo Design Ideas

### Concept 1: Minimalist Typography with Neon Accent
- **Style**: Clean, modern wordmark
- **Design**: "LOGI-INK" with the "I" in a different color (cyan or magenta)
- **Features**: 
  - Glowing effect on the accent letter
  - Futuristic font (Orbitron or similar)
  - Optional: Small geometric accent mark (dot, line, or bracket)

### Concept 2: Icon-Based Logo
- **Style**: Abstract tech symbol
- **Design Elements**:
  - Interconnected nodes/circles (representing network/connection)
  - Stylized "L" and "I" letters merged
  - Hexagonal or circuit board pattern
  - Neon glow effect
- **Color**: Primary cyan with optional gradient to magenta

### Concept 3: Wordmark with Geometric Element
- **Style**: Typography-focused with supporting graphic
- **Design**: 
  - "LOGI-INK" text with a geometric shape (triangle, arrow, or bracket)
  - The shape could represent "connection" or "transformation"
  - Modern, bold lettering
  - Optional: Small ink droplet or tech symbol

### Concept 4: Monogram/Initials
- **Style**: Minimalist monogram
- **Design**: 
  - "L" and "I" interlocked or overlapping
  - Geometric shapes forming the letters
  - Neon border/outline
  - Can be used as favicon or small format logo

### Logo Specifications
- **Primary Logo**: Full color on dark background
- **Secondary Logo**: White/light version for light backgrounds
- **Icon/Mark**: Simplified version for social media and favicon
- **Formats Needed**: 
  - SVG (vector, scalable)
  - PNG (transparent background, 1024x1024px minimum)
  - JPG (for print, if needed)

## Recommended Image Sources

### Free Stock Photo Sites:
- Unsplash (unsplash.com) - Search for "cyberpunk", "tech", "neon"
- Pexels (pexels.com) - Abstract tech backgrounds
- Pixabay (pixabay.com) - Free vectors and illustrations

### Premium Options:
- Shutterstock
- Adobe Stock
- Getty Images

### Custom Illustrations:
- Consider hiring a graphic designer for custom illustrations
- Use AI image generators (DALL-E, Midjourney) for unique concepts
- Fiverr or Upwork for affordable custom designs

## Image Optimization Tips

1. **Compress images** before uploading to improve load times
2. **Use WebP format** where possible for better compression
3. **Create multiple sizes** (thumbnail, medium, large) for responsive design
4. **Optimize for web** - Keep file sizes under 500KB for most images
5. **Use lazy loading** for images below the fold

## Customization

To replace placeholder images:

1. **Hero Section**: Update the `hero-background` div in HTML files
2. **Project Images**: Replace the `project-image` div backgrounds
3. **Service Icons**: Replace SVG icons in the service cards
4. **Logo**: Update the logo text or add an `<img>` tag in the navbar

## 🛠️ Development

### Build System

This project uses **Vite** for development and production builds:

- **Development:** `npm run dev` - Fast dev server with HMR
- **Production:** `npm run build` - Optimized, minified build to `dist/`
- **Preview:** `npm run preview` - Preview production build locally

### CSS Changes
- All CSS is modular - edit component files in `css/components/`
- Colors are in `css/variables.css` - change them there
- Import order matters in `css/main.css` - don't change unless you know what you're doing
- CSS is automatically minified during production build

### JavaScript Changes
- All JS is modular ES6 - edit modules in `js/core/` or `js/utils/`
- Main entry point is `js/main.js`
- Use `export function initModuleName()` pattern for new modules
- JavaScript is automatically bundled and minified during production build

### Image Optimization
- Optimize images: `npm run optimize-images`
- Generate responsive images: `npm run responsive-images`

### Adding New Components
1. Create CSS file in `css/components/component-name.css`
2. Import it in `css/main.css`
3. If it needs JS, create module in `js/core/` or `js/utils/`
4. Export init function and import in `js/main.js`
5. **Update `.cursor/rules/cursorrules.mdc`** file with the new component

### Current Module Counts
- **CSS Components:** 18 files in `css/components/`
- **CSS Utils:** 10 files in `css/utils/`
- **JS Core Modules:** 7 files in `js/core/` (navigation, scroll, animations, cursor, mouse-tilt, easter-egg, page-transitions)
- **JS Utils:** 1 file in `js/utils/` (interactions)
- **JS Pages:** 1 file in `js/pages/` (contact)

See [.cursor/rules/cursorrules.mdc](.cursor/rules/cursorrules.mdc) for detailed guidelines.

## 📖 Documentation

- **[.cursor/rules/cursorrules.mdc](.cursor/rules/cursorrules.mdc)** - Complete project structure and conventions guide
- **[docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md)** - Design system and component library
- **[docs/BUILD_AND_DEPLOY.md](docs/BUILD_AND_DEPLOY.md)** - Build and deployment guide
- **[docs/README_BUILD.md](docs/README_BUILD.md)** - Quick build reference
- **[docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)** - Migration guide (completed)
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Quick reference guide
- **[docs/ANIMATION_IMPROVEMENTS.md](docs/ANIMATION_IMPROVEMENTS.md)** - Animation improvement guide

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Notes

- The contact form currently shows an alert on submission. You'll need to integrate it with a backend service (e.g., Formspree, Netlify Forms, or custom API)
- All animations are CSS-based for optimal performance
- The site is fully responsive and mobile-friendly
- Uses ES6 modules with Vite bundler for optimal performance
- Legacy files are in `css/legacy/` and `js/legacy/` for reference

## 🚀 Deployment

See **[docs/BUILD_AND_DEPLOY.md](docs/BUILD_AND_DEPLOY.md)** for detailed deployment instructions.

**Quick deploy:**
1. Build: `npm run build`
2. Upload `dist/` folder to your web server
3. Or use Netlify/Vercel with auto-deploy from Git

