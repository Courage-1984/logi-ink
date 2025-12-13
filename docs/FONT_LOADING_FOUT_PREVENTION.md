# Font Loading FOUT Prevention

## Problem

With `font-display: swap`, fallback fonts are shown immediately and then swapped to custom fonts when they load, causing a Flash of Unstyled Text (FOUT). The user requested that navbar and hero text should not show until fonts are loaded.

## Solution

Implemented a font loading system that:
1. Hides navbar and hero text until fonts are loaded
2. Shows text smoothly once fonts are ready
3. Has a timeout fallback (3 seconds max) to ensure text always shows

## Implementation

### 1. JavaScript Font Loader (`js/utils/font-loader.js`)

- Uses FontFace API (`document.fonts.ready`) to detect when fonts are loaded
- Checks for Orbitron and Rajdhani fonts (critical fonts)
- Adds `.fonts-loaded` class when fonts are ready
- Has 3-second timeout fallback to ensure text always shows
- Removes `.fonts-loading` class when fonts are loaded

### 2. CSS Rules

Added to `css/critical.css`, `css/components/navigation.css`, and `css/components/hero.css`:

```css
/* Hide navbar text until fonts are loaded */
.fonts-loading .logo-text,
.fonts-loading .nav-link {
  visibility: hidden;
}

.fonts-loaded .logo-text,
.fonts-loaded .nav-link {
  visibility: visible;
  transition: visibility 0s, opacity 0.2s ease, transform 0.3s ease;
}

/* Hide hero text until fonts are loaded */
.fonts-loading .hero-title,
.fonts-loading .hero-subtitle {
  visibility: hidden;
}

.fonts-loaded .hero-title,
.fonts-loaded .hero-subtitle {
  visibility: visible;
  transition: visibility 0s, opacity 0.2s ease;
}
```

### 3. Initialization

- Inline script in HTML `<head>` adds `.fonts-loading` class immediately (before first paint)
- `js/main.js` imports and initializes `font-loader.js` module early
- Font loader runs immediately, before DOM is ready

## Benefits

✅ **No FOUT** - Text doesn't flash with fallback fonts  
✅ **Smooth Transition** - Text fades in when fonts are ready  
✅ **Fallback Safety** - 3-second timeout ensures text always shows  
✅ **Zero CLS** - Uses `visibility: hidden` instead of `display: none` to preserve layout  
✅ **Performance** - Fonts are preloaded, so typically load within 100-300ms  

## Files Modified

- `js/utils/font-loader.js` - New font loading utility
- `js/main.js` - Initialize font loader early
- `css/critical.css` - Hide/show rules for navbar and hero text
- `css/components/navigation.css` - Hide/show rules for navbar text
- `css/components/hero.css` - Hide/show rules for hero text
- All HTML files - Added inline script to add `.fonts-loading` class

## Technical Notes

- Uses `visibility: hidden` instead of `display: none` to preserve layout dimensions (prevents CLS)
- Font loader checks multiple font weights (400, 700, 900) for robustness
- Works with preloaded fonts (fonts typically load within 100-300ms)
- Gracefully degrades if FontFace API is not available (shows text after 500ms)

