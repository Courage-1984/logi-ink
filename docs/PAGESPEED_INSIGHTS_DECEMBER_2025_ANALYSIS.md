# PageSpeed Insights Analysis - December 2025

**Date:** 2025-12-11  
**Desktop Report:** [Desktop Analysis](https://pagespeed.web.dev/analysis/https-logi-ink-co-za/yd5duiiimh?utm_source=search_console&form_factor=desktop&hl=en)  
**Mobile Report:** [Mobile Analysis](https://pagespeed.web.dev/analysis/https-logi-ink-co-za/yd5duiiimh?utm_source=search_console&form_factor=mobile&hl=en)  
**Current Performance Score:** Desktop 85/100 | Mobile 79/100  
**Target Score:** 95+ (both platforms)

---

## 📊 Current Metrics Comparison

### Performance Scores
| Metric | Desktop | Mobile | Status |
|--------|---------|--------|--------|
| **Performance** | 85 ⚠️ | 79 ⚠️ | Both need improvement |
| **Accessibility** | 100 ✅ | 100 ✅ | Perfect |
| **Best Practices** | 96 ⚠️ | 96 ⚠️ | Both need improvement |
| **SEO** | 100 ✅ | 100 ✅ | Perfect |

### Core Web Vitals
| Metric | Desktop | Mobile | Target | Status |
|--------|---------|--------|--------|--------|
| **First Contentful Paint (FCP)** | 0.5s ✅ | 1.9s ❌ | <1.8s | Mobile critical |
| **Largest Contentful Paint (LCP)** | 1.6s ⚠️ | 5.3s ❌ | <2.5s | Mobile critical |
| **Total Blocking Time (TBT)** | 240ms ⚠️ | 10ms ✅ | <200ms | Desktop needs work |
| **Cumulative Layout Shift (CLS)** | 0 ✅ | 0 ✅ | <0.1 | Perfect |
| **Speed Index (SI)** | 1.3s ✅ | 1.9s ⚠️ | <3.4s | Mobile needs work |

---

## 🔴 Critical Issues (High Priority)

### 1. Image Delivery Optimization
**Estimated Savings:** 171 KiB

#### Issues Identified:
1. **Missing 1920w Image** (404 Error)
   - Preload references `banner_home-1920w.avif` but file doesn't exist
   - Browser attempts to load it, causing 404 errors
   - **Location:** `index.html` line 64 (preload) and picture srcset

2. **Oversized Image Delivery**
   - Image `banner_home-1280w.avif` is 208.3 KiB
   - Displayed at 587x391px but using 1280x692px image
   - **Waste:** 154.3 KiB (image larger than needed)
   - **Compression:** Could save additional 64.1 KiB with better compression

3. **Incorrect Responsive Image Selection**
   - Desktop viewport (1261px) selects 1920w image (which doesn't exist)
   - Should use 1280w or smaller based on actual display size
   - `sizes` attribute may not match actual rendered dimensions

#### Fixes Required:

**A. Generate Missing 1920w Image:**
```bash
# Run responsive image generation script
npm run responsive-images
```

**B. Fix Preload in `index.html`:**
```html
<!-- Current (line 54-68) - references non-existent 1920w -->
<link
  rel="preload"
  as="image"
  imagesrcset="
    ./assets/images/responsive/banners/banner_home-320w.avif   320w,
    ./assets/images/responsive/banners/banner_home-375w.avif   375w,
    ./assets/images/responsive/banners/banner_home-480w.avif   480w,
    ./assets/images/responsive/banners/banner_home-768w.avif   768w,
    ./assets/images/responsive/banners/banner_home-1024w.avif 1024w,
    ./assets/images/responsive/banners/banner_home-1920w.avif 1920w
  "
  imagesizes="(max-width: 320px) 320px, (max-width: 375px) 375px, (max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px"
  fetchpriority="high"
/>
```

**Recommended Fix:**
- Remove 1920w from preload until file exists
- Or generate the 1920w variant
- Use `imagesrcset` with appropriate sizes for desktop (1024w or 1280w)

**C. Fix Picture Element `sizes` Attribute:**
```html
<!-- Current sizes may not match actual rendered dimensions -->
sizes="(max-width: 320px) 320px, (max-width: 375px) 375px, (max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px"
```

**D. Optimize Image Compression:**
- Re-run image optimization with higher compression
- Target: Reduce 1280w image from 208.3 KiB to ~144 KiB (30% reduction)

---

### 2. Unused JavaScript (254 KiB Savings)
**Estimated Savings:** 254 KiB

#### Issues Identified:
1. **Three.js from CDN** (117.9 KiB, 71 KiB unused)
   - Loaded from `cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
   - Only used for easter egg feature (not critical for initial load)
   - **Recommendation:** Lazy load only when easter egg is triggered

2. **Google Tag Manager** (281.3 KiB, 111.8 KiB unused)
   - Multiple instances loading same script
   - Currently deferred to `window.addEventListener('load')` but still blocking
   - **Recommendation:** Further defer or use `requestIdleCallback`

3. **Duplicate Script Loading**
   - Three.js appears to load twice
   - Google Tag Manager loads multiple times

#### Fixes Required:

**A. Lazy Load Three.js:**
```javascript
// In js/utils/three-loader.js or easter-egg.js
// Only load Three.js when easter egg is actually triggered
// Current: Loaded eagerly
// Fix: Load on-demand
```

**B. Optimize Google Tag Manager Loading:**
```javascript
// Current: Loads on 'load' event
// Better: Use requestIdleCallback for non-critical analytics
window.addEventListener('load', () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Load GTM here
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      // Load GTM here
    }, 2000);
  }
});
```

**C. Remove Duplicate Scripts:**
- Check for multiple Three.js imports
- Ensure GTM only loads once

---

### 3. Main Thread Work (3.1s Total)
**Breakdown:**
- **Other:** 1,885 ms (60%)
- **Script Evaluation:** 466 ms (15%)
- **Style & Layout:** 367 ms (12%)
- **Script Parsing & Compilation:** 210 ms (7%)
- **Rendering:** 120 ms (4%)
- **Garbage Collection:** 63 ms (2%)
- **Parse HTML & CSS:** 28 ms (1%)

#### Issues:
- High "Other" category suggests unoptimized JavaScript execution
- Script evaluation time indicates heavy JS processing
- Style & Layout suggests layout thrashing

#### Fixes Required:

**A. Code Splitting:**
- Split large JavaScript bundles
- Load non-critical code asynchronously

**B. Optimize JavaScript Execution:**
- Review heavy computations
- Move to Web Workers where possible
- Use `requestIdleCallback` for non-critical work

**C. Reduce Layout Thrashing:**
- Batch DOM reads/writes
- Use `requestAnimationFrame` for animations
- Avoid forced synchronous layouts

---

### 4. Long Main-Thread Tasks (8 Tasks Found)
**Worst Offenders:**
- Google Tag Manager: 307 ms
- Three.js (CDN): 174 ms, 122 ms
- Three-hero.js: 71 ms, 66 ms

#### Fixes Required:

**A. Break Up Long Tasks:**
```javascript
// Use setTimeout(0) or requestIdleCallback to yield to browser
// Example for GTM:
function loadGTM() {
  // Break into smaller chunks
  setTimeout(() => {
    // Load script
  }, 0);
}
```

**B. Defer Non-Critical Scripts:**
- Three.js: Load only when needed
- GTM: Use `requestIdleCallback` with timeout

---

### 5. Browser Console Errors

#### Issues:
1. **404 Error:** `banner_home-1920w.avif` not found
2. **CSS MIME Type Error:** `main.css` returning HTML instead of CSS
   - Error: "Refused to apply style from 'https://logi-ink.co.za/css/main.css' because its MIME type ('text/html') is not a supported stylesheet MIME type"
   - **Root Cause:** Server routing issue - CSS file request returns HTML (likely 404 page or redirect)

#### Fixes Required:

**A. Fix Missing Image:**
- Generate `banner_home-1920w.avif` or remove from preload/srcset

**B. Fix CSS Routing:**
- Check server configuration (`.htaccess`, `_headers`, `netlify.toml`, `vercel.json`)
- Ensure `/css/main.css` serves actual CSS file, not HTML
- Verify build output includes `dist/css/main.css`
- Check for clean URL rewrites interfering with static assets

**Server Configuration Check:**
```apache
# .htaccess - Ensure CSS files are served correctly
<FilesMatch "\.(css)$">
  Header set Content-Type "text/css"
