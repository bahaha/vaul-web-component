# React Vaul Snap Points Bounce Back Strategy Analysis

## Overview

Analysis of how React vaul handles drawer bounce back to snap points when user drags and releases. This covers the complete decision-making process from drag release to final snap position.

## Core Architecture

### File Structure

- `use-snap-points.ts` - Main snap point logic and bounce back strategy
- `index.tsx` - Drag handling and event coordination
- `constants.ts` - Animation timing and thresholds
- `helpers.ts` - Utility functions for transforms and calculations

## Bounce Back Decision Algorithm

### 1. Velocity-Based Override System (Priority 1)

**Location**: `use-snap-points.ts:186-195`

```typescript
// High velocity downward - close or snap to first
if (!snapToSequentialPoint && velocity > 2 && !hasDraggedUp) {
    if (dismissible) closeDrawer();
    else snapToPoint(snapPointsOffset[0]); // snap to initial point
    return;
}

// High velocity upward - snap to last point
if (!snapToSequentialPoint && velocity > 2 && hasDraggedUp && snapPointsOffset && snapPoints) {
    snapToPoint(snapPointsOffset[snapPoints.length - 1] as number);
    return;
}
```

**Strategy**:

- Velocity > 2 units/ms = immediate directional snap
- Ignores current position, prioritizes user intent
- Respects `snapToSequentialPoint` flag for controlled behavior

### 2. Medium Velocity + Small Drag (Priority 2)

**Location**: `use-snap-points.ts:205-222`

```typescript
if (velocity > VELOCITY_THRESHOLD && Math.abs(draggedDistance) < dim * 0.4) {
    const dragDirection = hasDraggedUp ? 1 : -1; // 1 = up, -1 = down

    // Boundary protection
    if (dragDirection > 0 && isLastSnapPoint && snapPoints) {
        snapToPoint(snapPointsOffset[snapPoints.length - 1]);
        return;
    }

    // First snap point protection
    if (isFirst && dragDirection < 0 && dismissible) {
        closeDrawer();
    }

    // Move to adjacent snap point
    snapToPoint(snapPointsOffset[activeSnapPointIndex + dragDirection]);
    return;
}
```

**Strategy**:

- Velocity > 0.4 AND drag distance < 40% of screen = snap to adjacent point
- Provides "flick to next" behavior
- Includes boundary checks to prevent invalid snaps

### 3. Proximity-Based Fallback (Priority 3)

**Location**: `use-snap-points.ts:198-202, 224`

```typescript
// Find the closest snap point to the current position
const closestSnapPoint = snapPointsOffset?.reduce((prev, curr) => {
    if (typeof prev !== "number" || typeof curr !== "number") return prev;
    return Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev;
});

// Fallback: snap to closest point
snapToPoint(closestSnapPoint);
```

**Strategy**:

- Used when velocity is low or drag distance is large
- Calculates current drawer position after drag
- Snaps to geometrically closest snap point

## Position Calculation System

### Current Position Determination

```typescript
const currentPosition =
    direction === "bottom" || direction === "right"
        ? (activeSnapPointOffset ?? 0) - draggedDistance
        : (activeSnapPointOffset ?? 0) + draggedDistance;
```

**Key Points**:

- Accounts for drawer direction (bottom/right vs top/left)
- Uses active snap point as reference, not absolute position
- Considers cumulative drag distance from start position

### Snap Point Offset Calculation

**Location**: `use-snap-points.ts:75-109`

```typescript
const snapPointsOffset = React.useMemo(() => {
    const containerSize = container
        ? { width: container.getBoundingClientRect().width, height: container.getBoundingClientRect().height }
        : typeof window !== "undefined"
          ? { width: window.innerWidth, height: window.innerHeight }
          : { width: 0, height: 0 };

    return (
        snapPoints?.map(snapPoint => {
            const isPx = typeof snapPoint === "string";
            let snapPointAsNumber = 0;

            if (isPx) {
                snapPointAsNumber = parseInt(snapPoint, 10);
            }

            if (isVertical(direction)) {
                const height = isPx ? snapPointAsNumber : windowDimensions ? snapPoint * containerSize.height : 0;

                if (windowDimensions) {
                    return direction === "bottom" ? containerSize.height - height : -containerSize.height + height;
                }

                return height;
            }
            // Similar logic for horizontal...
        }) ?? []
    );
}, [snapPoints, windowDimensions, container]);
```

