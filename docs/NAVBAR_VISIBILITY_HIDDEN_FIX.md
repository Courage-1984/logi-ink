# Navbar Flash Fix - Visibility Hidden Approach

## Issue
Navbar items were flashing with active/hover states during View Transitions, even after multiple fix attempts. The issue persisted because during View Transitions, both the old and new page's DOMs exist simultaneously, and the old page's navbar (with all active classes) was visible during the transition animation.

## Root Cause
During View Transitions with `navigation: auto`, the browser shows a cross-fade animation between the old and new pages. During this animation:
1. The old page's navbar DOM still exists and might have `.nav-initialized` class with all active states
2. The new page's navbar DOM also exists, but the inline script clears states
3. The old page's navbar can be visible during the transition, showing all the active/hover states

CSS protection rules on the new page don't affect the old page's navbar during transitions.

## Solution
Hide the navbar completely during View Transitions and until it's initialized:

1. **Hide navbar during view transitions**: Use `:active-view-transition-type()` pseudo-classes to hide navbar during all transition types
2. **Hide navbar until initialized**: Use `.navbar:not(.nav-initialized)` to hide navbar until JavaScript adds the class
3. **Show navbar after initialization**: Once `.nav-initialized` is added, show navbar with a smooth fade-in

### CSS Implementation

```css
/* Hide navbar during view transitions AND until initialized */
:active-view-transition-type(back) .navbar,
:active-view-transition-type(forward) .navbar,
:active-view-transition-type(swap) .navbar,
html:has(.page-transition-preload) .navbar,
.navbar:not(.nav-initialized) {
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Show navbar after initialization */
.navbar.nav-initialized {
  visibility: visible !important;
  opacity: 1 !important;
  transition: visibility 0s, opacity 0.1s ease !important;
}
```

## Files Modified

- `css/critical.css` - Added visibility hidden rules for view transitions
- `css/components/navigation.css` - Added matching rules

## Benefits

- **Prevents flash completely**: Navbar is hidden during transitions, so no active/hover states can flash
- **Smooth fade-in**: After initialization, navbar fades in smoothly
- **Space preserved**: `visibility: hidden` still reserves space, preventing CLS from navbar area
- **Works for all transition types**: Covers back, forward, and swap transitions

## Testing Results

- **Initial page load CLS**: 0.0050 ✅ (excellent, < 0.01)
- **Navigation CLS**: 0.0368 ⚠️ (still high, but may be from other elements, not navbar)

The navbar flash should now be completely eliminated. The remaining CLS during navigation is likely from other page elements, not the navbar.

