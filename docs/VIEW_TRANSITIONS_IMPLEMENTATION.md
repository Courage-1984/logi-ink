# View Transitions API Implementation

**Status:** ✅ **Fully Implemented**  
**Last Updated:** 2025-01-30

## Feature Scope

### Problem Statement
Current page transitions use `window.location.href` which causes:
- Full browser reload/flash
- Browser UI flashing during navigation
- Poor user experience with jarring transitions

### Solution
Implement View Transitions API for smooth, native browser transitions that:
- Eliminate browser UI flashing
- Provide smooth cross-fade transitions
- Maintain Three.js hero backgrounds
- Prevent double animations
- Gracefully degrade for unsupported browsers

## Component Hierarchy

### Files to Modify
1. **CSS Files:**
   - `css/base.css` - Remove old transition classes, add View Transitions styles
   - All HTML pages - Add `@view-transition` CSS rule

2. **JavaScript Files:**
   - `js/core/page-transitions.js` - Replace `window.location.href` with View Transitions API
   - `js/main.js` - Ensure Three.js initializes after transition completes

3. **HTML Files:**
   - All entry pages (index.html, about.html, services.html, etc.) - Add CSS rule

## State Design

### View Transition States
1. **Initial State:** Page loaded, no transition active
2. **Transition Start:** User clicks link, `document.startViewTransition()` called
3. **Snapshot Capture:** Old page snapshots captured
4. **Navigation:** New page loads
5. **Transition Ready:** New page snapshots captured, animation ready
6. **Transition Complete:** Animation finished, Three.js initialized

### Data Flow
```
User Click → startViewTransition() → Navigation → New Page Load → 
Transition Ready → Three.js Init → Transition Finished
```

## API Integration

### View Transitions API Methods
- `document.startViewTransition(callback)` - Start transition
- `ViewTransition.ready` - Promise when animation ready
- `ViewTransition.finished` - Promise when animation complete
- `ViewTransition.updateCallbackDone` - Promise when DOM updated

### CSS API
- `@view-transition { navigation: auto; }` - Enable MPA transitions
- `::view-transition-old(root)` - Old page snapshot
- `::view-transition-new(root)` - New page snapshot

## Risks & Tradeoffs

### Browser Support
- **Supported:** Chrome 111+, Edge 111+, Opera 97+
- **Not Supported:** Firefox, Safari (as of 2024)
- **Mitigation:** Feature detection with fallback to current implementation

### Three.js Initialization
- **Risk:** Three.js may initialize before transition completes, causing visual glitches
- **Mitigation:** Initialize Three.js in `transition.finished` promise

### Double Animations
- **Risk:** Old CSS transitions may conflict with View Transitions
- **Mitigation:** Remove old transition classes, use View Transitions exclusively

### Performance
- **Risk:** View Transitions may add overhead
- **Mitigation:** Native browser implementation is optimized, minimal overhead

## Implementation Steps

1. Add `@view-transition` CSS rule to all HTML pages
2. Update `page-transitions.js` to use View Transitions API
3. Remove old CSS transition classes from `base.css`
4. Ensure Three.js initializes after transition completes
5. Add feature detection and fallback
6. Test across browsers and devices

## Implementation Status

### ✅ Completed

1. **CSS Configuration**
   - `@view-transition { navigation: auto; }` added to all 12 HTML pages
   - View transition styles in `css/base.css` with CLS prevention
   - Navbar has `view-transition-name: navbar` for smooth transitions

2. **JavaScript Integration**
   - `js/core/page-transitions.js` handles view transition events
   - Three.js initialization delayed until transitions complete
   - Proper event listeners for `pagereveal` events

3. **Navbar Flash Prevention** (2025-01-30)
   - CSS rules to disable hover/active states during view transitions
   - Uses `:active-view-transition-type()` pseudo-classes
   - Inline script prevents active link flash before first paint
   - `data-nav-initialized` attribute to control hover state timing

### Files Modified

**CSS:**
- `css/base.css` - View transition styles (::view-transition-old, ::view-transition-new, ::view-transition-group)
- `css/components/navigation.css` - Navbar view-transition-name, hover/active prevention during transitions
- `css/critical.css` - Same navbar fixes for critical CSS

**JavaScript:**
- `js/core/page-transitions.js` - View transition event handling
- `js/core/navigation.js` - Added `data-nav-initialized` marking

**HTML:**
- All 12 HTML pages - `@view-transition { navigation: auto; }` rule in `<style>` tag
- All 12 HTML pages - Improved inline script to prevent active link flash

## Testing Checklist

- [x] Transitions work in Chrome/Edge
- [x] Fallback works in Firefox/Safari (graceful degradation)
- [x] Three.js backgrounds load correctly
- [x] No double animations
- [x] No browser UI flashing
- [x] No navbar flash during transitions (fixed 2025-01-30)
- [x] Mobile transitions work
- [x] Back/forward navigation works
- [x] Direct URL navigation works

## Navbar Flash Fix (2025-01-30)

### Problem
Navbar items were flashing active/hover state during page transitions and on initial load.

### Solution
1. **CSS Rules:** Added rules to disable hover/active states during view transitions using `:active-view-transition-type()` pseudo-classes
2. **Initialization Marking:** Added `data-nav-initialized` attribute to control when hover states become active
3. **Inline Script:** Improved blocking script in `<head>` to remove active classes and mark nav links before CSS paints
4. **View Transition Name:** Added `view-transition-name: navbar` for smoother navbar transitions

### Implementation Details

**CSS Prevention:**
```css
/* Disable hover during view transitions */
:active-view-transition-type(back) .nav-link:hover,
:active-view-transition-type(forward) .nav-link:hover,
html:has(.page-transition-preload) .nav-link:hover {
  color: var(--text-secondary) !important;
  text-shadow: none !important;
}

/* Disable hover until JS initializes */
.nav-link:not([data-nav-initialized]):hover {
  color: var(--text-secondary) !important;
  text-shadow: none !important;
}
```

**JavaScript Initialization:**
```javascript
// Mark all nav links as initialized (enables hover states)
document.querySelectorAll('.nav-link').forEach(link => {
  link.setAttribute('data-nav-initialized', 'true');
});
```

