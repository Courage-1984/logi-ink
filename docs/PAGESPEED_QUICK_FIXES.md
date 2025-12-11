# PageSpeed Insights - Quick Fixes Guide

**Date:** 2025-12-11  
**Priority:** High - Immediate fixes to improve Performance Score from 85 to 95+

---

## 🚨 Immediate Fixes (15-30 minutes each)

### Fix 1: Remove Missing 1920w Image Reference

**Problem:** Preload and picture element reference `banner_home-1920w.avif` which doesn't exist (404 error)

**Files to Update:**
- `index.html` (lines 54-68, 949-986)

**Fix:**

1. **Update preload in `index.html` head:**
```html
<!-- Remove 1920w from imagesrcset until file is generated -->
<link
  rel="preload"
  as="image"
  imagesrcset="
    ./assets/images/responsive/banners/banner_home-320w.avif   320w,
    ./assets/images/responsive/banners/banner_home-375w.avif   375w,
    ./assets/images/responsive/banners/banner_home-480w.avif   480w,
    ./assets/images/responsive/banners/banner_home-768w.avif   768w,
    ./assets/images/responsive/banners/banner_home-1024w.avif 1024w,
    ./assets/images/responsive/banners/banner_home-1280w.avif 1280w
  "
  imagesizes="(max-width: 320px) 320px, (max-width: 375px) 375px, (max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px"
  fetchpriority="high"
/>
```

2. **Update picture element in featured projects section:**
```html
<!-- Remove 1920w from srcset, keep max at 1280w -->
<source
  type="image/avif"
  srcset="
    ./assets/images/responsive/banners/banner_home-320w.avif   320w,
    ./assets/images/responsive/banners/banner_home-375w.avif   375w,
    ./assets/images/responsive/banners/banner_home-480w.avif   480w,
    ./assets/images/responsive/banners/banner_home-768w.avif   768w,
    ./assets/images/responsive/banners/banner_home-1024w.avif 1024w,
    ./assets/images/responsive/banners/banner_home-1280w.avif 1280w
  "
  sizes="(max-width: 320px) 320px, (max-width: 375px) 375px, (max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px"
/>
```

**OR** Generate the 1920w image:
```bash
npm run responsive-images
```

---

### Fix 2: Fix CSS Routing Issue in .htaccess

**Problem:** Clean URL rewrite rules may be interfering with `/css/main.css` requests, causing CSS to return HTML (404 page)

**File to Update:**
- `.htaccess`

**Fix:**

Add exception for static assets before the clean URL rewrite:

```apache
# Apache Security Headers Configuration
# For Apache web servers

# Clean URLs - Remove .html extension from URLs
<IfModule mod_rewrite.c>
  RewriteEngine On

  # Force HTTPS - Redirect HTTP to HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

  # Redirect www to non-www (canonical domain)
  RewriteCond %{HTTP_HOST} ^www\.logi-ink\.co\.za$ [NC]
  RewriteRule ^(.*)$ https://logi-ink.co.za/$1 [R=301,L]

  # SEO Protection: Redirect IP address and other domains to canonical domain
  RewriteCond %{HTTP_HOST} !^logi-ink\.co\.za$ [NC]
  RewriteRule ^(.*)$ https://logi-ink.co.za/$1 [R=301,L]

  # IMPORTANT: Exclude static assets from clean URL rewriting
  # Don't rewrite requests for CSS, JS, images, fonts, etc.
  RewriteCond %{REQUEST_URI} \.(css|js|png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|eot|mp4|webm|ogg|mp3|wav|pdf|json|xml|webmanifest|manifest\.json|sw\.js)$ [NC]
  RewriteRule ^ - [L]

  # Redirect .html to clean URL (301 permanent redirect)
  RewriteCond %{THE_REQUEST} /([^.]+)\.html [NC]
  RewriteRule ^ /%1? [NC,L,R=301]

  # Rewrite clean URL to .html file if it exists
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.*)$ $1.html [NC,L]

  # Remove trailing slash (except for root)
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} (.+)/$
  RewriteRule ^ %1 [R=301,L]
</IfModule>
```

