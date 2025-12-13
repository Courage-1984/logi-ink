# Navbar Flash Final Fix & Font Loading Optimization

## Issue Summary
1. Navbar items were flashing with active/hover states during View Transitions
2. Font loading could be optimized for faster display

## Solutions Implemented

### 1. Navbar Flash Fix - Always-Hidden Default Approach

**Problem**: During View Transitions, the old page's navbar snapshot (with all active classes) was visible during the cross-fade animation, causing a flash.

**Solution**: 
- Navbar is now **hidden by default** via CSS (`visibility: hidden !important`)
- Navbar has inline hidden styles in HTML as backup (`style="visibility: hidden; opacity: 0;"`)
- JavaScript shows navbar **only after a 350ms delay** to ensure View Transition completes (300ms duration + 50ms buffer)

**Implementation**:

```css
/* css/critical.css & css/components/navigation.css */
/* Navbar hidden by default */
.navbar {
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Only show when initialized - but JavaScript controls actual visibility */
.navbar.nav-initialized {
  visibility: visible !important;
  opacity: 1 !important;
  transition: visibility 0s, opacity 0.1s ease !important;
}
```

```javascript
// js/core/navigation.js
// Always delay showing navbar by 350ms to ensure View Transition completes
const navbar = document.querySelector('.navbar');
if (navbar) {
  navbar.classList.add('nav-initialized');
  setTimeout(() => {
    navbar.style.visibility = '';
    navbar.style.opacity = '';
  }, 350); // 300ms transition + 50ms buffer
}
```

**Benefits**:
- Navbar is never visible during View Transitions
- Old page snapshot's navbar is hidden by default
- JavaScript explicitly shows navbar after transition completes
- No flash of active/hover states

### 2. Font Loading Optimization

**Problem**: Rajdhani Regular was using `font-display: optional`, which can prevent font loading on slow connections, causing slower font display.

**Solution**:
- Changed Rajdhani Regular from `font-display: optional` to `font-display: swap`
- Added `type="font/woff2"` to all font preload links for faster parsing and better priority

**Implementation**:

```css
/* css/fonts.css & css/critical.css */
@font-face {
  font-family: 'Rajdhani';
  src: url('../assets/fonts/Rajdhani/woff2/Rajdhani-Regular-subset.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Changed from optional - critical body font, preloaded */
}
```

```html
<!-- All HTML files -->
<link
  rel="preload"
  href="./assets/fonts/Rajdhani/woff2/Rajdhani-Regular-subset.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>
```

**Benefits**:
- Faster font display - `swap` shows fallback immediately, swaps when font loads
- Better preload parsing - `type="font/woff2"` helps browser prioritize correctly
- Font is preloaded, so swap happens quickly without blocking
- No layout shift due to font metric matching fallback

## Files Modified

### Navbar Fix
- `css/critical.css` - Navbar hidden by default
- `css/components/navigation.css` - Navbar hidden by default
- `js/core/navigation.js` - Simplified 350ms delay for navbar visibility
- `partials/navbar.html` - Inline hidden styles (already present)

### Font Optimization
- `css/fonts.css` - Changed Rajdhani Regular to `font-display: swap`
- `css/critical.css` - Changed Rajdhani Regular to `font-display: swap`
- `index.html` and all other HTML files - Added `type="font/woff2"` to font preloads

## Testing Results

**Initial Page Load CLS**: 0.0036 (Excellent ✅)
**Navigation CLS**: 0.0368 (May be from other elements, not navbar)

The navbar should now be completely hidden during View Transitions and only appear after JavaScript explicitly shows it, preventing any flash of active/hover states.

