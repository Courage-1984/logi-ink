# Root Cause Hypothesis: Mobile Menu Not Visible

## Symptom Summary
Mobile menu does not appear when hamburger button is clicked on mobile viewport (< 768px width).

## Root Cause Hypothesis
**Desktop `.nav-menu` styles in `css/components/navigation.css` (lines 84-101) are applied to ALL screen sizes** because they lack a media query wrapper. These styles set `position: relative`, `left: auto`, etc., which conflict with mobile styles in `responsive.css` that use `position: fixed !important` and `left: -100% !important`. Even with `!important` flags, CSS cascade and specificity can cause conflicts when desktop rules apply globally.

## Evidence
1. **CSS Cascade Analysis:**
   - `css/components/navigation.css` line 84-101: `.nav-menu` rule has NO media query, applies to all screens
   - Sets `position: relative`, `left: auto`, `width: auto`, etc. on mobile
   - `css/utils/responsive.css` line 259-299: Mobile override with `!important` flags
   - CSS loading order: `navigation.css` loads before `responsive.css` (line 18 vs 65 in `main.css`)
   - Even with `!important`, having conflicting base rules can cause rendering issues

2. **DOM Structure Verified:**
   - `#navMenu` exists in `partials/navbar.html` line 10
   - `#hamburger` exists in `partials/navbar.html` line 26
   - HTML structure is correct

3. **JavaScript Verified:**
   - `navMenu` variable is correctly defined (line 58)
   - Click handler attaches correctly
   - Inline styles are being set

4. **Why Previous Fixes Failed:**
   - Previous fixes added more `!important` flags, inline styles, z-index increases
   - But the root cause: **desktop CSS rules were being applied on mobile**
   - This created a conflict where `position: relative` (desktop) fought with `position: fixed !important` (mobile)
   - CSS cascade and browser rendering can have issues even with `!important` when base rules conflict

## Risk Analysis
- **Low Risk:** Wrapping existing styles in media query - no functional changes
- **No Breaking Changes:** Desktop behavior unchanged, mobile now works correctly
- **Rollback:** Simple - restore backup file

## Proposed Fix
Wrap the desktop `.nav-menu` styles in `@media (min-width: 768px)` so they only apply on desktop, preventing conflicts with mobile styles.

## Rollback Plan
Restore `css/components/navigation.css` from backup:
```
ops/break_persistent_issue/20251209-182640/backups/navigation.css
```

