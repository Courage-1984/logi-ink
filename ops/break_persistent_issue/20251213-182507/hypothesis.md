# Hypothesis Document

## Symptom Summary
- Navbar CLS worsened to 0.0368 (target: <0.01)
- All navbar items flash active/hover state during navigation and on initial load

## Root Cause Hypothesis
The iew-transition-name: navbar CSS property is causing layout recalculations and CLS. Additionally, the complex CSS rules for disabling hover/active states during view transitions are conflicting with the active state initialization, causing all links to flash as active.

## Evidence
1. CLS increased from baseline after adding view-transition-name
2. CSS rules use :active-view-transition-type() which may not match correctly
3. Inline script runs but CSS paints before it can prevent flash
4. Multiple conflicting CSS rules with !important flags

## Proposed Fix
Remove view-transition-name from navbar (it's causing CLS without significant benefit). Simplify CSS rules - remove complex :active-view-transition-type() rules that aren't working. Instead, rely on the inline script properly removing active classes and add a simpler CSS rule that just hides active state until data-active-initialized is set.

## Risk Analysis
Previous fixes failed because:
- Too many conflicting CSS rules with !important
- view-transition-name causing layout shifts
- CSS pseudo-classes not matching during view transitions
- Inline script timing vs CSS paint race condition

## Single Proposed Fix
1. Remove iew-transition-name: navbar from .navbar class
2. Remove complex :active-view-transition-type() CSS rules
3. Keep simple .nav-link.active:not([data-active-initialized]) rule
4. Ensure inline script runs synchronously and marks links properly
