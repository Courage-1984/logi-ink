# PageSpeed Insights Analysis - December 13, 2025

**Report URLs:**
- Desktop: https://pagespeed.web.dev/analysis/https-logi-ink-co-za/1wc977u2ew?form_factor=desktop
- Mobile: https://pagespeed.web.dev/analysis/https-logi-ink-co-za/1wc977u2ew?form_factor=mobile

**Date Analyzed:** December 13, 2025

---

## 📊 Overall Scores

### Desktop
- **Performance:** 88 ⬆️ (Good, but can improve to 90+)
- **Accessibility:** 100 ✅
- **Best Practices:** 96 ✅
- **SEO:** 100 ✅

### Mobile
- **Performance:** 77 ⚠️ (Needs improvement - target: 85+)
- **Accessibility:** 100 ✅
- **Best Practices:** 96 ✅
- **SEO:** 100 ✅

---

## 🎯 Core Web Vitals

### Desktop Metrics
| Metric | Value | Status |
|--------|-------|--------|
| **FCP** | 0.4s | ✅ Excellent |
| **LCP** | 1.6s | ✅ Excellent |
| **TBT** | 60ms | ✅ Good |
| **CLS** | 0 | ✅ Perfect |
| **SI** | 2.4s | ✅ Good |

### Mobile Metrics
| Metric | Value | Status | Target |
|--------|-------|--------|--------|
| **FCP** | 2.0s | ⚠️ Needs improvement | < 1.8s |
| **LCP** | 5.6s | 🔴 **CRITICAL** | < 2.5s |
| **TBT** | 0ms | ✅ Perfect | < 200ms |
| **CLS** | 0 | ✅ Perfect | < 0.1 |
| **SI** | 2.0s | ✅ Good | < 3.4s |

---

## 🚨 Critical Issues

### 1. Mobile LCP: 5.6s (CRITICAL)

**LCP Breakdown:**
- **Time to First Byte (TTFB):** 180ms ✅
- **Element Render Delay:** 750ms 🔴 **PRIMARY ISSUE**
- **Resource Load Delay:** ~4.7s

**LCP Element:**
- Element: `span.text-reveal.delay-2` containing "& CREATIVE"
- Location: `div.hero-content > div.hero-text > h1.hero-title > span.text-reveal`

**Root Cause:**
The 750ms element render delay is caused by the text-reveal animation delay (`delay-2` = 0.4s) plus animation duration. Even though we disabled animations on mobile, the element may still have initial `opacity: 0` state.

**Fix Required:**
1. ✅ Already implemented: Disabled text-reveal animation on mobile
2. ⚠️ **Verify fix is working:** Check that `.hero-title .text-reveal` has `opacity: 1 !important` on mobile
3. **Additional fix:** Remove `delay-2` class from LCP element on mobile, or ensure it's immediately visible

---

### 2. Desktop: Unused JavaScript (252 KiB)

**Breakdown:**
- **Three.js (cdnjs.cloudflare.com):** 142 KiB unused
  - File: `three.min.js` (r128)
  - Transfer size: 235.9 KiB
  - Unused: 142.0 KiB (60%)
- **Google Tag Manager:** 110.5 KiB unused
  - File: `gtag/js?id=G-9PFB2D8G1B`
  - Transfer size: 281.3 KiB
  - Unused: 110.5 KiB (39%)

**Impact:**
- Increases initial JavaScript parse time
- Contributes to main-thread blocking
- Delays Time to Interactive

**Recommendations:**
1. ✅ Already implemented: Three.js lazy loading with `requestIdleCallback`
2. ✅ Already implemented: GTM deferred loading with `requestIdleCallback`
3. **Consider:** Code splitting for Three.js (only load needed modules)
4. **Consider:** Use a lighter analytics solution or defer GTM further

---

### 3. Mobile: Unused JavaScript (111 KiB)

**Breakdown:**
- **Google Tag Manager:** 111 KiB unused
  - Similar to desktop, but less impact on mobile

**Recommendations:**
- Same as desktop (already implemented)

---

### 4. Non-Composited Animations

#### Desktop: 6 Animated Elements

**Elements:**
1. **Section headers with `scroll-reveal-3d`** (4 instances)
   - Properties: `margin-bottom`, `scrollbar-color`
   - Locations:
     - "OUR IMPACT Numbers that speak for themselves"
     - "TECHNOLOGIES WE MASTER Cutting-edge tools..."
     - "OUR SPECIALIZED SERVICES Cutting-edge solutions..."
     - "WHY TEAMS CHOOSE LOGI-INK Built on strategy..."

