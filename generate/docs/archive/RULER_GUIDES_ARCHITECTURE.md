# Enhanced Ruler/Guides System: Architectural Implementation

## Overview

This document outlines the architectural improvements made to the ruler/guides system per the specification. The implementation follows a strict MVC pattern with Canvas-based rendering for optimal performance.

## Key Architectural Changes

### 1. MVC Architecture

**Model (RulerState Singleton)**
- Centralized state management
- `positionPx` as source of truth (not percentages)
- Guide objects with `id`, `type`, `positionPx`, `colorIndex`, `isDragging`
- State flags: `isActive`, `snapEnabled`, `currentUnit`, `gridSize`

**View (Canvas Rendering)**
- Separate canvas layers:
  - `rulerCanvas`: Cached ruler marks (only redrawn on size/unit change)
  - `guideCanvas`: Dynamic guides, crosshair, distance indicators (RAF loop)
- DOM overlays for delete buttons (hybrid architecture)

**Controller (Event Handlers)**
- Optimized mouse tracking (state updates only)
- Keyboard shortcuts with confirmation dialogs
- Guide dragging with snap-to-grid

### 2. Canvas-Based Rendering

**Why Canvas Instead of DOM?**
- Performance: 60 FPS during mouse movement
- Native rendering: No layout recalculations
- Glow effects: Canvas Shadow API for crosshair
- Batching: Draw guides grouped by color

**Implementation:**
- `renderRulerMarks()`: Cached ruler layer (redrawn only on changes)
- `renderGuideLayer()`: Dynamic layer in RAF loop
- `renderDistanceIndicators()`: Debounced O(NlogN) calculation

### 3. Position Storage: Pixels as Source of Truth

**Critical Design Decision:**
- Store `positionPx` (absolute canvas pixels) in Guide objects
- Convert to percentages/em only for display
- Prevents floating-point accumulation errors
- Ensures guides return to exact positions

**Unit Conversion Layer:**
- `UnitConverter.pxToPercent()`
- `UnitConverter.pxToEm()`
- `UnitConverter.formatForDisplay()`: Smart formatting with abbreviations

### 4. Smart Ruler Engine

**Heckbert's "Nice Numbers" Algorithm:**
- Calculates optimal tick intervals (multiples of 1, 2, or 5)
- Adapts to viewport size (Table 2 from spec)
- Major/minor tick hierarchy
- Smart number formatting (1.5k for 1500px)

### 5. Performance Optimizations

**RequestAnimationFrame Strategy:**
- Mouse events: Update state only (O(1))
- RAF loop: Render all visuals (batched)
- Prevents thread blocking during rapid movement

**Debounced Distance Calculation:**
- O(NlogN) sorting deferred until drag completes
- 50ms debounce timeout
- Only calculates when guides are stationary

**Canvas State Minimization:**
- Batch drawing by color
- Minimize `save()`/`restore()` calls
- Cache ruler marks (separate canvas)

### 6. Hybrid DOM/Canvas Architecture

**Guides: Canvas**
- Drawn on `guideCanvas` for performance
- Hit testing: 5px tolerance

**Delete Buttons: DOM**
- Absolutely positioned HTML elements
- Native hover/click detection
- Show on hover (opacity transition)
- Positioned at guide/ruler intersection

### 7. Snap-to-Grid Implementation

**Algorithm:**
```javascript
snappedPx = Math.round(targetPx / gridSize) * gridSize
```

**Integration:**
- Applied during drag (mousemove)
- Updates `positionPx` directly
- Visual feedback in real-time

### 8. Keyboard Shortcuts

- **H**: Add horizontal guide (center or first 100px mark)
- **V**: Add vertical guide (center)
- **C**: Clear all guides (with confirmation dialog)

**Confirmation Required:**
- Destructive operations require explicit user confirmation
- Prevents accidental data loss

### 9. Crosshair with Glow Effect

**Canvas Shadow API:**
```javascript
ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
```

**Auto-Hide Logic:**
- `mouseenter`: Show crosshair
- `mouseleave`: Hide crosshair
- Updates `RulerState.cursorVisible` flag

### 10. Color Cycling

**5-Color Palette:**
- Cyan, Magenta, Green, Yellow, Orange
- Cyclical assignment: `colorIndex = guides.length % 5`
- Visual differentiation for multiple guides

## File Structure

```
generate/js/ruler-guides.js
├── RulerState (Model)
├── Guide class
├── UnitConverter (Conversion layer)
├── SmartRulerEngine (Tick calculation)
├── Canvas initialization
├── Rendering functions
│   ├── renderRulerMarks()
│   ├── renderGuideLayer()
│   └── renderDistanceIndicators()
├── Event handlers
│   ├── setupMouseTracking()
│   ├── setupGuideDragging()
│   └── handleKeyboardShortcuts()
└── UI management
    ├── createEnhancedOverlay()
    ├── createGuideDeleteButton()
    └── updateCoordinateDisplay()
```

## Performance Metrics

**Target: 60 FPS during interaction**

- Mouse move: O(1) state update
- RAF render: O(N) guide drawing (batched)
- Distance calc: O(NlogN) deferred (debounced)
- Ruler marks: Cached (redrawn only on change)

## Testing Checklist

- [ ] Toggle ruler on/off
- [ ] Add guides (H/V keys, buttons)
- [ ] Drag guides smoothly
- [ ] Snap-to-grid works correctly
- [ ] Delete individual guides
- [ ] Clear all guides (confirmation)
- [ ] Unit switching (px, %, em)
- [ ] Crosshair appears/disappears
- [ ] Distance indicators update
- [ ] Ruler marks adapt to size
- [ ] Color cycling works
- [ ] Keyboard shortcuts don't interfere with input fields

## Migration Notes

**Breaking Changes:**
- Guide data structure changed (now uses `positionPx` instead of `position`)
- Rendering moved from DOM to Canvas
- Delete buttons now DOM overlays (not part of guide element)

**Backward Compatibility:**
- Export/import functions maintain API
- State getter/setter handle conversion

## Future Enhancements

1. **Zoom Support**: Adapt ruler marks to zoom level
2. **Guide Locking**: Prevent accidental movement
3. **Guide Groups**: Organize guides by layer/section
4. **Export Guides**: Save guide positions to preset
5. **Smart Guides**: Auto-align to canvas elements