</FilesMatch>
```

---

## 🔴 Mobile-Specific Critical Issues

### 6. Mobile LCP Performance (5.3s - Critical)
**Issue:** Mobile LCP is 5.3s, which is **more than double** the 2.5s threshold. This severely impacts mobile user experience and SEO.

**Root Causes:**
1. **Slow 4G throttling** - Mobile test uses throttled connection
2. **Large initial payload** - Images and JavaScript loading on slow connections
3. **Render-blocking resources** - CSS and JS blocking initial render
4. **Image optimization** - Mobile images may not be optimally sized

**Fixes Required:**

**A. Optimize Critical Rendering Path:**
- Inline critical CSS (already done, verify it's working)
- Defer non-critical JavaScript
- Preload LCP image with appropriate size for mobile

**B. Mobile Image Optimization:**
- Ensure mobile viewport uses smallest appropriate image size
- Preload mobile-optimized hero image (320w or 375w for mobile)
- Use `loading="eager"` and `fetchpriority="high"` for LCP image

**C. Reduce Initial Payload:**
- Code split JavaScript for mobile
- Lazy load below-the-fold content
- Minimize render-blocking resources

**Expected Impact:**
- LCP: 5.3s → **2.5s** (target)
- Performance Score: 79 → **90+**

---

### 7. Non-Composited Animations (28 Elements - Mobile Critical)
**Issue:** Mobile has **28 animated elements** using non-GPU-accelerated properties (vs 2 on desktop). This causes janky animations and increased CLS risk on mobile devices.

**Affected Elements:**
1. **Text Reveal Animations** (`.text-reveal` spans)
   - Properties: `color`, `font-size`, `letter-spacing`, `line-height`, `text-shadow`
   - **Fix:** Use `transform: translateY()` and `opacity` instead

2. **SVG Icons with Filters** (service card icons)
   - Properties: `filter`, `stroke`, `stroke-width`
   - **Fix:** Remove filters or use `will-change: transform`

3. **Background Image Animations** (CTA section)
   - Properties: `background-image`
   - **Fix:** Use separate image element with `transform` instead

4. **Button Animations**
   - Properties: `padding-*`, `font-size`, `letter-spacing`, `border-*-color`
   - **Fix:** Use `transform: scale()` and `opacity` instead

**Fixes Required:**

**A. Refactor Text Reveal Animations:**
```css
/* Current (non-composited) */
.text-reveal {
  animation: textReveal 0.8s ease-out;
  /* Animates: color, font-size, letter-spacing, line-height */
}

