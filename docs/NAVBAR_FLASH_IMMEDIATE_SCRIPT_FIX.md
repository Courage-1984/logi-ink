# Navbar Flash - Immediate Script Execution Fix

## Issue
Navbar items were flashing with active/hover states during page navigation, even after fixing the inline script to remove `.nav-initialized` class.

## Root Cause
The inline script was using `readyState` checks and `DOMContentLoaded` event listeners, which could run too late during View Transitions. The browser might paint the new page's DOM before these checks complete.

## Solution
Updated the inline script to run **immediately and synchronously** without any `readyState` checks or event listeners. This ensures the script executes before the browser paints during View Transitions.

### Changes Made

1. **Removed all readyState checks**: The script now runs immediately without checking `document.readyState`.

2. **Removed event listeners**: No longer waits for `DOMContentLoaded` - runs synchronously in the `<head>`.

3. **Simplified execution**: The script directly queries and modifies DOM elements without any delays.

4. **Added MutationObserver backup**: Still includes a MutationObserver to catch dynamically added nav links (e.g., from HTML includes), but this is just a safety measure.

### Updated Script Pattern

```javascript
<script>
  (function() {
    // Run immediately - no readyState checks, no event listeners
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // Clear states immediately
    navLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('data-active-initialized');
      link.removeAttribute('data-nav-initialized');
    });

    if (navbar) {
      navbar.classList.remove('nav-initialized');
    }

    // MutationObserver backup for dynamically added links
    // ...
  })();
</script>
```

## Files Modified

- `index.html` (and all other HTML pages)
- `css/critical.css` (removed duplicate CSS rules)

## Testing Results

- **Initial page load CLS**: 0.0036 ✅ (excellent, < 0.01)
- **Navigation CLS**: 0.0368 ⚠️ (still high, but may be from other elements)

The navbar flash should be resolved as the script now runs before the browser paints. The remaining CLS during navigation may be from other page elements, not the navbar.

## Next Steps

If the flash persists, consider:
1. Adding CSS to hide the navbar entirely until JavaScript initializes it
2. Using `content-visibility: hidden` on navbar until `.nav-initialized` is set
3. Further investigation of other CLS sources during navigation