**Features**:

- Supports both percentage (0.5) and pixel ("300px") snap points
- Responsive to container/window size changes
- Direction-aware calculations

## Animation System

### Transition Configuration

**Location**: `constants.ts`

```typescript
export const TRANSITIONS = {
    DURATION: 0.5, // 500ms
    EASE: [0.32, 0.72, 0, 1], // Custom cubic-bezier
};
```

### Snap Animation Implementation

**Location**: `use-snap-points.ts:121-124`

```typescript
set(drawerRef.current, {
    transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
    transform: isVertical(direction) ? `translate3d(0, ${dimension}px, 0)` : `translate3d(${dimension}px, 0, 0)`,
});
```

**Characteristics**:

- Uses CSS transitions for smooth animation
- Custom easing curve for natural feel
- Hardware-accelerated transforms (translate3d)
- Coordinated overlay opacity changes

## Velocity Calculation

### Velocity Computation

**Location**: `index.tsx:613-615`

```typescript
const timeTaken = dragEndTime.current.getTime() - dragStartTime.current.getTime();
const distMoved = pointerStart.current - (isVertical(direction) ? event.pageY : event.pageX);
const velocity = Math.abs(distMoved) / timeTaken;
```

**Method**:

- Distance moved (pixels) / time taken (milliseconds)
- Direction-aware calculation
- Absolute value for threshold comparisons

### Velocity Thresholds

```typescript
export const VELOCITY_THRESHOLD = 0.4; // For medium velocity behavior
// velocity > 2 for high velocity override
```

## Boundary Handling

### Edge Case Protection

1. **Last Snap Point**: Prevents snapping beyond highest snap point
2. **First Snap Point**: Handles dismissible behavior when at bottom
3. **Invalid Indices**: Guards against array bounds errors
4. **No Snap Points**: Graceful degradation to regular drawer behavior

### Dismissible Behavior

```typescript
if (isFirst && dragDirection < 0 && dismissible) {
    closeDrawer();
}
```

## Integration with Main Drawer

### Drag Event Flow

1. `onPress` - Initialize drag state
2. `onDrag` - Update position during drag, call `onDragSnapPoints`
3. `onRelease` - Calculate velocity, call `onReleaseSnapPoints`

### State Coordination

- `activeSnapPoint` - Current snap point (string/number)
- `activeSnapPointIndex` - Array index of current snap point
- `snapPointsOffset` - Calculated pixel positions
- `shouldFade` - Overlay opacity behavior

## Key Insights for Web Component Implementation

### 1. Decision Tree Priority

- High velocity (>2) → Directional override
- Medium velocity (>0.4) + small drag → Adjacent snap
- Default → Closest snap point

### 2. Essential Calculations

- Current position = activeSnapPointOffset ± draggedDistance
- Velocity = distance / time
- Snap point offsets = percentage × container size

### 3. Animation Coordination

- 500ms cubic-bezier transitions
- Simultaneous transform + opacity changes
- Hardware acceleration with translate3d

### 4. Boundary Safety

- Always validate snap point indices
- Handle edge cases (first/last points)
- Respect dismissible flag

### 5. Performance Considerations

- Use useMemo for expensive calculations
- Cache DOM measurements
- Minimize reflows during animation

## Configuration Options

### `snapToSequentialPoint`

- `false` (default): Allows velocity-based snap point skipping
- `true`: Always moves to adjacent snap points only

### `fadeFromIndex`

- Controls which snap point triggers overlay fade
- Affects visual feedback during transitions

### `dismissible`

- Controls whether drawer can be closed by dragging
- Affects first snap point behavior

This analysis provides a complete blueprint for implementing equivalent snap point bounce back behavior in the web component version.
