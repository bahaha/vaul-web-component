# Vaul Web Component Milestones

## ✅ Milestone 1: Basic Drawer Structure

**Status**: Completed  
**PR**: #1

- [x] VaulDrawer container component
- [x] VaulDrawerTrigger with click handling
- [x] VaulDrawerContent with native dialog
- [x] Shadow DOM with slot-based content projection
- [x] Basic component hierarchy and communication

## ✅ Milestone 2: Direction Support

**Status**: Completed  
**Issue**: #2  
**PR**: #3

- [x] Direction attribute support (top, bottom, left, right)
- [x] Reactive direction changes using @preact/signals
- [x] CSS positioning for all four directions
- [x] Enhanced demo page with direction controls
- [x] Comprehensive test coverage

## ✅ Milestone 3: Slide-in Animations

**Status**: Completed  
**Issue**: #4  
**PR**: #5

### Success Criteria

- [ ] Drawers animate smoothly when opening from their respective directions
- [ ] Drawers animate smoothly when closing to their respective directions
- [ ] Animation timing is consistent across all directions (500ms duration)
- [ ] Animation easing feels natural and polished (`cubic-bezier(0.32, 0.72, 0, 1)`)
- [ ] Animations are performant (use CSS transforms/transitions)
- [ ] Opening/closing state is properly managed during animations
- [ ] Animations can be disabled via configuration option
- [ ] Demo page showcases all directional animations

### Implementation Strategy (Based on Vaul Analysis)

**Animation Architecture:**

- Pure CSS animations with `@keyframes`, controlled by `data-state` attributes
- Hardware-accelerated `translate3d()` transforms
- Duration: `500ms`, Easing: `cubic-bezier(0.32, 0.72, 0, 1)`

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

- `will-change: transform` + `touch-action: none` for performance
- `prefers-reduced-motion` accessibility support
- CSS custom properties for configurable timing/easing
- Coordinated overlay fade animations

## ✅ Milestone 4: Backdrop Click to Close

**Status**: Completed  
**Issue**: #6

### Success Criteria

- [x] Clicking on the backdrop (overlay area) closes the drawer
- [x] Clicking on drawer content does NOT close the drawer
- [x] Interactive elements within drawer content work properly:
    - [x] Buttons can be clicked
    - [x] Form inputs (text, date, select, etc.) remain functional
    - [x] Links and other clickable elements work as expected
- [x] Backdrop click behavior is consistent across all directions
- [x] Option to disable backdrop click to close (configurable via `dismissible` attribute)
- [x] Demo page demonstrates backdrop interaction with various content types

### Implementation Details

- **Core Logic**: `#handleDialogClick` method checks `event.target === this.dialog` to detect backdrop clicks
- **Configuration**: `dismissible` attribute (default: `true`) controls backdrop click behavior
- **Signal Integration**: Uses @preact/signals for reactive dismissible state management
- **Event Delegation**: Proper event handling ensures content interactions work normally

## Milestone 5: Drawer Handle Component

**Status**: Planning  
**Issue**: #8

### Overview

Add a `VaulDrawerHandle` web component that provides a visual drag indicator and safe touch target for drawer interaction. Additionally, implement built-in handle functionality for vertical drawers (top/bottom) with an option to disable it. This milestone focuses on the visual handle and accessibility foundation without implementing drag functionality or snap points.

### Success Criteria

#### Visual Design

- [ ] Handle displays as a small horizontal bar (32px wide, 5px tall by default)
- [ ] Handle has rounded corners (1rem border-radius) and subtle opacity (0.7)
- [ ] Handle is centered horizontally within its container
- [ ] Handle uses appropriate background color (#e2e2e4 or CSS custom property)
- [ ] Handle opacity increases to 1.0 on hover/focus for better accessibility

#### Touch Target & Accessibility

- [ ] Handle includes larger invisible hit area (minimum 44x44px for accessibility)
- [ ] Hit area is properly centered around the visual handle
- [ ] Handle includes `aria-hidden="true"` since it's decorative/functional
- [ ] Proper `touch-action` configuration for future drag support
- [ ] Handle works with keyboard navigation through parent drawer

#### Safe Area Integration

- [ ] Handle positioning respects safe areas (iOS notch, Android navigation)
- [ ] Handle works properly in landscape orientations
- [ ] Handle maintains proper positioning across all drawer directions
- [ ] Handle adapts to different drawer sizes and content heights

#### Component Integration

- [ ] VaulDrawerHandle web component extends HTMLElement
- [ ] Handle integrates with existing drawer context/communication system
- [ ] Handle knows about drawer state (open/closed, direction)
- [ ] Handle can be positioned within VaulDrawerContent via slots
- [ ] Multiple handles per drawer are supported (if needed)

#### Built-in Handle for Vertical Drawers

- [ ] VaulDrawerContent automatically includes handle for vertical drawers (top/bottom)
- [ ] Built-in handle is positioned appropriately (top of bottom drawer, bottom of top drawer)
- [ ] `show-handle` attribute controls built-in handle visibility (default: `true` for vertical)
- [ ] `show-handle="false"` disables built-in handle completely
- [ ] Built-in handle uses same styling and accessibility features as standalone component
- [ ] Horizontal drawers (left/right) do not show built-in handle by default
- [ ] Built-in handle can be overridden by manually adding VaulDrawerHandle component

#### Basic Interaction (Visual Feedback Only)

- [ ] Handle provides visual feedback on hover/focus (opacity changes)
- [ ] Handle is a passive visual element (no drawer state changes)
- [ ] Handle prepares event system foundation for future drag implementation
- [ ] Handle does NOT implement snap points or cycling functionality

#### Styling & Theming

- [ ] Handle uses CSS custom properties for easy theming
- [ ] Handle styling is encapsulated within Shadow DOM
- [ ] Handle responds to `prefers-reduced-motion` for accessibility
- [ ] Handle styling works across all drawer directions

#### Testing

- [ ] Unit tests for component lifecycle and visual behavior
- [ ] E2E tests for visual appearance and touch target sizing
- [ ] Tests for safe area positioning and responsive behavior
- [ ] Tests for accessibility compliance (screen readers, keyboard)

#### Demo Integration

- [ ] Enhanced demo page shows handle in various configurations
- [ ] Demo includes handle with different drawer directions
- [ ] Demo showcases built-in handle behavior (enabled/disabled)
- [ ] Demo shows manual VaulDrawerHandle component usage
- [ ] Demo showcases handle accessibility features
- [ ] Demo shows handle with safe area simulation

### Implementation Notes

This milestone establishes the handle component as a **visual indicator only** - no interactive functionality, snap points, or drag gestures. The focus is on creating a solid foundation for future drag implementation while ensuring proper accessibility and safe area support.

**Built-in Handle Behavior:**

- Vertical drawers (top/bottom) automatically show handle by default
- Horizontal drawers (left/right) do not show built-in handle
- `show-handle="false"` attribute disables built-in handle
- Manual VaulDrawerHandle components always override built-in behavior
- Handle positioning adapts to drawer direction (top of bottom drawer, bottom of top drawer)
