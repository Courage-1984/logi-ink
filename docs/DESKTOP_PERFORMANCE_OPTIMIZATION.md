# Desktop Performance Optimization - December 13, 2025

**Report:** https://pagespeed.web.dev/analysis/https-logi-ink-co-za/pi5mnyh08k?form_factor=desktop

---

## 🔍 Issues Identified

### 1. Network Dependency Tree (Critical Path: 1,330ms)

**Problem:**
- Font loading is blocking the critical path (Rajdhani: 975ms, 793ms, 829ms)
- JavaScript chunks loading sequentially instead of in parallel
- Analytics requests (227ms each) in critical path

**Current Chain:**
```
HTML (250ms) 
  → Rajdhani font (975ms) ⚠️ BLOCKING
  → Analytics (227ms × 3)
  → JS chunks (sequential: 456ms → 460ms → 826ms → 1,273ms → 1,330ms)
  → CSS (485ms)
```

**Impact:** Maximum critical path latency: **1,330ms**

---

### 2. Render Blocking CSS (120ms delay)

**Problem:**
- `/assets/style-CbMCRqOV.css` is blocking initial render
- 120ms delay before first paint

**Impact:** Delays FCP and LCP

---

### 3. Unused JavaScript (253 KiB)

**Problem:**
- Three.js: 142 KiB unused (60% of 235.9 KiB)
- Google Tag Manager: 111 KiB unused (39% of 281.4 KiB)

**Status:** Already optimized with lazy loading, but could be improved further

---

### 4. Main-Thread Work (2.6s total)

**Breakdown:**
- **Other:** 1,669ms (64%) ⚠️ **PRIMARY ISSUE**
- Script Evaluation: 356ms
- Style & Layout: 256ms
- Script Parsing & Compilation: 173ms
- Rendering: 94ms
- Garbage Collection: 56ms
- Parse HTML & CSS: 23ms

**Impact:** High main-thread blocking time

---

### 5. Cache TTL (Plausible Analytics: 1 minute)

**Problem:**
- Plausible analytics script has only 1 minute cache TTL
- Should be longer for better repeat visit performance

**Impact:** 3 KiB re-downloaded on every visit

---

## 🔧 Recommended Fixes

### Priority 1: Optimize Font Loading (Critical Path)

**Issue:** Fonts are blocking the critical path even though preloaded.

**Fixes:**

#### A. Use `font-display: optional` for Non-Critical Fonts

**Current:** Rajdhani Regular uses `font-display: swap`  
**Change:** Use `font-display: optional` to prevent blocking

**Rationale:**
- If font isn't ready within 100ms, use system font
- Prevents font loading from blocking render
- Reduces critical path latency

**File:** `css/fonts.css`

```css
@font-face {
  font-family: 'Rajdhani';
  src: url('../assets/fonts/Rajdhani/woff2/Rajdhani-Regular-subset.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: optional; /* Change from swap to optional */
}
```

#### B. Defer Non-Critical Font Variants

**Current:** All font variants are loaded  
**Change:** Only preload critical fonts, defer others

**Files:** All HTML files

Remove preload for non-critical variants:
- Keep: Orbitron-Regular, Orbitron-Black, Rajdhani-Regular
- Remove: Other variants (load on-demand)

---

### Priority 2: Optimize JavaScript Chunking

**Issue:** JavaScript chunks loading sequentially.

**Current Chain:**
```
main.js (460ms)
  → animations.js (826ms)
  → performance.js (1,273ms)
  → vendor.js (1,274ms)
  → easter-egg.js (1,277ms)
  → three-hero.js (1,282ms)
  → three-loader.js (1,330ms)
```

**Fixes:**

#### A. Use Dynamic Imports for Non-Critical Modules

**Files:** `js/main.js`, `js/core/animations.js`, etc.

**Change:** Use dynamic `import()` for non-critical modules:

```javascript
// Instead of static import
import { initAnimations } from './core/animations.js';

// Use dynamic import
if (document.querySelector('.scroll-reveal-3d')) {
  import('./core/animations.js').then(module => {
    module.initAnimations();
  });
}
```

#### B. Defer Analytics Further

