# Vaul Web Component Milestones

## ✅ Milestone 1: Basic Drawer Structure

**Status**: Completed  
**PR**: #1

-   [x] VaulDrawer container component
-   [x] VaulDrawerTrigger with click handling
-   [x] VaulDrawerContent with native dialog
-   [x] Shadow DOM with slot-based content projection
-   [x] Basic component hierarchy and communication

## ✅ Milestone 2: Direction Support

**Status**: Completed  
**Issue**: #2  
**PR**: #3

-   [x] Direction attribute support (top, bottom, left, right)
-   [x] Reactive direction changes using @preact/signals
-   [x] CSS positioning for all four directions
-   [x] Enhanced demo page with direction controls
-   [x] Comprehensive test coverage

## 🚧 Milestone 3: Slide-in Animations

**Status**: Planned  
**Issue**: #4

### Success Criteria

-   [ ] Drawers animate smoothly when opening from their respective directions
-   [ ] Drawers animate smoothly when closing to their respective directions
-   [ ] Animation timing is consistent across all directions (500ms duration)
-   [ ] Animation easing feels natural and polished (`cubic-bezier(0.32, 0.72, 0, 1)`)
-   [ ] Animations are performant (use CSS transforms/transitions)
-   [ ] Opening/closing state is properly managed during animations
-   [ ] Animations can be disabled via configuration option
-   [ ] Demo page showcases all directional animations

### Implementation Strategy (Based on Vaul Analysis)

**Animation Architecture:**

-   Pure CSS animations with `@keyframes`, controlled by `data-state` attributes
-   Hardware-accelerated `translate3d()` transforms
-   Duration: `500ms`, Easing: `cubic-bezier(0.32, 0.72, 0, 1)`

**Animation Patterns:**

```css
/* Enter animations: off-screen → center */
Bottom: translate3d(0, 100%, 0) → translate3d(0, 0, 0)
Top: translate3d(0, -100%, 0) → translate3d(0, 0, 0)
Left: translate3d(-100%, 0, 0) → translate3d(0, 0, 0)
Right: translate3d(100%, 0, 0) → translate3d(0, 0, 0)

/* Exit animations: center → off-screen */
Bottom: → translate3d(0, 100%, 0)
Top: → translate3d(0, -100%, 0)
Left: → translate3d(-100%, 0, 0)
Right: → translate3d(100%, 0, 0)
```

**Technical Details:**

-   `will-change: transform` + `touch-action: none` for performance
-   `prefers-reduced-motion` accessibility support
-   CSS custom properties for configurable timing/easing
-   Coordinated overlay fade animations

## 📋 Milestone 4: Backdrop Click to Close

**Status**: Planned  
**Issue**: #6

### Success Criteria

-   [ ] Clicking on the backdrop (overlay area) closes the drawer
-   [ ] Clicking on drawer content does NOT close the drawer
-   [ ] Interactive elements within drawer content work properly:
    -   [ ] Buttons can be clicked
    -   [ ] Form inputs (text, date, select, etc.) remain functional
    -   [ ] Links and other clickable elements work as expected
-   [ ] Backdrop click behavior is consistent across all directions
-   [ ] Option to disable backdrop click to close (configurable)
-   [ ] Demo page demonstrates backdrop interaction with various content types
