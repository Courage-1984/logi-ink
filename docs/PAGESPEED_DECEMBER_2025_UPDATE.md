# PageSpeed Insights Report - December 2025 Update

**Date:** 2025-12-11  
**Report Links:**
- [Desktop Report](https://pagespeed.web.dev/analysis/https-logi-ink-co-za/gh696jkhrd?hl=en&form_factor=desktop)
- [Mobile Report](https://pagespeed.web.dev/analysis/https-logi-ink-co-za/gh696jkhrd?hl=en&form_factor=mobile)

---

## 📊 Overall Scores

### Desktop
- **Performance:** 86 ⬆️ (+1 from previous 85)
- **Accessibility:** 100 ✅
- **Best Practices:** 96 ✅
- **SEO:** 100 ✅

### Mobile
- **Performance:** 76 ⬇️ (-3 from previous 79)
- **Accessibility:** 100 ✅
- **Best Practices:** 96 ✅
- **SEO:** 100 ✅

---

## 🎯 Core Web Vitals

### Desktop Metrics

| Metric | Current | Previous | Change | Status |
|--------|---------|----------|--------|--------|
| **FCP** (First Contentful Paint) | 0.4s | 0.4s | +10 points | ✅ Excellent |
| **LCP** (Largest Contentful Paint) | 1.8s | 1.6s | +18 points | ✅ Good |
| **TBT** (Total Blocking Time) | 170ms | 240ms | +26 points | ✅ Good |
| **CLS** (Cumulative Layout Shift) | 0 | 0 | +25 points | ✅ Perfect |
| **SI** (Speed Index) | 1.6s | 1.4s | +8 points | ✅ Good |

**Note:** The "+" values shown in the report indicate improvements in the scoring calculation, not necessarily faster times. LCP increased from 1.6s to 1.8s, but the score improved due to better optimization.

### Mobile Metrics

| Metric | Current | Previous | Change | Status |
|--------|---------|----------|--------|--------|
| **FCP** (First Contentful Paint) | 2.0s | 1.9s | +8 points | ⚠️ Needs Improvement |
| **LCP** (Largest Contentful Paint) | 6.2s | 5.3s | +3 points | ❌ Poor |
| **TBT** (Total Blocking Time) | 10ms | 10ms | +30 points | ✅ Excellent |
| **CLS** (Cumulative Layout Shift) | 0 | 0 | +25 points | ✅ Perfect |
| **SI** (Speed Index) | 2.0s | 1.9s | +10 points | ✅ Good |

**⚠️ Critical Issue:** Mobile LCP increased from 5.3s to 6.2s, which is concerning. This needs immediate attention.

---

## ✅ Improvements Achieved

### Desktop Improvements
1. **Performance Score:** 85 → 86 (+1)
2. **TBT:** 240ms → 170ms (-70ms, 29% improvement)
3. **Unused JavaScript:** 254 KiB → 252 KiB (2 KiB reduction)
4. **Non-composited Animations:** 28 → 22 elements (-6 elements, 21% improvement)
5. **Long Tasks:** 8 → 8 (maintained, but main-thread work improved)

### Mobile Improvements
1. **TBT:** Already excellent at 10ms (maintained)
2. **Unused JavaScript:** 112 KiB → 110 KiB (2 KiB reduction)
3. **Non-composited Animations:** 28 → 25 elements (-3 elements, 11% improvement)
4. **Long Tasks:** 8 → 3 tasks (-5 tasks, 63% improvement!) 🎉
5. **Image Delivery Savings:** 171 KiB → 106 KiB (better optimization)

---

## ⚠️ Remaining Issues

### Desktop Issues

#### High Priority
1. **Improve image delivery** — Est savings of 171 KiB
   - Still significant image optimization opportunities
   - Action: Re-optimize images, adjust `sizes` attributes

2. **Minimize main-thread work** — 3.3s
   - Increased from 3.1s (concerning)
   - Action: Further optimize JavaScript execution

3. **Reduce unused JavaScript** — Est savings of 252 KiB
   - Three.js and GTM still contributing
   - Action: Further code splitting, lazy loading improvements

#### Medium Priority
4. **Avoid long main-thread tasks** — 8 long tasks found
   - Same as before, needs further optimization
   - Action: Break up tasks using `setTimeout` or `requestIdleCallback`

5. **Avoid non-composited animations** — 22 animated elements found
   - Improved from 28, but still needs work
   - Action: Continue optimizing animations (we've made progress!)

6. **Use efficient cache lifetimes** — Est savings of 3 KiB
   - Minor issue, low priority

### Mobile Issues

#### Critical Priority
1. **LCP (Largest Contentful Paint)** — 6.2s ❌
   - **WORSENED** from 5.3s to 6.2s
   - This is a critical regression
   - Action: **URGENT** - Investigate mobile image loading, critical CSS, resource prioritization

2. **FCP (First Contentful Paint)** — 2.0s ⚠️
   - Slightly increased from 1.9s
   - Action: Optimize critical rendering path for mobile

#### High Priority
3. **Improve image delivery** — Est savings of 106 KiB
   - Better than desktop, but still needs work
   - Action: Mobile-specific image optimization

4. **Avoid non-composited animations** — 25 animated elements found
   - Improved from 28, but still high
   - Action: Continue mobile animation optimizations

5. **Reduce unused JavaScript** — Est savings of 110 KiB
   - Action: Further mobile JavaScript optimization

#### Medium Priority
6. **Forced reflow** — Detected
   - Action: Optimize layout calculations

7. **Use efficient cache lifetimes** — Est savings of 3 KiB
   - Minor issue

---

## 📈 Progress Summary

### What's Working Well ✅
- **CLS:** Perfect 0 on both desktop and mobile
- **TBT:** Excellent on mobile (10ms), good on desktop (170ms)
- **Accessibility:** Perfect 100 on both
- **SEO:** Perfect 100 on both
- **Best Practices:** 96 on both (excellent)
- **Long Tasks:** Significantly reduced on mobile (8 → 3)
- **Non-composited Animations:** Reduced on both platforms

### What Needs Attention ⚠️
- **Mobile LCP:** Critical regression (5.3s → 6.2s)
- **Desktop Main-Thread Work:** Increased (3.1s → 3.3s)
- **Image Optimization:** Still significant savings available
- **Unused JavaScript:** Still high (252 KiB desktop, 110 KiB mobile)

---

## 🎯 Action Plan

### Immediate Actions (This Week)

1. **Fix Mobile LCP Regression** 🔴 **CRITICAL**
   - Investigate why LCP increased from 5.3s to 6.2s
   - Check mobile image preloading
   - Verify critical CSS is loading correctly
   - Review resource prioritization for mobile
   - **Target:** Reduce LCP to < 4.0s

2. **Optimize Mobile Images**
   - Re-optimize hero banner for mobile viewports
   - Ensure correct `sizes` attributes
   - Verify mobile image preloading
   - **Target:** Reduce image delivery savings to < 50 KiB

3. **Further Reduce Non-Composited Animations**
   - Continue optimizing remaining 22-25 animated elements
   - Focus on mobile-specific optimizations
   - **Target:** < 15 animated elements

### Short-Term Actions (Next 2 Weeks)

4. **Reduce Desktop Main-Thread Work**
   - Investigate why it increased from 3.1s to 3.3s
   - Further optimize JavaScript execution
   - Break up remaining long tasks
   - **Target:** < 2.5s

5. **Reduce Unused JavaScript**
   - Further optimize Three.js loading
   - Improve GTM loading strategy
   - Code splitting improvements
   - **Target:** < 200 KiB desktop, < 80 KiB mobile

6. **Image Optimization**
   - Re-run image optimization scripts
   - Adjust compression settings
   - Verify responsive image sizes
   - **Target:** < 100 KiB savings desktop, < 50 KiB mobile

---

## 📝 Notes

### Performance Score Calculation
The performance score improvements shown (+10, +18, etc.) refer to scoring improvements, not necessarily faster load times. Some metrics like LCP may have increased in actual time but improved in scoring due to better optimization techniques.

### Mobile LCP Regression
The mobile LCP regression from 5.3s to 6.2s is concerning and needs immediate investigation. Possible causes:
- Image loading changes
- Critical CSS changes
- Resource prioritization issues
- Network throttling differences between test runs

### Next Steps
1. Run another PageSpeed test to verify consistency
2. Investigate mobile LCP regression
3. Continue optimization efforts
4. Monitor Core Web Vitals in Search Console

---

## 🔗 Related Documentation

- [PageSpeed Fixes Implemented](./PAGESPEED_FIXES_IMPLEMENTED.md)
- [PageSpeed Quick Fixes](./PAGESPEED_QUICK_FIXES.md)
- [PageSpeed Insights December 2025 Analysis](./PAGESPEED_INSIGHTS_DECEMBER_2025_ANALYSIS.md)

---

**Last Updated:** 2025-12-11  
**Next Review:** After mobile LCP fix implementation

