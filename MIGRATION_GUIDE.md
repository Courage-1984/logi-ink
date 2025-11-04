# Migration Guide - Modular Structure

## What Has Been Done

### ✅ JavaScript Modularization
All JavaScript has been split into modular ES6 modules:
- `js/main.js` - Main entry point
- `js/core/` - Core functionality modules
- `js/utils/` - Utility modules  
- `js/pages/` - Page-specific modules

**Next Step:** Update all HTML files to use `<script type="module" src="js/main.js"></script>` instead of `<script src="script.js"></script>`

### ✅ CSS Architecture Created
- `css/main.css` - Main entry point with @import statements
- `css/variables.css` - CSS custom properties
- `css/base.css` - Base styles
- Directory structure created for components, pages, and utils

**Next Step:** Extract CSS from `styles.css` into the appropriate component files. See section below.

### ✅ HTML Partials Created
- `partials/nav.html` - Navigation component
- `partials/footer.html` - Footer component
- `partials/head.html` - Common head elements
- `partials/cursor-effects.html` - Cursor effects HTML

**Next Step:** Update HTML files to include partials (or use them as reference when creating new pages)

### ✅ Documentation
- `.cursorrules` - Comprehensive project structure and conventions guide

---

## Next Steps

### 1. Extract CSS from styles.css

The large `styles.css` file (3561 lines) needs to be split into the component files. Here's the mapping:

#### Extract to `css/components/navigation.css`:
- `.navbar` and related styles
- `.nav-container`, `.nav-menu`, `.nav-link`
- `.logo-text`, `.logo-accent`
- `.hamburger` and mobile menu styles

#### Extract to `css/components/hero.css`:
- `.hero` section styles
- `.hero-background`, `.hero-content`
- `.grid-overlay`, `.particles`
- `.hero-title`, `.hero-subtitle`
- `.text-reveal` animations
- `.scroll-indicator`, `.mouse`, `.wheel`

#### Extract to `css/components/buttons.css`:
- `.btn` base styles
- `.btn-primary`, `.btn-secondary`
- `.btn-outline`, `.btn-large`

#### Extract to `css/components/cards.css`:
- `.service-card` and all related styles
- `.project-card`, `.project-card-large`
- `.service-icon`, `.icon-glow`
- `.service-link`

#### Extract to `css/components/footer.css`:
- `.footer` and all footer-related styles

#### Extract to `css/components/forms.css`:
- `.form-group`, `.form-group input`, `.form-group textarea`
- `.form-submit`
- All form-related styles including variants

#### Extract to `css/utils/animations.css`:
- `.fade-in`, `.fade-in-up`
- `.text-reveal` keyframes
- All animation keyframes

#### Extract to `css/utils/cursor.css`:
- `.cursor-follow`, `.cursor-dot`

#### Extract to `css/utils/3d-effects.css`:
- `.card-3d`, `.scroll-reveal-3d`
- `.mouse-tilt-container`
- All 3D transform effects

#### Extract to `css/utils/fluid-effects.css`:
- `.fluid-shape`, `.fluid-morph`
- All fluid animation keyframes

#### Extract to `css/utils/responsive.css`:
- All `@media` queries
- Mobile, tablet, and desktop breakpoints

#### Extract to `css/pages/contact.css`:
- `.contact-section`, `.contact-container`
- `.contact-info`, `.contact-item`
- `.contact-form`

#### Extract to `css/pages/projects.css`:
- `.projects-grid`
- Any project-page-specific styles

#### Extract to `css/components/modals.css`, `alerts.css`, etc.:
- All component styles from the style guide (modals, alerts, badges, tables, tabs, accordions)

### 2. Update HTML Files

Update each HTML file:
1. Change stylesheet link: `<link rel="stylesheet" href="css/main.css">`
2. Change script tag: `<script type="module" src="js/main.js"></script>`
3. Optionally replace navigation/footer with partial content

Files to update:
- `index.html`
- `about.html`
- `services.html`
- `projects.html`
- `contact.html`

### 3. Test Everything

After migration:
1. Test each page loads correctly
2. Verify all styles are applied
3. Check JavaScript functionality (navigation, animations, forms)
4. Test responsive layouts
5. Check browser console for errors

---

## Quick Migration Script (Manual)

Since we don't have a build system yet, you'll need to:

1. Open `styles.css` in your editor
2. Search for each component class (e.g., `.navbar`)
3. Copy the relevant CSS rules to the appropriate component file
4. Remove copied rules from `styles.css`
5. Repeat for all components

**Tip:** Use your editor's search feature to find where each component's styles start and end.

---

## Rollback Plan

If something breaks:
1. Keep `styles.css` and `script.js` as backup
2. Update HTML files to point back to old files if needed
3. Gradually migrate components one at a time

---

## Benefits of New Structure

✅ **Better Organization** - Easy to find specific styles/scripts
✅ **Easier Maintenance** - Change one component without affecting others
✅ **Faster Development** - Smaller files are easier to work with
✅ **Better for AI Assistants** - Smaller context = better suggestions
✅ **Scalability** - Easy to add new components
✅ **Team Collaboration** - Multiple people can work on different components

---

## Notes

- The old `styles.css` and `script.js` files should be kept temporarily as backup
- Once migration is complete and tested, you can delete the old files
- Consider adding a build step later to bundle/minify CSS and JS
- HTML partials are currently manual copy/paste - consider a template engine later