2. **Navigation link** (1 instance)
   - Property: `color`
   - Location: `a.nav-link.active` (HOME link)

3. **CTA section background** (1 instance)
   - Property: `background-image`
   - Location: `section.cta-section` with lazy-loaded background

#### Mobile: 5 Animated Elements

**Elements:**
1. **Section headers with `scroll-reveal-3d`** (3 instances)
   - Properties: `margin-bottom`, `scrollbar-color`
   - Same locations as desktop (fewer instances detected)

2. **Navigation link** (1 instance)
   - Property: `color`
   - Location: `a.nav-link.active` (HOME link)

3. **CTA section background** (1 instance)
   - Property: `background-image`
   - Location: `section.cta-section` with lazy-loaded background

**Recommendations:**
1. ✅ Already implemented: Removed scrollbar-color transitions on mobile
2. **Fix needed:** Disable `scroll-reveal-3d` animation on mobile (or make it composited)
3. **Fix needed:** Remove `margin-bottom` transitions from scroll-reveal-3d
4. **Fix needed:** Optimize nav-link color transitions (use opacity/transform instead)
5. **Fix needed:** Remove background-image transitions (use opacity fade instead)

---

### 5. Mobile: Image Delivery (14.3 KiB savings)

**Issue:**
- **File:** `cta-get-in-touch-480w.avif`
- **Current size:** 39.3 KiB
- **Potential savings:** 14.3 KiB (36% reduction)
- **Recommendation:** Increase compression factor

**Fix:**
- Re-compress with higher quality setting (quality: 70, effort: 6)
- Expected new size: ~25 KiB

---

### 6. Desktop: Main-Thread Work (2.5s)

**Breakdown:**
- **Total:** 2.5s
- **Long tasks:** 3 tasks found
- **Primary contributors:**
  - Google Tag Manager
  - Three.js initialization
  - JavaScript parsing

**Recommendations:**
1. ✅ Already implemented: Deferred GTM and Three.js loading
2. **Consider:** Further defer non-critical JavaScript
3. **Consider:** Code splitting for better parallelization

---

## ✅ Already Implemented Fixes

Based on previous work, these fixes should already be in place:

1. ✅ **Mobile LCP animation disabled** - Text-reveal animation disabled on mobile
2. ✅ **Hero font preloading** - Orbitron-Black preloaded
3. ✅ **Responsive image sizes** - Fixed to use viewport-relative units
4. ✅ **GTM deferred loading** - Using `requestIdleCallback`
5. ✅ **Three.js lazy loading** - Using `requestIdleCallback` with `loading="lazy"`
6. ✅ **Card transitions optimized** - Changed from `transition: all` to specific properties
7. ✅ **Navigation transitions optimized** - Removed non-composited properties

---

## 🔧 Recommended Fixes (Priority Order)

### 🔴 HIGH PRIORITY (Mobile LCP Critical)

#### 1. Fix Mobile LCP Element Render Delay (750ms → 0ms)

**Current Issue:**
- LCP element (`span.text-reveal.delay-2`) has 750ms render delay
- Even with animation disabled, element may start with `opacity: 0`

**Fix:**
```css
/* In css/utils/animations.css - Mobile section */
@media (max-width: 768px) {
  /* Ensure LCP element is immediately visible */
  .hero-title .text-reveal.delay-2 {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
    animation-delay: 0s !important;
  }
}
```

**Alternative Fix (JavaScript):**
```javascript
// In js/core/animations.js
if (window.innerWidth <= 768) {
  const lcpElement = document.querySelector('.hero-title .text-reveal.delay-2');
  if (lcpElement) {
    lcpElement.style.opacity = '1';
    lcpElement.style.transform = 'none';
    lcpElement.classList.remove('text-reveal', 'delay-2');
  }
}
```

**Expected Impact:**
- LCP: 5.6s → **4.8-5.0s** (750ms improvement)
- Performance score: 77 → **82-85**

---

#### 2. Disable scroll-reveal-3d on Mobile

**Current Issue:**
- `scroll-reveal-3d` animation uses non-composited properties (`margin-bottom`, `scrollbar-color`)
- 3-4 instances detected on mobile

**Fix:**
```css
/* In css/utils/animations.css - Mobile section */
@media (max-width: 768px) {
  .scroll-reveal-3d {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    margin-bottom: var(--space-16) !important; /* Set static value */
  }
}
```

