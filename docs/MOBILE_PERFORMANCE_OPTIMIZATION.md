# Mobile Performance Optimization - December 13, 2025

**Report:** https://pagespeed.web.dev/analysis/https-logi-ink-co-za/pi5mnyh08k?form_factor=mobile

---

## 🔍 Issues Identified

### 1. Forced Reflow (52ms total)

**Problem:**
- **Source:** `js/main-Dl26KReE.js:2:8928` (30ms) + unattributed (22ms)
- **Root Cause:** Geometric property queries (`offsetHeight`, `getBoundingClientRect`) after DOM changes
- **Location:** `js/core/navigation.js` lines 180, 190, 206

**Impact:** Causes layout thrashing and poor performance

---

### 2. Network Dependency Tree (Critical Path: 1,138ms)

**Problem:**
- Font loading blocking critical path (Rajdhani: 902ms, 717ms × 2, Orbitron: 836ms)
- Analytics in critical path (233ms × 3)
- JavaScript chunks loading sequentially
- CSS blocking render (450ms - worse than desktop!)

**Current Chain:**
```
HTML (256ms)
  → Rajdhani font (902ms) ⚠️ BLOCKING
  → Analytics (233ms × 3)
  → JS chunks (sequential: 449ms → 468ms → 729ms → 782ms → 901ms → 1,138ms)
  → CSS (450ms) ⚠️ BLOCKING
  → Fonts (717ms × 2, 836ms)
```

**Impact:** Maximum critical path latency: **1,138ms**

---

### 3. Render-Blocking CSS (450ms delay)

**Problem:**
- `/assets/style-CbMCRqOV.css` blocking render for **450ms**
- Much worse than desktop (120ms)
- Delays FCP and LCP significantly

**Impact:** Critical for mobile LCP (currently 6.8s)

---

### 4. Unused JavaScript (111 KiB)

**Problem:**
- Google Tag Manager: 110.9 KiB unused (39% of 281.3 KiB)

**Status:** Already optimized with lazy loading, but analytics still in critical path

---

### 5. Long Main-Thread Tasks (4 tasks found)

**Problem:**
- Multiple long tasks blocking main thread
- Likely from font loading, CSS parsing, JavaScript execution

---

## 🔧 Recommended Fixes

### Priority 1: Fix Forced Reflow

**Issue:** `offsetHeight` and `getBoundingClientRect` called after DOM changes

**Location:** `js/core/navigation.js` lines 180, 190, 206

**Fix:**
```javascript
// Instead of immediate forced reflow:
const forceReflow = navMenu.offsetHeight;

// Use requestAnimationFrame to batch reads:
requestAnimationFrame(() => {
  const height = navMenu.offsetHeight;
  // Use height here
});
```

**Expected Impact:**
- Forced reflow: 52ms → **0-10ms**
- Smoother scrolling and interactions

---

### Priority 2: Optimize Render-Blocking CSS (CRITICAL for Mobile)

**Issue:** CSS blocking render for 450ms (critical for LCP)

**Fixes:**

#### A. Inline Critical CSS

**File:** `index.html` (and other HTML files)

```html
<style>
  /* Inline critical above-the-fold CSS */
  /* Hero section, navigation, basic layout - ~5-10KB */
</style>
<link rel="stylesheet" href="./css/main.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="./css/main.css"></noscript>
```

#### B. Split CSS into Critical and Non-Critical

**File:** `css/main.css`

- **Critical:** Hero, navigation, base styles (~20KB)
- **Non-critical:** Animations, easter-egg, page-specific (~rest)

**Load Strategy:**
- Critical: Inline in `<head>`
- Non-critical: Load asynchronously

---

### Priority 3: Apply Desktop Font Optimization

**Issue:** Font loading still blocking (902ms for Rajdhani)

**Fix:** Already applied (`font-display: optional` for Rajdhani)

**Expected Impact:**
- Font loading: 902ms → **~100ms**
- Critical path: 1,138ms → **~400-500ms**

---

### Priority 4: Apply Desktop Analytics Optimization

**Issue:** Analytics still in critical path (233ms × 3)

**Fix:** Already applied (load on user interaction or delay)

**Expected Impact:**
- Analytics removed from critical path
- Critical path: -699ms

---

### Priority 5: Optimize JavaScript Chunking

**Issue:** JavaScript chunks loading sequentially

**Fix:** Use dynamic imports for non-critical modules

**Files:** `js/main.js`, module files

**Change:**
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

---

## 📊 Expected Performance Improvements

### Critical Path Latency
| Component | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Font loading | 902ms | ~100ms | -802ms |
| Analytics (×3) | 699ms | 0ms | -699ms |
| CSS blocking | 450ms | ~50ms | -400ms |
| **Total** | **1,138ms** | **~200-300ms** | **-838-938ms** |

### Core Web Vitals
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **FCP** | 1.9s | 1.6-1.7s | -0.2-0.3s |
| **LCP** | 6.8s | 4.5-5.0s | -1.8-2.3s |
| **TBT** | 30ms | 20-25ms | -5-10ms |
| **Performance Score** | 75 | 82-85 | +7-10 points |

---

## 🎯 Implementation Priority

### Immediate (This Week)
1. 🔴 **Fix forced reflow** in navigation.js
2. 🔴 **Inline critical CSS** (most impactful for mobile LCP)
3. ✅ Apply font optimization (already done)
4. ✅ Apply analytics optimization (already done)

### Short-term (Next Week)
5. Split CSS into critical/non-critical
6. Optimize JavaScript chunking
7. Further optimize main-thread work

### Long-term (Future)
8. Monitor and fine-tune
9. Consider service worker for CSS caching
10. Further optimize font loading strategy

---

## 📝 Notes

### Mobile-Specific Considerations
- **Render-blocking CSS is more critical on mobile** (450ms vs 120ms desktop)
- **Font loading has bigger impact** (902ms vs 975ms desktop, but mobile is slower)
- **Critical path optimization is essential** for mobile LCP improvement

### Forced Reflow
- **Root Cause:** Navigation menu positioning code
- **Solution:** Batch geometric property reads using `requestAnimationFrame`
- **Impact:** Small but important for smooth scrolling

### CSS Optimization Strategy
- **Critical CSS:** ~5-10KB (hero, nav, base)
- **Inline in `<head>`:** Immediate render
- **Non-critical:** Load asynchronously
- **Expected LCP improvement:** -1.8-2.3s (from 6.8s to 4.5-5.0s)

---

**Last Updated:** December 13, 2025  
**Status:** Analysis complete, ready for implementation

