# PageSpeed Insights Results - December 13, 2025 (After Fixes)

**Report URLs:**
- Desktop: https://pagespeed.web.dev/analysis/https-logi-ink-co-za/pi5mnyh08k?form_factor=desktop
- Mobile: https://pagespeed.web.dev/analysis/https-logi-ink-co-za/pi5mnyh08k?form_factor=mobile

**Date Analyzed:** December 13, 2025, 12:43 PM  
**Previous Report:** December 13, 2025, 12:26 PM

---

## 📊 Performance Score Comparison

### Desktop
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Performance** | 88 | **91** | ✅ **+3 points** |
| **Accessibility** | 100 | 100 | ✅ Maintained |
| **Best Practices** | 96 | 96 | ✅ Maintained |
| **SEO** | 100 | 100 | ✅ Maintained |

### Mobile
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Performance** | 77 | **75** | ⚠️ **-2 points** |
| **Accessibility** | 100 | 100 | ✅ Maintained |
| **Best Practices** | 96 | 96 | ✅ Maintained |
| **SEO** | 100 | 100 | ✅ Maintained |

---

## 🎯 Core Web Vitals Comparison

### Desktop Metrics
| Metric | Before | After | Change | Status |
|--------|--------|-------|--------|--------|
| **FCP** | 0.4s | 0.5s | +0.1s | ✅ Still Excellent |
| **LCP** | 1.6s | 1.7s | +0.1s | ✅ Still Excellent |
| **TBT** | 60ms | 90ms | +30ms | ✅ Still Good |
| **CLS** | 0 | 0.007 | +0.007 | ✅ Still Excellent |
| **SI** | 2.4s | **1.3s** | ✅ **-1.1s** | ✅ **Significant Improvement!** |

### Mobile Metrics
| Metric | Before | After | Change | Status |
|--------|--------|-------|--------|--------|
| **FCP** | 2.0s | 1.9s | ✅ **-0.1s** | ✅ Improved |
| **LCP** | 5.6s | **6.8s** | ⚠️ **+1.2s** | 🔴 **Regression** |
| **TBT** | 0ms | 30ms | +30ms | ✅ Still Excellent |
| **CLS** | 0 | 0 | ✅ Maintained | ✅ Perfect |
| **SI** | 2.0s | 1.9s | ✅ **-0.1s** | ✅ Improved |

---

## 🔍 Key Findings

### ✅ Desktop Improvements

1. **Performance Score:** 88 → **91** (+3 points)
   - Excellent improvement!

2. **Speed Index:** 2.4s → **1.3s** (-1.1s)
   - **46% improvement!** This is a significant win.

3. **Non-Composited Animations:** 
   - **Removed from diagnostics!** The issue is no longer appearing in the report.
   - Our fixes successfully eliminated the non-composited animation warnings.

4. **Long Main-Thread Tasks:** 3 → 5
   - Slight increase, but still acceptable.

### ⚠️ Mobile Issues

1. **Performance Score:** 77 → **75** (-2 points)
   - Slight regression, but within normal variance.

2. **LCP Regression:** 5.6s → **6.8s** (+1.2s)
   - **CRITICAL:** This is a significant regression.
   - **LCP Element Changed:** Now `p.hero-subtitle` instead of `span.text-reveal.delay-2`
   - **Element Render Delay:** 520ms (down from 750ms, but still significant)
   - **TTFB:** 220ms (up from 180ms)

3. **Non-Composited Animations:**
   - **Removed from diagnostics!** Successfully eliminated.

4. **FCP & SI:** Both improved slightly (1.9s each)

---

## 🔴 Critical Issue: Mobile LCP Regression

### Problem Analysis

**LCP Element Changed:**
- **Before:** `span.text-reveal.delay-2` ("& CREATIVE")
- **After:** `p.hero-subtitle` ("We craft immersive digital experiences...")

**LCP Breakdown:**
- **TTFB:** 220ms (was 180ms) - slight increase
- **Element Render Delay:** 520ms (was 750ms) - improved, but still significant
- **Resource Load Delay:** ~6.0s (estimated)

**Root Cause:**
The hero subtitle (`p.hero-subtitle`) has class `fade-in delay-4`, which means:
- Animation delay: 0.8s (delay-4)
- Animation duration: 1s
- Total delay: ~1.8s before element is visible

Even though we disabled animations on mobile, the element may still have:
- Initial `opacity: 0` state
- Animation delay applied
- Font loading delay (Rajdhani font)