/* Fixed (composited) */
.text-reveal {
  opacity: 0;
  transform: translateY(20px);
  animation: textReveal 0.8s ease-out forwards;
}

@keyframes textReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**B. Remove SVG Filters or Use GPU-Accelerated Alternatives:**
```css
/* Remove or replace filter effects */
.service-icon svg {
  /* Remove: filter: drop-shadow(...) */
  /* Use: transform with opacity instead */
  will-change: transform;
}
```

**C. Optimize Button Animations:**
```css
/* Current (non-composited) */
.btn:hover {
  padding: 12px 24px; /* Triggers layout */
  font-size: 16px; /* Triggers layout */
}

/* Fixed (composited) */
.btn {
  transform: scale(1);
  transition: transform 0.3s ease;
}
.btn:hover {
  transform: scale(1.05); /* GPU-accelerated */
}
```

**D. Background Image Optimization:**
```css
/* Use separate image element instead of background-image animation */
.cta-section::before {
  content: '';
  position: absolute;
  /* Use transform instead of background-image changes */
}
```

**Expected Impact:**
- Reduce non-composited animations: 28 → **0-2**
- Improve mobile animation performance
- Reduce CLS risk
- Performance Score: 79 → **85+**

---

### 8. Mobile FCP Performance (1.9s)
**Issue:** Mobile FCP is 1.9s, just above the 1.8s threshold.

**Fixes:**
- Same as LCP optimizations (critical rendering path)
- Ensure critical CSS is properly inlined
- Minimize render-blocking JavaScript
- Optimize font loading

---

## 🟡 Medium Priority Issues

### 9. Content Security Policy (CSP) Improvements
**Current Issues:**
- Using host allowlists instead of nonces/hashes (High severity)
- CSP defined in `<meta>` tag instead of HTTP header (Medium)
- Missing `'unsafe-inline'` for backward compatibility (Medium)

#### Fixes Required:

**A. Implement CSP Nonces:**
```html
<!-- Generate nonce server-side -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'nonce-{NONCE}' 'strict-dynamic' https://cdnjs.cloudflare.com https://plausible.io https://www.googletagmanager.com; ..."
/>
```

**B. Move CSP to HTTP Header:**
- Configure server to send CSP header
- Keep meta tag as fallback for older browsers

**C. Add Backward Compatibility:**
```html
script-src 'self' 'unsafe-inline' 'nonce-{NONCE}' 'strict-dynamic' ...
```

