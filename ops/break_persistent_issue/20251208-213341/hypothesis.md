# Root Cause Hypothesis: Services Dropdown Behind Hero Sections

## Symptom Summary
The Services dropdown menu consistently appears behind hero sections despite multiple z-index fixes (1001, 10001, !important flags, isolation: isolate).

## Root Cause Hypothesis
The dropdown menu has `transform: translateY(-10px)` in its base (hidden) state, which creates a new stacking context. Combined with `isolation: isolate`, this isolates the dropdown's stacking context from the navbar's stacking context. Even though the dropdown has `z-index: 10001 !important`, its transform-created stacking context is positioned relative to `.nav-item-dropdown` (position: relative), not relative to the navbar's fixed positioning context. The hero section creates its own stacking context with `position: relative` and `z-index: 1`. The browser renders the hero's stacking context visually on top of the dropdown's isolated stacking context.

## Evidence
1. Dropdown has `transform: translateY(-10px)` in base state (line 218 of navigation.css)
2. Dropdown has `isolation: isolate` which creates an isolated stacking context
3. Hero section has `position: relative` and `z-index: 1`, creating its own stacking context
4. Hero section comes after navbar in DOM order
5. Previous z-index fixes (1001, 10001, !important) did not resolve the issue
6. CSS transform property creates stacking contexts per CSS spec

## Risk Analysis
- **Why previous fixes failed:** They increased z-index values but didn't address the stacking context isolation created by `transform` and `isolation: isolate`
- **Risk of fix:** Low - removing transform from hidden state and isolation will not break functionality, animation will still work via hover state

## Single Proposed Fix
Remove `transform: translateY(-10px)` from the `.dropdown-menu` base state and remove `isolation: isolate`. Keep `transform: translateY(0)` in the `:hover` state for the slide-down animation. This eliminates the stacking context created in the hidden state while preserving the animation effect.

## Rollback Plan
Restore files from `./ops/break_persistent_issue/20251208-213341/backups/` if fix fails.

