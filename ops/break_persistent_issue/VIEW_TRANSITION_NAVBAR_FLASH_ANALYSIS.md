# View Transition API Navbar Flash - Root Cause Analysis

## Problem Statement

When navigating between pages, all navbar items flash with active/hover states for a split second, even after multiple attempts to fix it.

## Root Cause Identified

Based on MDN documentation and web research, the issue is caused by **CSS state persistence during View Transitions**:

1. **view-transition-name Persistence**: According to MDN: *"If we left them set, they would persist in the page state saved in the bfcache upon navigation. If the back button was then pressed, the pagereveal event handler of the page being navigated back to would then attempt to set the same view-transition-name values on different elements."*

2. **CSS State Persistence**: CSS classes (`.active`, hover states) and data attributes can persist from the old page when navigating, especially when elements have `view-transition-name`.

3. **Current Implementation Gap**: 
   - `critical.css` line 254 still has `view-transition-name: navbar;`
   - `pagereveal` event handler in `js/core/page-transitions.js` only waits for transition completion
   - No clearing of CSS states or `view-transition-name` on `pagereveal`

## Research Findings

### Key MDN Documentation Quotes

From "Using the View Transition API" (MDN):
> "If we left them set, they would persist in the page state saved in the bfcache upon navigation."

From "Window: pagereveal event" (MDN):
> "Fired when a document is first rendered, either when loading a fresh document from the network or activating a document (either from back/forward cache (bfcache) or prerender). This is useful in the case of cross-document (MPA) view transitions for manipulating an active transition from the inbound page of a navigation."

### Stacking Context Issues

Research shows:
- View Transition API creates its own stacking context that can ignore z-index
- Elements with `view-transition-name` can appear above fixed elements during transitions
- Overflow can be ignored during transitions

## Recommended Solution

### Approach 1: Remove view-transition-name (Recommended)

Since we're not using named transitions for the navbar (only root-level transition), remove `view-transition-name: navbar` from `critical.css`. This eliminates the persistence issue entirely.

### Approach 2: Clear on pagereveal

If we want to keep `view-transition-name` for smoother transitions, we must clear it on `pagereveal`:

```javascript
window.addEventListener('pagereveal', (event) => {
  // Clear view-transition-name from navbar to prevent persistence
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.style.viewTransitionName = 'none';
  }
  
  // Clear all nav states synchronously BEFORE first render
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    link.removeAttribute('data-active-initialized');
    link.removeAttribute('data-nav-initialized');
  });
  
  // Remove nav-initialized class from navbar
  navbar?.classList.remove('nav-initialized');
  
  if (event.viewTransition) {
    event.viewTransition.finished.then(() => {
      // Let navigation.js reinitialize after transition
    });
  }
});
```

## Implementation Blueprint

1. **Remove `view-transition-name: navbar` from `critical.css`** (simplest fix)
2. **Enhance `pagereveal` handler** to clear all nav states synchronously
3. **Ensure inline script and pagereveal work together** - both clear states, navigation.js reinitializes after

## Compatibility Statement

- ✅ No breaking changes to existing functionality
- ✅ Aligns with MDN best practices
- ✅ Works with current View Transition API implementation
- ✅ Maintains all existing CSS protection rules

## Expected Outcome

- No flash of active/hover states during navigation
- Clean state on every page load
- Navbar initializes correctly after transition completes
- CLS remains low (< 0.01)