---

### 10. Cache Lifetime Optimization
**Estimated Savings:** 3 KiB

- Ensure static assets have appropriate cache headers
- Check `.htaccess`, `_headers`, or server config

---

### 11. Desktop Non-Composited Animations
**Issue:** 2 animated elements found (desktop only - mobile has 28)

- Review CSS animations
- Ensure animations use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- **Note:** Mobile has 28 non-composited animations (see Issue #7 above)

---

## 📋 Action Plan

### Phase 1: Critical Fixes (Immediate)
1. ✅ **Fix Missing 1920w Image**
   - Generate image or remove from preload/srcset
   - **Time:** 15 minutes

2. ✅ **Fix CSS Routing Issue**
   - Check server configuration
   - Verify build output
   - **Time:** 30 minutes

3. ✅ **Optimize Image Delivery**
   - Fix `sizes` attribute
   - Re-optimize images with better compression
   - **Time:** 1 hour

### Phase 2: JavaScript Optimization (High Priority)
4. ✅ **Lazy Load Three.js**
   - Only load when easter egg triggered
   - **Time:** 1 hour

5. ✅ **Optimize Google Tag Manager**
   - Use `requestIdleCallback`
   - Remove duplicates
   - **Time:** 30 minutes

6. ✅ **Break Up Long Tasks**
   - Use `setTimeout(0)` or `requestIdleCallback`
   - **Time:** 1 hour

### Phase 3: CSP & Security (Medium Priority)
7. ✅ **Implement CSP Nonces**
   - Generate nonces server-side
   - Update CSP policy
   - **Time:** 2 hours

8. ✅ **Move CSP to HTTP Header**
   - Configure server headers
   - **Time:** 30 minutes

### Phase 4: Mobile Optimization (High Priority)
9. ✅ **Fix Mobile LCP (5.3s → 2.5s)**
   - Optimize critical rendering path for mobile
   - Preload mobile-optimized images
   - Reduce initial payload
   - **Time:** 3 hours

10. ✅ **Fix Non-Composited Animations (28 → 0)**
    - Refactor text reveal animations
    - Remove SVG filters
    - Optimize button animations
    - Fix background image animations
    - **Time:** 4 hours

### Phase 5: Performance Tuning (Ongoing)
11. ✅ **Code Splitting**
    - Split large bundles
    - **Time:** 2 hours

12. ✅ **Desktop Animation Optimization**
    - Review and fix remaining 2 non-composited animations
    - **Time:** 1 hour

---

## 🎯 Expected Improvements

### Desktop
After implementing all fixes:

- **Performance Score:** 85 → **95+** (+10 points)
- **LCP:** 1.6s → **1.2s** (-0.4s)
- **TBT:** 240ms → **100ms** (-140ms)
- **Image Savings:** 171 KiB
- **JavaScript Savings:** 254 KiB
- **Total Savings:** ~425 KiB

### Mobile
After implementing all fixes:

- **Performance Score:** 79 → **95+** (+16 points)
- **FCP:** 1.9s → **1.5s** (-0.4s)
- **LCP:** 5.3s → **2.5s** (-2.8s) ⚠️ **Critical**
- **SI:** 1.9s → **1.5s** (-0.4s)
- **Non-Composited Animations:** 28 → **0-2** (-26 elements)
- **Image Savings:** 15 KiB
- **JavaScript Savings:** 112 KiB
- **Total Savings:** ~127 KiB

---

## 📝 Notes

- **Real User Monitoring:** Chrome User Experience Report shows "No Data" - site may be too new or have insufficient traffic
- **Mobile vs Desktop:** Mobile performance is significantly worse (79 vs 85), with critical LCP issue (5.3s)
- **Animation Performance:** Mobile has 14x more non-composited animations than desktop (28 vs 2)
- **Priority:** Mobile optimization should be prioritized due to critical LCP issue
- **Ongoing Monitoring:** Set up regular PageSpeed Insights checks for both mobile and desktop

---

## 🔗 Related Documentation

- [Image Optimization Guide](./IMAGE_OPTIMIZATION_RECOMMENDATION.md)
- [Performance Optimization Analysis](./PERFORMANCE_OPTIMIZATION_ANALYSIS.md)
- [Build and Deploy Guide](./BUILD_AND_DEPLOY.md)
- [Security Headers Configuration](./SERVER_SECURITY_HEADERS.md)

---

**Last Updated:** 2025-12-11  
**Next Review:** After Phase 1 fixes implemented

