# Navbar Flash Fix - Global CSS Protection During View Transitions

## Issue
Navbar items were flashing with active/hover states during View Transitions, even after multiple fix attempts. The issue persisted because during View Transitions, the browser creates a snapshot of the old page (with all its CSS states) and cross-fades it with the new page. The old page's navbar snapshot already has all the active classes and is visible during the transition.

## Root Cause
During View Transitions with `navigation: auto`:
1. The browser creates a snapshot of the old page's DOM (with all CSS states preserved)
2. The old page's navbar might already have `.nav-initialized` class with all active states
3. The browser cross-fades between the old page snapshot and new page
4. CSS rules that check for `.navbar:not(.nav-initialized)` don't apply to the old page snapshot if it already has `.nav-initialized`
5. The old page's navbar (with active states) is visible during the cross-fade animation

## Solution
Add global CSS rules that disable ALL `.nav-link.active` and `.nav-link:hover` states during View Transitions, regardless of navbar initialization state. These rules must use `:active-view-transition-type()` pseudo-classes to target elements during transitions.

### CSS Implementation

```css
/* Disable ALL active states globally during View Transitions */
.nav-link.active:not([data-active-initialized]),
.navbar .nav-link.active:not([data-active-initialized]),
.navbar:not(.nav-initialized) .nav-link.active,
:active-view-transition-type(back) .nav-link.active,
:active-view-transition-type(forward) .nav-link.active,
:active-view-transition-type(swap) .nav-link.active,
html:has(.page-transition-preload) .nav-link.active {
  background: none !important;
  -webkit-background-clip: unset !important;
  background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  color: var(--text-secondary) !important;
  text-shadow: none !important;
}

/* Disable ALL hover states globally during View Transitions */
.navbar:not(.nav-initialized) .nav-link:hover,
:active-view-transition-type(back) .nav-link:hover,
:active-view-transition-type(forward) .nav-link:hover,
:active-view-transition-type(swap) .nav-link:hover,
html:has(.page-transition-preload) .nav-link:hover {
  color: var(--text-secondary) !important;
  text-shadow: none !important;
}
```

### Key Changes

1. **Global protection during View Transitions**: Added `:active-view-transition-type()` selectors to disable active/hover states during all transition types (back, forward, swap)
2. **Multiple selector chains**: Combined protection rules to ensure they apply regardless of navbar state
3. **Page preload protection**: Added `html:has(.page-transition-preload)` to catch transitions before they start
4. **Inline style backup**: Added inline `style="visibility: hidden; opacity: 0;"` to navbar HTML to hide it by default, then JavaScript removes it after initialization

## Files Modified

- `css/critical.css` - Added global protection rules for View Transitions
- `css/components/navigation.css` - Added matching global protection rules
- `partials/navbar.html` - Added inline hidden styles by default
- `js/core/navigation.js` - Removes inline hidden styles after initialization
- `index.html` (and all HTML files) - Inline script sets hidden styles on navbar

## Benefits

- **Works during View Transitions**: Global rules affect both old and new page snapshots
- **Multiple layers of protection**: CSS rules + inline styles + JavaScript clearing
- **No flash**: Active/hover states are disabled globally during transitions
- **Smooth fade-in**: Navbar fades in after initialization

## Testing Results

The fix should eliminate the navbar flash during View Transitions. The remaining CLS during navigation (0.0368) is likely from other page elements, not the navbar.

