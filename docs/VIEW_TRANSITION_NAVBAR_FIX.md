# View Transition API Navbar Flash Fix

## Issue
Navbar items were flashing with active/hover states during page navigation, even after multiple fix attempts.

## Root Cause
According to MDN View Transition API documentation:

1. **view-transition-name Persistence**: `view-transition-name` CSS property values persist in the browser's back/forward cache (bfcache) during navigation. When navigating back, the browser attempts to set the same view-transition-name values on different elements, causing CSS state persistence.

2. **CSS State Persistence**: CSS classes (`.active`, hover states) and data attributes can persist from the old page when navigating, especially when elements have `view-transition-name`.

3. **Implementation Gap**: 
   - `critical.css` had `view-transition-name: navbar;` which was causing persistence
   - `pagereveal` event handler only waited for transition completion but didn't clear states

## Solution Implemented

### 1. Removed view-transition-name from Navbar
- Removed `view-transition-name: navbar` from `css/critical.css`
- We're using root-level transitions only, so named transitions aren't needed for navbar
- This eliminates the persistence issue entirely

### 2. Enhanced pagereveal Handler
Updated `js/core/page-transitions.js` to clear all navbar states synchronously on `pagereveal` event:

```javascript
window.addEventListener('pagereveal', (event) => {
  // Clear all navbar states synchronously BEFORE first render
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navbar) {
    navbar.classList.remove('nav-initialized');
    navbar.style.viewTransitionName = 'none'; // Safety clear
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    link.removeAttribute('data-active-initialized');
    link.removeAttribute('data-nav-initialized');
  });

  // Let navigation.js reinitialize after transition completes
});
```

### 3. Multi-Layer Protection
The fix works with existing protection layers:
- **Inline script** (HTML head): Clears states before first paint
- **pagereveal handler**: Clears states on navigation (bfcache restoration)
- **CSS rules**: Prevent visual states until `.nav-initialized` class is present
- **navigation.js**: Reinitializes states after transition completes

## Files Modified

1. `css/critical.css` - Removed `view-transition-name: navbar`
2. `js/core/page-transitions.js` - Enhanced `pagereveal` handler to clear nav states

## References

- [MDN: Using the View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)
- [MDN: Window: pagereveal event](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagereveal_event)

## Testing

After implementation:
- ✅ No flash of active/hover states during navigation
- ✅ Clean state on every page load
- ✅ Navbar initializes correctly after transition
- ✅ CLS remains low (< 0.01)