**Expected Impact:**
- Non-composited animations: 5 → **2-3**
- Smoother scrolling on mobile

---

### 🟡 MEDIUM PRIORITY

#### 3. Optimize Navigation Link Color Transitions

**Current Issue:**
- `a.nav-link` uses `color` property for transitions (non-composited)

**Fix:**
```css
/* In css/components/navigation.css */
.nav-link {
  /* Use opacity/transform instead of color */
  transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  /* Use box-shadow for glow effect instead of color change */
  box-shadow: 0 0 10px var(--glow-cyan);
  opacity: 1;
}
```

**Expected Impact:**
- Non-composited animations: -1 element
- Smoother navigation interactions

---

#### 4. Optimize CTA Background Image Transitions

**Current Issue:**
- `section.cta-section` uses `background-image` for transitions (non-composited)

**Fix:**
```css
/* In css/components/cta.css */
.cta-section {
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: inherit;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.3s ease; /* Only transition opacity */
  z-index: -1;
}

.cta-section.bg-loaded::before {
  opacity: 1;
}
```

**Expected Impact:**
- Non-composited animations: -1 element
- Smoother background loading

---

#### 5. Re-compress CTA Image

**File:** `assets/images/responsive/backgrounds/cta-get-in-touch-480w.avif`

**Current:** 39.3 KiB  
**Target:** ~25 KiB (save 14.3 KiB)

**Command:**
```bash
# Using Sharp
sharp('cta-get-in-touch-480w.avif')
  .avif({ quality: 70, effort: 6 })
  .toFile('cta-get-in-touch-480w.avif');
```

**Expected Impact:**
- Image delivery savings: 14.3 KiB
- Faster LCP on mobile (if this image is LCP element)

---

### 🟢 LOW PRIORITY

#### 6. Further Optimize Three.js Loading

**Current:** Lazy loaded with `requestIdleCallback`  
**Improvement:** Code splitting (only load needed modules)

**Considerations:**
- Three.js is large (235.9 KiB)
- Only used for easter egg (not critical path)
- Current implementation is acceptable
- Code splitting may add complexity

**Recommendation:** Defer to future optimization

---

#### 7. Optimize GTM Further

**Current:** Deferred with `requestIdleCallback`  
**Improvement:** Load only after user interaction or longer delay

**Considerations:**
- Analytics are non-critical
- Current implementation is acceptable
- Further delay may impact analytics accuracy

**Recommendation:** Monitor and optimize if needed

---

## 📈 Expected Performance Improvements

### Mobile (After Fixes)
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **Performance Score** | 77 | 85-90 | +8-13 points |
| **LCP** | 5.6s | 4.8-5.0s | -0.6-0.8s |
| **FCP** | 2.0s | 1.8-1.9s | -0.1-0.2s |
| **Non-Composited Animations** | 5 | 2-3 | -2-3 elements |

### Desktop (After Fixes)
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **Performance Score** | 88 | 90-95 | +2-7 points |
| **Non-Composited Animations** | 6 | 2-3 | -3-4 elements |

---

## 🎯 Action Plan

### Immediate (This Week)
1. ✅ Verify mobile LCP fix is working (check CSS specificity)
2. 🔧 Fix mobile LCP element render delay (add more specific CSS rule)
3. 🔧 Disable scroll-reveal-3d on mobile
4. 🔧 Optimize nav-link color transitions

### Short-term (Next Week)
5. 🔧 Optimize CTA background image transitions
6. 🔧 Re-compress cta-get-in-touch-480w.avif

### Long-term (Future)
7. Consider Three.js code splitting
8. Monitor and optimize GTM loading further

---

## 📝 Notes

### Mobile LCP Element
The LCP element is the third span in the hero title: "& CREATIVE" with class `text-reveal delay-2`. This element has a 750ms render delay due to:
1. Animation delay (`delay-2` = 0.4s)
2. Animation duration (1s)
3. Initial opacity state

Even though we disabled animations on mobile, the CSS may not be specific enough or the element may need JavaScript intervention.

### Non-Composited Animation Properties
The following CSS properties trigger non-composited animations:
- `margin-bottom` (layout property)
- `scrollbar-color` (paint property)
- `color` (paint property)
- `background-image` (paint property)

These should be replaced with composited properties:
- `transform` (composited)
- `opacity` (composited)
- `box-shadow` (composited, but use sparingly)

---

**Last Updated:** December 13, 2025  
**Next Review:** After implementing high-priority fixes

