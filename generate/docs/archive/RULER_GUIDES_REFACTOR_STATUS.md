# Ruler/Guides System Refactor Status

## Overview

This document tracks the progress of refactoring the ruler/guides system to match the architectural specification.

## Completed ✅

### 1. State Management Architecture
- ✅ Created `RulerState` singleton object
- ✅ Implemented `Guide` class with `positionPx` as source of truth
- ✅ Added color palette (5 colors, cyclical)
- ✅ Added rendering state flags (`needsRerender`, `rafId`)

### 2. Unit Conversion Layer
- ✅ Implemented `UnitConverter` module
- ✅ Functions: `pxToPercent()`, `pxToEm()`, `formatForDisplay()`
- ✅ Smart pixel formatting (1.5k for 1500px)

### 3. Smart Ruler Engine
- ✅ Implemented Heckbert's "nice numbers" algorithm
- ✅ `calculateNiceInterval()` function
- ✅ `generateTicks()` with adaptive spacing

### 4. Canvas Infrastructure
- ✅ `initializeCanvasLayers()` function
- ✅ Separate canvas layers: `rulerCanvas` (cached) and `guideCanvas` (dynamic)
- ✅ Canvas context initialization

### 5. Core Functions Updated
- ✅ `toggleRuler()` now uses `RulerState.isActive`
- ✅ `clearAllGuides()` now requires confirmation dialog
- ✅ Keyboard shortcuts updated to check input fields

## Completed ✅ (Updated)

### Canvas Rendering Functions
- ✅ `renderRulerMarks()` - Implemented with SmartRulerEngine
- ✅ `renderGuideLayer()` - Implemented with batched color drawing
- ✅ `renderDistanceIndicators()` - Implemented with debouncing
- ✅ `renderLoop()` - RAF loop implemented

### Guide Management
- ✅ `addGuide()` - Updated to use `Guide` class and `positionPx`
- ✅ `removeGuide()` - Updated to use `RulerState.guides`
- ✅ `updateAllGuides()` - Uses Canvas rendering + DOM delete buttons
- ✅ `createGuideDeleteButton()` - Hybrid DOM/Canvas architecture implemented

### Mouse Tracking
- ✅ `setupMouseTracking()` - Optimized (state updates only, rendering in RAF)
- ✅ `updateCoordinateDisplay()` - Uses `UnitConverter`

### Guide Dragging
- ✅ `setupGuideDragging()` - Canvas hit testing implemented
- ✅ Snap-to-grid uses `RulerState.snapEnabled` and `positionPx`

### Ruler Marks
- ✅ `updateRulerMarks()` - Uses Canvas rendering and `SmartRulerEngine`
- ✅ Ruler marks use `UnitConverter.formatForDisplay()`

## Not Started ❌

### Performance Optimizations
- ❌ RAF render loop implementation
- ❌ Debounced distance calculation (50ms timeout)
- ❌ Guide drawing batching by color
- ❌ Ruler mark caching (only redraw on change)

### UI Updates
- ❌ Unit switcher integration with `RulerState.currentUnit`
- ❌ Snap toggle integration with `RulerState.snapEnabled`
- ❌ Coordinate display using `UnitConverter`

### Testing
- ❌ Test Canvas rendering
- ❌ Test guide dragging with Canvas
- ❌ Test snap-to-grid
- ❌ Test unit conversion
- ❌ Test keyboard shortcuts
- ❌ Performance testing (60 FPS target)

## Migration Strategy

### Phase 1: Foundation (Current)
- ✅ State management architecture
- ✅ Unit conversion layer
- ✅ Smart ruler engine
- ✅ Canvas infrastructure

### Phase 2: Rendering (Next)
- Implement Canvas rendering functions
- Replace DOM guide elements with Canvas drawing
- Implement RAF loop

### Phase 3: Interaction (After Phase 2)
- Update guide dragging for Canvas
- Implement Canvas hit testing
- Update mouse tracking

### Phase 4: Polish (Final)
- Performance optimization
- Debouncing
- Testing and bug fixes

## Breaking Changes

### Data Structure
- **Old**: `guides` array with `{ type: 'horizontal'|'vertical', position: number }`
- **New**: `RulerState.guides` array with `Guide` objects using `positionPx`

### Rendering
- **Old**: DOM elements (`.guide-line` divs)
- **New**: Canvas rendering (guides drawn on `guideCanvas`)

### State Access
- **Old**: Direct variable access (`isRulerActive`, `unitType`, etc.)
- **New**: `RulerState` object (`RulerState.isActive`, `RulerState.currentUnit`, etc.)

## Backward Compatibility

Legacy variables are kept temporarily for migration:
- `isRulerActive` → `RulerState.isActive`
- `guides` → `RulerState.guides`
- `unitType` → `RulerState.currentUnit`
- `snapToGrid` → `RulerState.snapEnabled`

These will be removed once all functions are migrated.

## Next Steps

1. **Implement Canvas Rendering**
   - `renderRulerMarks()` using `SmartRulerEngine`
   - `renderGuideLayer()` in RAF loop
   - `renderDistanceIndicators()` with debouncing

2. **Update Guide Management**
   - Convert `addGuide()` to use `Guide` class
   - Update `removeGuide()` to use `RulerState.guides`
   - Implement Canvas-based guide drawing

3. **Optimize Mouse Tracking**
   - Separate state updates from rendering
   - Move rendering to RAF loop

4. **Test and Refine**
   - Verify 60 FPS performance
   - Test all interactions
   - Fix any bugs

## Notes

- The current implementation is a hybrid: new architecture is in place, but old DOM-based rendering still exists
- Canvas layers are initialized but not yet used for rendering
- Guide delete buttons will use hybrid DOM/Canvas approach (guides on Canvas, buttons as DOM overlays)