**Key Addition:** The line `RewriteCond %{REQUEST_URI} \.(css|js|...)$ [NC]` and `RewriteRule ^ - [L]` prevents clean URL rewriting for static assets.

---

### Fix 3: Optimize Google Tag Manager Loading

**Problem:** GTM loads on `window.load` event, causing long main-thread tasks (307ms)

**Files to Update:**
- All HTML files with GTM script (index.html, about.html, contact.html, etc.)

**Current Code:**
```javascript
window.addEventListener('load', () => {
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-9PFB2D8G1B');

  // Load gtag.js script asynchronously
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9PFB2D8G1B';
  document.head.appendChild(script);
});
```

**Optimized Code:**
```javascript
// Defer GTM loading using requestIdleCallback to avoid blocking main thread
(function() {
  function loadGTM() {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-9PFB2D8G1B');

    // Load gtag.js script asynchronously
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9PFB2D8G1B';
    document.head.appendChild(script);
  }

  // Use requestIdleCallback if available (non-blocking)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadGTM, { timeout: 2000 });
  } else if ('requestAnimationFrame' in window) {
    // Fallback: Use requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeout(loadGTM, 1000);
    });
  } else {
    // Final fallback: Load after page is fully loaded
    window.addEventListener('load', loadGTM);
  }
})();
```

**Benefits:**
- Loads during browser idle time (non-blocking)
- Reduces main-thread blocking
- Still loads within 2 seconds (timeout)

---

### Fix 4: Ensure Three.js Only Loads When Needed

**Problem:** Three.js loads from CDN (117.9 KiB) even when not immediately needed

**Current Status:** ✅ Already optimized - Three.js loads dynamically via `three-loader.js` only when easter egg or three-hero is triggered.

**Verification:**
- Check `js/utils/three-loader.js` - already uses dynamic loading
- Check `js/easter-egg/runtime.js` - loads Three.js only when easter egg activates
- Check `js/core/three-hero.js` - loads Three.js only for hero animations

**No action needed** - already optimized.

**Optional Enhancement:** Consider preloading Three.js only on pages that use it (services, projects) using `<link rel="modulepreload">` or prefetch.

---

## 📊 Expected Impact

### Desktop
After implementing Fixes 1-3:

- **404 Errors:** Eliminated (missing 1920w image)
- **CSS Loading:** Fixed (proper MIME type)
- **Main Thread Blocking:** Reduced (GTM loads during idle time)
- **Performance Score:** 85 → **90+** (estimated)
- **TBT:** 240ms → **150ms** (estimated)
- **LCP:** 1.6s → **1.4s** (estimated)

### Mobile
**Note:** Mobile has additional critical issues:
- **LCP:** 5.3s (critical - needs immediate attention)
- **FCP:** 1.9s (just above threshold)
- **Non-Composited Animations:** 28 elements (vs 2 desktop)

**Mobile-specific fixes required** (see main analysis document):
- Mobile LCP optimization (critical rendering path)
- Non-composited animation fixes (28 elements)
- Mobile image preloading optimization

---

## 🔄 Next Steps (After Quick Fixes)

### Desktop
1. **Generate 1920w Image** (if needed for large displays)
2. **Optimize Image Compression** (re-run image optimization)
3. **Implement CSP Nonces** (security improvement)
4. **Code Splitting** (reduce main-thread work)
5. **Break Up Long Tasks** (further optimize JavaScript execution)

### Mobile (High Priority)
1. **Fix Mobile LCP (5.3s → 2.5s)** - Critical issue
   - Optimize critical rendering path
   - Preload mobile-optimized images
   - Reduce initial payload
2. **Fix Non-Composited Animations (28 → 0)** - Major performance impact
   - Refactor text reveal animations
   - Remove SVG filters
   - Optimize button animations
3. **Mobile Image Optimization**
   - Ensure smallest appropriate sizes for mobile viewports
   - Preload 320w/375w images for mobile

See `docs/PAGESPEED_INSIGHTS_DECEMBER_2025_ANALYSIS.md` for detailed analysis and Phase 2-5 fixes.

---

**Last Updated:** 2025-12-11