---

## 🔧 Recommended Fixes

### 1. Fix Mobile LCP Element (Hero Subtitle)

**Priority:** 🔴 **CRITICAL**

**Issue:** Hero subtitle has `fade-in delay-4` which causes 520ms render delay.

**Fix:**
```css
/* In css/utils/animations.css - Mobile section */
@media (max-width: 768px) {
  /* Ensure hero subtitle (new LCP element) is immediately visible */
  .hero-subtitle.fade-in {
    opacity: 1 !important;
    animation: none !important;
    animation-delay: 0s !important;
  }

  .hero-subtitle.delay-4 {
    animation-delay: 0s !important;
  }
}
```

**Expected Impact:**
- Element render delay: 520ms → ~0ms
- LCP: 6.8s → **5.2-5.5s**
- Performance score: 75 → **80-82**

---

### 2. Preload Hero Subtitle Font

**Priority:** 🟡 **MEDIUM**

**Issue:** Hero subtitle uses Rajdhani font, which may not be loaded when LCP element renders.

**Fix:**
```html
<!-- In index.html, ensure Rajdhani-Regular is preloaded -->
<link
  rel="preload"
  href="./assets/fonts/Rajdhani/woff2/Rajdhani-Regular-subset.woff2"
  as="font"
  crossorigin="anonymous"
/>
```

**Note:** This is already implemented, but verify it's working correctly.

---

### 3. Optimize Hero Subtitle Loading

**Priority:** 🟡 **MEDIUM**

**Considerations:**
- Hero subtitle is below the hero title
- It may not be the actual LCP element in all cases
- Font loading could be the bottleneck

**Alternative Fix:**
If the subtitle continues to be the LCP element, consider:
- Making it immediately visible (no animation)
- Using system fonts as fallback
- Inlining critical text

---

## 📈 Remaining Issues

### Desktop
1. **Unused JavaScript:** 253 KiB (Three.js + GTM)
   - Status: Already optimized with lazy loading
   - Impact: Low (doesn't affect score significantly)

2. **Main-Thread Work:** 2.6s
   - Status: Acceptable
   - Long tasks: 5 (slight increase from 3)

3. **CLS:** 0.007 (very slight)
   - Status: Still excellent
   - Monitor for any increases

### Mobile
1. **LCP:** 6.8s (CRITICAL)
   - Priority: Fix hero subtitle animation delay
   - Target: < 2.5s (ambitious) or < 4.0s (realistic)

2. **Image Delivery:** 14 KiB savings available
   - File: `cta-get-in-touch-480w.avif`
   - Status: Pending image compression

3. **Unused JavaScript:** 111 KiB (GTM)
   - Status: Already optimized
   - Impact: Low

---

## ✅ Successfully Fixed Issues

1. ✅ **Non-Composited Animations:** Eliminated on both desktop and mobile
2. ✅ **Desktop Performance Score:** Improved from 88 to 91
3. ✅ **Desktop Speed Index:** Improved from 2.4s to 1.3s (46% improvement!)
4. ✅ **Mobile FCP:** Improved from 2.0s to 1.9s
5. ✅ **Mobile SI:** Improved from 2.0s to 1.9s

---

## 🎯 Next Steps

### Immediate (This Week)
1. 🔴 **Fix mobile LCP element render delay** (hero subtitle)
2. 🔴 **Verify font preloading** is working correctly
3. 🟡 **Re-compress CTA image** (14 KiB savings)

### Short-term (Next Week)
4. Monitor mobile LCP after fixes
5. Test on real devices
6. Verify LCP element consistency

### Long-term
7. Consider further optimizations if LCP remains high
8. Monitor Core Web Vitals in Search Console

---

## 📝 Notes

### LCP Element Variability
The LCP element can change between page loads based on:
- Network conditions
- Font loading timing
- Image loading timing
- Viewport size

This explains why the LCP element changed from the hero title span to the hero subtitle. We need to ensure **all potential LCP elements** are optimized.

### Animation Disabling
Our mobile animation disabling is working (non-composited animations removed), but we need to be more aggressive with the hero subtitle specifically.

### Desktop Success
The desktop improvements are excellent:
- Performance score: +3 points
- Speed Index: -1.1s (46% improvement)
- Non-composited animations: Eliminated

---

**Last Updated:** December 13, 2025, 12:43 PM  
**Status:** Desktop improved significantly, mobile LCP needs attention

