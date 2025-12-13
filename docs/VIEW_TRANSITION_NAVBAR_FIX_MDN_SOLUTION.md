# View Transition Navbar Fix - MDN Recommended Solution

## Problem Summary

During View Transitions, the navbar was flashing with active/hover states because:

1. **Old page snapshot includes navbar**: When navigating, the browser captures a static snapshot of the old page (including the navbar with active states) that animates out during the transition.

2. **CSS rules don't affect snapshots**: Our CSS rules to hide the navbar only affect the NEW page DOM, not the old page's static snapshot that's already been captured.

3. **Root cause**: The navbar was included in the `root` snapshot because it doesn't have `view-transition-name: none` set before the snapshot is captured.

## Solution: Exclude Navbar from Snapshots

Based on [MDN View Transition API documentation](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using), we exclude the navbar from View Transition snapshots by:

1. Setting `view-transition-name: none` on the navbar BEFORE snapshots are captured
2. Clearing it AFTER snapshots are captured to prevent bfcache persistence

### Implementation

**`js/core/page-transitions.js`**:

```javascript
// pageswap: Fired when old page is about to unload
window.addEventListener('pageswap', async (event) => {
  if (!event.viewTransition) return;
  
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    // Exclude navbar from old page snapshot
    navbar.style.viewTransitionName = 'none';
    
    // Clear after snapshot to prevent bfcache persistence
    await event.viewTransition.ready;
    navbar.style.viewTransitionName = '';
  }
});

// pagereveal: Fired when new page is first rendered
window.addEventListener('pagereveal', async (event) => {
  if (!event.viewTransition) return;
  
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    // Exclude navbar from new page snapshot
    navbar.style.viewTransitionName = 'none';
    
    // Clear navbar states and keep hidden
    navbar.classList.remove('nav-initialized');
    navbar.style.visibility = 'hidden';
    navbar.style.opacity = '0';
    
    // Clear after snapshot
    await event.viewTransition.ready;
    navbar.style.viewTransitionName = '';
  }
  
  // Clear all link states
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    link.removeAttribute('data-active-initialized');
    link.removeAttribute('data-nav-initialized');
  });
});
```

**`js/core/navigation.js`**:

```javascript
// Show navbar after View Transition completes
const navbar = document.querySelector('.navbar');
if (navbar) {
  navbar.classList.add('nav-initialized');
  
  if (!document.activeViewTransition) {
    // No transition, show immediately
    navbar.style.visibility = '';
    navbar.style.opacity = '';
  } else {
    // Wait for transition to complete
    document.activeViewTransition.finished.then(() => {
      navbar.style.visibility = '';
      navbar.style.opacity = '';
    });
  }
}
```

## Font Loading Optimizations

### Changes Made

1. **Rajdhani Regular**: Changed from `font-display: optional` to `font-display: swap`
   - **Rationale**: Since Rajdhani Regular is preloaded and used for body text, `swap` ensures faster display without layout shift (due to metric matching).

2. **Font Preload Links**: Added `type="font/woff2"` to all font preload links
   - **Rationale**: Helps browser parse and prioritize font requests correctly.

### Files Modified

- `css/fonts.css` - Changed Rajdhani Regular to `font-display: swap`
- `css/critical.css` - Changed Rajdhani Regular to `font-display: swap`
- All HTML files - Added `type="font/woff2"` to font preload links

## Benefits

1. **No navbar flash**: Navbar is excluded from snapshots, so the old page's navbar (with active states) never appears during transitions.

2. **No bfcache issues**: We clear `view-transition-name` after snapshots, preventing bfcache persistence issues documented in MDN.

3. **Faster font display**: `swap` ensures fonts display faster while maintaining metric matching to prevent CLS.

4. **Better preload parsing**: `type="font/woff2"` helps browsers prioritize font requests correctly.

## References

- [MDN: Using the View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)
- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Chrome: View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions)

## Testing

After implementing these changes:
- Navigate between pages - navbar should not flash with active/hover states
- Check browser console for `[PAGESWAP]` and `[PAGEREVEAL]` logs
- Verify fonts load quickly without layout shift
- Test back/forward navigation to ensure no bfcache issues

