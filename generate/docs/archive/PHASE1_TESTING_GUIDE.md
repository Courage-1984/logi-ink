# Phase 1 Zero-CLS Testing Guide

This guide explains how to test the Phase 1 implementation to verify that the zero-CLS fix is working correctly.

## Overview

Phase 1 implements a zero-CLS export strategy by:
- Using CSS `transform: scale()` instead of geometric width/height changes
- Maintaining element at original 1x DOM size (prevents Layout/Reflow)
- Scaling visually via CSS transform (GPU-accelerated, zero CLS)
- Using double `requestAnimationFrame` for synchronization
- Setting html2canvas `scale: 1` (CSS transform handles scaling)

## Testing Methods

### Method 1: Browser DevTools Performance Panel (Recommended)

1. **Open the generator:**
   - Navigate to `generate/generate.html` in your browser
   - Or serve it via a local server

2. **Open DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - Go to the **Performance** tab

3. **Start recording:**
   - Click the **Record** button (circle icon)
   - Click the **Export** button in the generator
   - Wait for export to complete
   - Stop the recording

4. **Analyze results:**
   - Look for **Layout Shift** events in the timeline
   - Check the **Experience** section for CLS score
   - **Target:** CLS should be **0.0** or very close to 0 (< 0.01)

### Method 2: CLS Monitor Utility (Automated)

A CLS monitoring utility has been integrated into the export function:

1. **Open the generator:**
   - Navigate to `generate/generate.html` in your browser
   - Open DevTools Console (`F12` → Console tab)

2. **The monitor auto-initializes:**
   - CLS monitoring is automatically enabled when you click Export
   - Results are logged to the console after export completes

3. **Check console output:**
   - Look for the **"EXPORT CLS REPORT"** section
   - **Target:** `Cumulative Layout Shift (CLS): 0.000000`
   - Success message: `✅ SUCCESS: Zero CLS detected - Phase 1 implementation working!`

### Method 3: Manual Visual Inspection

1. **Open the generator:**
   - Navigate to `generate/generate.html` in your browser
   - Position the preview canvas in view

2. **Watch the preview during export:**
   - Click the **Export** button
   - **Observe:** The preview canvas should NOT visibly shift, resize, or move
   - The element should remain visually stable throughout the export process

3. **Expected behavior:**
   - No visible layout shifts
   - No jumping or repositioning
   - Smooth export process without visual disruption

### Method 4: Chrome DevTools Layout Shift Visualization

1. **Open DevTools:**
   - Press `F12` → Go to **Performance** tab

2. **Enable Layout Shift visualization:**
   - In the Performance panel, check **"Experience"** checkbox
   - This shows layout shift events as purple rectangles

3. **Record export:**
   - Click Record
   - Click Export
   - Stop recording

4. **Check for purple rectangles:**
   - **Target:** No purple rectangles during export
   - Purple rectangles indicate layout shifts
   - If you see them, Phase 1 may need adjustment

## Test Scenarios

### Scenario 1: Standard Export (2x scale)
- **Action:** Export with default 2x quality
- **Expected:** Zero CLS, successful export

### Scenario 2: High-Resolution Export (4x scale)
- **Action:** Export with 4x quality (maximum)
- **Expected:** Zero CLS, successful export at 4800×2700px (for OG images)

### Scenario 3: Multiple Exports in Sequence
- **Action:** Export multiple times in quick succession
- **Expected:** Each export maintains zero CLS, no cumulative issues

### Scenario 4: Export with Different Image Types
- **Action:** Switch between OG Image and Twitter Card, export each
- **Expected:** Zero CLS for both image types

## Success Criteria

✅ **Phase 1 is successful if:**
- CLS score is **0.0** or **< 0.01** during export
- No visible layout shifts in the preview
- No layout shift events in Performance panel
- Export completes successfully with correct dimensions
- Console shows "Zero CLS detected" message

❌ **Phase 1 needs adjustment if:**
- CLS score is **> 0.01** during export
- Visible layout shifts occur
- Layout shift events appear in Performance panel
- Console shows warnings about CLS

## Troubleshooting

### Issue: CLS still detected (> 0.01)

**Possible causes:**
1. Font loading causing shifts (check font-display strategy)
2. Background images loading asynchronously
3. html2canvas not capturing CSS transform correctly

**Solutions:**
- Check font preloading in HTML
- Ensure all background images are preloaded
- Verify CSS transform is being applied correctly
- Consider Phase 2 (library migration) if html2canvas doesn't support transforms

### Issue: Export fails or produces incorrect dimensions

**Possible causes:**
1. html2canvas not capturing scaled element correctly
2. Dimension calculations incorrect

**Solutions:**
- Check console for errors
- Verify `scaledWidth` and `scaledHeight` calculations
- Test with different scale values (1x, 2x, 3x, 4x)
- Check html2canvas version compatibility

### Issue: Visual glitches in exported image

**Possible causes:**
1. html2canvas limitations with CSS transforms
2. Background patterns not rendering correctly
3. Logo masking issues

**Solutions:**
- This is expected with html2canvas v1.4.1 (known limitation)
- Phase 2 (library migration) will address this
- For now, verify CLS is zero (primary goal of Phase 1)

## Next Steps

After confirming Phase 1 is working (zero CLS):

1. **Document results:** Note any edge cases or issues
2. **Proceed to Phase 2:** Library migration to html-to-image for better CSS transform support
3. **Consider Phase 3:** Headless Server-Side Rendering for enterprise-grade reliability

## Additional Resources

- **Blueprint:** `generate/docs/_image_export_blueprint.md`
- **CLS Monitor:** `generate/js/test-cls-monitor.js`
- **Export Function:** `generate/js/export.js`