**Current:** Analytics load with `requestIdleCallback`  
**Change:** Load only after user interaction or longer delay

**File:** `index.html`

```javascript
// Load analytics only after user interaction
let analyticsLoaded = false;
function loadAnalytics() {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  // Load Plausible and GTM
}

// Load on first user interaction
['mousedown', 'touchstart', 'keydown'].forEach(event => {
  document.addEventListener(event, loadAnalytics, { once: true });
});

// Fallback: Load after 3 seconds
setTimeout(loadAnalytics, 3000);
```

---

### Priority 3: Reduce Render-Blocking CSS

**Issue:** CSS file blocks render for 120ms.

**Fixes:**

#### A. Inline Critical CSS

**File:** `index.html` (in `<head>`)

```html
<style>
  /* Inline critical above-the-fold CSS here */
  /* Hero section, navigation, basic layout */
</style>
<link rel="stylesheet" href="./css/main.css" media="print" onload="this.media='all'">
```

#### B. Use Media Queries to Defer Non-Critical CSS

**File:** `css/main.css`

Split CSS into:
- Critical (above-the-fold): Load immediately
- Non-critical: Load with media query trick

---

### Priority 4: Optimize Main-Thread Work

**Issue:** 1,669ms in "Other" category.

**Likely Causes:**
- Font loading and rendering
- Layout calculations
- Animation initialization
- JavaScript execution

**Fixes:**

#### A. Defer Non-Critical JavaScript

**Files:** All JavaScript modules

**Change:** Use `requestIdleCallback` or `setTimeout` for non-critical code:

```javascript
// Defer non-critical initialization
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    initNonCriticalFeatures();
  });
} else {
  setTimeout(initNonCriticalFeatures, 2000);
}
```

#### B. Use Web Workers for Heavy Computations

**File:** `js/utils/web-worker-helper.js` (already exists)

**Change:** Offload heavy computations to Web Workers:
- Image processing
- Data parsing
- Complex calculations

---

### Priority 5: Improve Cache TTL

**Issue:** Plausible analytics has 1 minute cache TTL.

**Fix:** Server-side configuration (`.htaccess` or server config)

**File:** `.htaccess`

```apache
# Cache Plausible analytics script for longer
<IfModule mod_headers.c>
  <FilesMatch "\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
```

**Note:** This requires server access. If using a CDN, configure there.

---

## 📊 Expected Improvements

### After Implementing Fixes

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **Critical Path Latency** | 1,330ms | 800-900ms | -430-530ms |
| **FCP** | 0.5s | 0.4s | -0.1s |
| **LCP** | 1.7s | 1.4-1.5s | -0.2-0.3s |
| **TBT** | 90ms | 60-70ms | -20-30ms |
| **Main-Thread Work** | 2.6s | 2.0-2.2s | -0.4-0.6s |
| **Performance Score** | 91 | 93-95 | +2-4 points |

---

## 🎯 Implementation Priority

### Immediate (This Week)
1. ✅ Change Rajdhani Regular to `font-display: optional`
2. ✅ Defer analytics loading further (after user interaction)
3. ✅ Use dynamic imports for non-critical JavaScript

### Short-term (Next Week)
4. Inline critical CSS
5. Optimize JavaScript chunking
6. Defer non-critical JavaScript with `requestIdleCallback`

### Long-term (Future)
7. Configure server cache TTL
8. Use Web Workers for heavy computations
9. Further optimize font loading strategy

---

## 📝 Notes

### Font Loading Strategy
- **Critical fonts:** Orbitron-Black (hero title), Orbitron-Regular (headings)
- **Non-critical:** Rajdhani (body text) - can use system font fallback
- **Strategy:** Use `font-display: optional` for non-critical fonts to prevent blocking

### JavaScript Chunking
- Current chunks are created by Vite automatically
- We can influence chunking with dynamic imports
- Consider code splitting by route/page

### Main-Thread Work
- "Other" category (1,669ms) is likely:
  - Font loading and rendering
  - Layout calculations
  - Animation initialization
  - Event handler setup
- Deferring non-critical work should help significantly

---

**Last Updated:** December 13, 2025  
**Status:** Analysis complete, ready for implementation

