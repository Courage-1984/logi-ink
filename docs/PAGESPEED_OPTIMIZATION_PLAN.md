# PageSpeed Insights Optimization Plan

**Date:** 2025-01-30  
**Current Score:** 84  
**Target Score:** 95+  
**Report:** [PageSpeed Insights Analysis](https://pagespeed.web.dev/analysis/https-logia-co-za/v2l42tu8ix?utm_source=search_console&form_factor=mobile&hl=en)

---

## 📊 Current Metrics

- **Performance Score:** 84
- **First Contentful Paint:** 0.4s ✅
- **Largest Contentful Paint:** 1.7s ⚠️
- **Total Blocking Time:** 110ms ⚠️
- **Cumulative Layout Shift:** 0.497 ❌ (Target: <0.1)
- **Speed Index:** 1.4s ✅

---

## 🎯 Priority Fixes

### 1. Fix Image Delivery (Est. Savings: 168 KiB) 🔴 HIGH PRIORITY

**Issue:** Hero banner image (`banner_home-1280w.avif`) is 205.7 KiB but displayed at 587x391px. Using wrong responsive image size.

**Current Implementation:**
```html
<img
  src="./assets/images/banners/banner_home.webp"
  loading="eager"
  fetchpriority="high"
  decoding="sync"
  alt="Web Development Transforming Digital Experiences"
  width="1280"
  height="720"
/>
```

**Problems:**
1. Using 1280w image for 587x391 display (152.4 KiB waste)
2. Image compression could save 61.6 KiB
3. Missing proper `sizes` attribute for responsive selection

**Fix:**

1. **Update `index.html` hero banner image:**
   - Use proper `sizes` attribute based on actual display size
   - Preload appropriate size (768w for most viewports)
   - Ensure width/height attributes match displayed size

2. **Generate optimized 768w variant** if missing:
   ```bash
   npm run responsive-images
   ```

3. **Update preload in `<head>`:**
   ```html
   <!-- Preload hero banner in AVIF format (768w for most viewports) -->
   <link
     rel="preload"
     as="image"
     href="./assets/images/responsive/banners/banner_home-768w.avif"
     fetchpriority="high"
   />
   ```

4. **Update image markup:**
   ```html
   <picture>
     <source
       type="image/avif"
       srcset="
         ./assets/images/responsive/banners/banner_home-480w.avif   480w,
         ./assets/images/responsive/banners/banner_home-768w.avif   768w,
         ./assets/images/responsive/banners/banner_home-1024w.avif 1024w
       "
       sizes="(max-width: 768px) 100vw, (max-width: 1024px) 768px, 1024px"
     />
     <source
       type="image/webp"
       srcset="
         ./assets/images/responsive/banners/banner_home-480w.webp   480w,
         ./assets/images/responsive/banners/banner_home-768w.webp   768w,
         ./assets/images/responsive/banners/banner_home-1024w.webp 1024w
       "
       sizes="(max-width: 768px) 100vw, (max-width: 1024px) 768px, 1024px"
     />
     <img
       src="./assets/images/banners/banner_home.webp"
       loading="eager"
       fetchpriority="high"
       decoding="sync"
       alt="Web Development Transforming Digital Experiences"
       width="768"
       height="432"
     />
   </picture>
   ```

**Expected Savings:** 168 KiB (152.4 KiB from correct size + 61.6 KiB from compression)

---

### 2. Fix Cumulative Layout Shift (CLS: 0.497 → <0.1) 🔴 HIGH PRIORITY

**Issue:** `.particles` div causing 0.490 layout shift. Element is added without reserved space.

**Root Cause:** Particles div has no initial dimensions, causing layout shift when rendered.

**Fix:**

1. **Reserve space for particles in `css/components/hero.css`:**
   ```css
   .particles {
     position: absolute;
     width: 100%;
     height: 100%;
     min-height: 100vh; /* Reserve space to prevent CLS */
     overflow: hidden;
     z-index: 2;
     pointer-events: none;
     opacity: 1;
     visibility: visible;
     /* Prevent layout shifts */
     contain: layout style paint;
   }
   ```

2. **Ensure hero-background has dimensions:**
   ```css
   .hero-background {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     min-height: 100vh; /* Ensure minimum height */
     z-index: -1;
     contain: layout style;
   }
   ```

**Expected Improvement:** CLS reduced from 0.497 to <0.1

---

### 3. Enable CSS Minification (Est. Savings: 12 KiB) 🟡 MEDIUM PRIORITY

**Issue:** CSS is not minified in production build.

**Current Config:** `vite.config.js` has `cssMinify: false`

**Fix:**

Update `vite.config.js`:
```javascript
build: {
  // ...
  cssMinify: true, // Enable CSS minification
  // ...
}
```

**Expected Savings:** 12.3 KiB

---

### 4. Fix Render Blocking CSS (Est. Savings: 100ms) 🟡 MEDIUM PRIORITY

**Issue:** CSS file (`/assets/style-BspTOWBb.css`) blocks render for 130ms.

**Current:** CSS is loaded synchronously in `<head>`

**Fix Options:**

1. **Inline Critical CSS** (Recommended):
   - Extract above-the-fold CSS
   - Inline in `<head>`
   - Load full CSS asynchronously

2. **Defer Non-Critical CSS:**
   ```html
   <link rel="preload" href="./css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
   <noscript><link rel="stylesheet" href="./css/main.css"></noscript>
   ```

3. **Use existing critical CSS:**
   - Check if `css/critical.css` exists
   - Inline it in `<head>`
   - Load main.css asynchronously

**Expected Improvement:** 100ms faster LCP

---

### 5. Defer Google Tag Manager (Est. Savings: 111 KiB unused JS) 🟡 MEDIUM PRIORITY

**Issue:** GTM loads 142 KiB, 111.4 KiB unused. Blocks main thread (123ms).

**Current:** GTM loads synchronously in `<head>`

**Fix:**

1. **Defer GTM loading:**
   ```html
   <!-- Google Tag Manager - Deferred -->
   <script>
     window.addEventListener('load', () => {
       // Load GTM after page load
       (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
       new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
       j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
       'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
       })(window,document,'script','dataLayer','G-9PFB2D8G1B');
     });
   </script>
   ```

2. **Or use async loading:**
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-9PFB2D8G1B"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-9PFB2D8G1B');
   </script>
   ```

**Expected Savings:** 111.4 KiB unused JS, 123ms main thread time

---

### 6. Optimize Three.js Loading (Est. Savings: 142 KiB unused) 🟡 MEDIUM PRIORITY

**Issue:** Three.js (119 KiB) loads from CDN even when not needed. 142 KiB unused.

**Current:** Three.js loads from CDN for easter egg (only activated on specific interaction).

**Fix:**

1. **Ensure Three.js only loads when needed:**
   - Check `js/utils/three-loader.js` - should already be dynamic
   - Verify easter egg only loads Three.js on activation
   - Remove any preload/prefetch of Three.js

2. **Self-host Three.js** (if needed frequently):
   - Bundle Three.js with application
   - Use tree-shaking to include only needed modules
   - Load only when easter egg is activated

**Expected Savings:** 142 KiB unused JS, 160ms main thread time

---

### 7. Fix Non-Composited Animations (CLS Impact) 🟡 MEDIUM PRIORITY

**Issue:** 7 animated elements using properties that trigger layout/paint instead of compositor.

**Affected Elements:**
1. `.wheel` - Using `top` property
2. `.fluid-shape` - Using `border-radius` properties
3. `::after` pseudo-elements - Using `width` property
4. `.nav-link` - Using `color` property
5. `.cta-section` - Using `background-image` property

**Fix:**

1. **Fix scroll indicator wheel (`css/components/hero.css`):**
   ```css
   .wheel {
     /* Use transform instead of top */
     transform: translateY(var(--wheel-position, 0));
     /* Remove: top property */
   }
   ```

2. **Fix fluid shapes (`css/utils/fluid-effects.css`):**
   ```css
   .fluid-shape {
     /* Use transform: scale() instead of border-radius changes */
     transform: scale(var(--fluid-scale, 1));
     /* Keep border-radius constant, animate scale */
   }
   ```

3. **Fix navigation link width animation:**
   ```css
   .nav-link::after {
     /* Use transform: scaleX() instead of width */
     transform: scaleX(var(--link-width, 0));
     transform-origin: left;
   }
   ```

4. **Fix navigation link color:**
   ```css
   .nav-link {
     /* Use opacity or filter instead of color changes */
     opacity: var(--link-opacity, 1);
   }
   ```

5. **Fix background image animation:**
   ```css
   .cta-section {
     /* Use transform: scale() for background effects */
     background-size: cover;
     transform: scale(var(--bg-scale, 1));
   }
   ```

**Expected Improvement:** Smoother animations, reduced CLS

---

### 8. Add Preconnect Hints 🟢 LOW PRIORITY

**Issue:** No preconnect hints for third-party origins.

**Fix:**

Add to `<head>` in `index.html`:
```html
<!-- Preconnect to third-party origins -->
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin />
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin />
<link rel="preconnect" href="https://plausible.io" crossorigin />
```

**Expected Improvement:** Faster connection establishment for third-party resources

---

### 9. Improve Cache Headers 🟢 LOW PRIORITY

**Issue:** Some resources have short cache TTL (7 days, 1 minute for Plausible).

**Fix:**

1. **Update `.htaccess` or server config:**
   ```apache
   # Long cache for static assets
   <FilesMatch "\.(js|css|woff2|avif|webp|png|jpg|svg)$">
     Header set Cache-Control "public, max-age=31536000, immutable"
   </FilesMatch>
   ```

2. **Update `_headers` (Netlify/Vercel):**
   ```
   /assets/*.js
     Cache-Control: public, max-age=31536000, immutable
   /assets/*.css
     Cache-Control: public, max-age=31536000, immutable
   /assets/images/*
     Cache-Control: public, max-age=31536000, immutable
   ```

**Expected Improvement:** Faster repeat visits

---

## 📋 Implementation Checklist

- [ ] Fix hero banner responsive image sizes
- [ ] Reserve space for particles div (fix CLS)
- [ ] Enable CSS minification
- [ ] Inline critical CSS or defer non-critical
- [ ] Defer Google Tag Manager
- [ ] Verify Three.js only loads when needed
- [ ] Fix non-composited animations
- [ ] Add preconnect hints
- [ ] Update cache headers
- [ ] Test with PageSpeed Insights
- [ ] Verify CLS < 0.1
- [ ] Verify LCP < 2.5s

---

## 🎯 Expected Results

After implementing all fixes:

- **Performance Score:** 84 → 95+
- **LCP:** 1.7s → <1.5s
- **CLS:** 0.497 → <0.1
- **TBT:** 110ms → <50ms
- **Total Savings:** ~400+ KiB (images + JS + CSS)
- **Main Thread Time:** Reduced by ~300ms

---

## 📚 References

- [PageSpeed Insights Report](https://pagespeed.web.dev/analysis/https-logia-co-za/v2l42tu8ix?utm_source=search_console&form_factor=mobile&hl=en)
- [Web.dev: Optimize Images](https://web.dev/fast/#optimize-your-images)
- [Web.dev: Minimize Layout Shift](https://web.dev/cls/)
- [Web.dev: Reduce JavaScript Execution Time](https://web.dev/reduce-javascript-execution-time/)

---

**Last Updated:** 2025-01-30

