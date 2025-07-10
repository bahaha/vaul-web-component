# Milestone 2: Directional Drawer

## Goal

Add directional positioning to drawers with auto-sizing and no animations.

## Features

### Direction Support

- Add `direction` attribute to `<vaul-drawer>` element
- Supported values: `top`, `bottom`, `left`, `right`
- Default behavior: existing functionality (if no direction specified)

### Auto-sizing

- Drawer automatically sizes to fit content using CSS `fit-content`
- Height adjusts for top/bottom directions
- Width adjusts for left/right directions

### Positioning

- Drawer appears from the specified edge of the viewport
- Static positioning (no animations or transitions)
- Proper viewport alignment for each direction

## Usage Examples

### Top Drawer

```html
<vaul-drawer direction="top">
    <vaul-drawer-trigger>Open from Top</vaul-drawer-trigger>
    <vaul-drawer-content> Content appears from top of screen </vaul-drawer-content>
</vaul-drawer>
```

### Bottom Drawer

```html
<vaul-drawer direction="bottom">
    <vaul-drawer-trigger>Open from Bottom</vaul-drawer-trigger>
    <vaul-drawer-content> Content appears from bottom of screen </vaul-drawer-content>
</vaul-drawer>
```

### Left Drawer

```html
<vaul-drawer direction="left">
    <vaul-drawer-trigger>Open from Left</vaul-drawer-trigger>
    <vaul-drawer-content> Content appears from left side </vaul-drawer-content>
</vaul-drawer>
```

### Right Drawer

```html
<vaul-drawer direction="right">
    <vaul-drawer-trigger>Open from Right</vaul-drawer-trigger>
    <vaul-drawer-content> Content appears from right side </vaul-drawer-content>
</vaul-drawer>
```

## Success Criteria

### Functionality

- ✅ Drawer opens from specified direction
- ✅ Content automatically sizes to fit using CSS `fit-content`
- ✅ All existing functionality from Milestone 1 continues to work
- ✅ Backward compatibility maintained (existing drawers work without direction)

### Testing

- ✅ All existing tests continue to pass
- ✅ New tests added for each direction
- ✅ Cross-browser compatibility verified
- ✅ Auto-sizing behavior validated

### Technical Requirements

- No animations or transitions (saved for future milestone)
- Clean CSS implementation for positioning
- Maintain existing architecture and patterns
- Proper handling of edge cases and invalid direction values

## Notes

- This milestone focuses on positioning and sizing
- Animation and transition effects will be addressed in a future milestone
- Keep implementation simple and maintainable
