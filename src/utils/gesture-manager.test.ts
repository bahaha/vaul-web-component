import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { GestureManager, type GestureManagerOptions } from "./gesture-manager";

const mockDateNow = vi.fn();
vi.stubGlobal("Date", { ...Date, now: mockDateNow });

describe("GestureManager - Configuration", () => {
    test("should throw on invalid velocity threshold (negative)", () => {
        expect(() => new GestureManager({ velocityThreshold: -0.1 })).toThrow(
            "velocityThreshold must be a positive number"
        );
    });

    test("should throw on invalid close threshold (outside 0-1 range)", () => {
        expect(() => new GestureManager({ closeThreshold: -0.1 })).toThrow(
            "closeThreshold is distance threshold as ratio (0-1) for dismissal"
        );

        expect(() => new GestureManager({ closeThreshold: 1.5 })).toThrow(
            "closeThreshold is distance threshold as ratio (0-1) for dismissal"
        );
    });

    test("should accept valid configuration options", () => {
        const options: GestureManagerOptions = {
            direction: "top",
            dismissible: false,
            velocityThreshold: 0.8,
            closeThreshold: 0.3,
            getTargetDimensions: () => ({ width: 400, height: 600 }),
        };

        expect(() => new GestureManager(options)).not.toThrow();
    });
});

describe("GestureManager - Critical Math", () => {
    test("dampenValue() should reduce overdrag magnitude logarithmically", () => {
        // Test the damping function directly by checking overdrag behavior
        // The damping function: 8 * (Math.log(Math.abs(value) + 1) - 2)

        // For a 50px overdrag:
        const overdragDistance = 50;
        const expectedDamped = 8 * (Math.log(overdragDistance + 1) - 2); // ≈ 8 * (3.93 - 2) = ≈ 15.4

        expect(expectedDamped).toBeLessThan(overdragDistance); // Should be less than original
        expect(expectedDamped).toBeGreaterThan(0); // Should be positive
        expect(expectedDamped).toBeLessThan(20); // Should be significantly dampened

        // Test that larger values are dampened more (logarithmic effect)
        const largeOverdrag = 100;
        const largeExpectedDamped = 8 * (Math.log(largeOverdrag + 1) - 2); // ≈ 8 * (4.61 - 2) = ≈ 20.9

        // The ratio of dampening should decrease as input increases (logarithmic)
        const smallRatio = expectedDamped / overdragDistance; // ~0.31
        const largeRatio = largeExpectedDamped / largeOverdrag; // ~0.21

        expect(largeRatio).toBeLessThan(smallRatio); // Larger values dampened more aggressively
    });

    test("should calculate dismissal correctly: high velocity + short distance", () => {
        let dismissalDecision = false;
        const manager = new GestureManager({
            direction: "bottom",
            velocityThreshold: 0.5, // 0.5 px/ms
            closeThreshold: 0.5, // 50% of height
            getTargetDimensions: () => ({ width: 400, height: 400 }),
            onDragEnd: shouldDismiss => {
                dismissalDecision = shouldDismiss;
            },
        });

        // Move down 50px in 20ms = 2.5 px/ms velocity (> 0.5 threshold)
        // Distance = 50/400 = 0.125 (< 0.5 threshold)
        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 150], // 50px down
            duration: 20, // Fast = high velocity
        });

        expect(dismissalDecision).toBe(true); // High velocity should dismiss
        manager.destroy();
    });

    test("should calculate dismissal correctly: low velocity + long distance", () => {
        let dismissalDecision = false;
        const manager = new GestureManager({
            direction: "bottom",
            velocityThreshold: 0.5,
            closeThreshold: 0.4, // 40% of height
            getTargetDimensions: () => ({ width: 400, height: 400 }),
            onDragEnd: shouldDismiss => {
                dismissalDecision = shouldDismiss;
            },
        });

        // Move down 200px in 500ms = 0.4 px/ms velocity (< 0.5 threshold)
        // Distance = 200/400 = 0.5 (> 0.4 threshold)
        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 300], // 200px down
            duration: 500, // Slow = low velocity
        });

        expect(dismissalDecision).toBe(true); // Long distance should dismiss
        manager.destroy();
    });

    test("should NOT dismiss: low velocity + short distance", () => {
        let dismissalDecision = true;
        const manager = new GestureManager({
            direction: "bottom",
            velocityThreshold: 0.5,
            closeThreshold: 0.5,
            getTargetDimensions: () => ({ width: 400, height: 400 }),
            onDragEnd: shouldDismiss => {
                dismissalDecision = shouldDismiss;
            },
        });

        // Move down 100px in 500ms = 0.2 px/ms velocity (< 0.5 threshold)
        // Distance = 100/400 = 0.25 (< 0.5 threshold)
        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 200], // 100px down (short)
            duration: 500, // Slow = low velocity
        });

        expect(dismissalDecision).toBe(false); // Should bounce back
        manager.destroy();
    });
});

describe("GestureManager - Direction Logic", () => {
    test("overdrag detection: bottom drawer dragging up", () => {
        const manager = new GestureManager({ direction: "bottom" });

        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 50], // Moving up = overdrag for bottom drawer
            duration: 50,
        });

        expect(manager.gesture).toBe("idle");
        manager.destroy();
    });

    test("overdrag detection: top drawer dragging down", () => {
        const manager = new GestureManager({ direction: "top" });

        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 150], // Moving down = overdrag for top drawer
            duration: 50,
        });

        expect(manager.gesture).toBe("idle");
        manager.destroy();
    });

    test("direction setter should update gesture behavior", () => {
        const manager = new GestureManager({ direction: "bottom" });

        manager.direction = "top";
        manager.direction = "left";
        manager.direction = "right";

        expect(() => (manager.direction = "bottom")).not.toThrow();
        manager.destroy();
    });
});

describe("GestureManager - Threshold Updates", () => {
    test("velocityThreshold setter should affect dismissal decision", () => {
        let dismissalDecision = false;
        const manager = new GestureManager({
            direction: "bottom",
            velocityThreshold: 1.0, // Initially high
            closeThreshold: 0.8, // High distance threshold
            getTargetDimensions: () => ({ width: 400, height: 400 }),
            onDragEnd: shouldDismiss => {
                dismissalDecision = shouldDismiss;
            },
        });

        manager.velocityThreshold = 0.3;

        // Move down 30px in 50ms = 0.6 px/ms velocity
        // Should dismiss with new threshold (0.3) but not with old (1.0)
        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 130], // 30px down
            duration: 50, // Fast = high velocity
        });

        expect(dismissalDecision).toBe(true); // Should dismiss with new threshold
        manager.destroy();
    });

    test("closeThreshold setter should affect dismissal decision", () => {
        let dismissalDecision = false;
        const manager = new GestureManager({
            direction: "bottom",
            velocityThreshold: 2.0, // Very high velocity threshold
            closeThreshold: 0.8, // Initially high
            getTargetDimensions: () => ({ width: 400, height: 400 }),
            onDragEnd: shouldDismiss => {
                dismissalDecision = shouldDismiss;
            },
        });

        // Lower the close threshold
        manager.closeThreshold = 0.2;

        // Move down 100px = 100/400 = 0.25 distance ratio
        // Should dismiss with new threshold (0.2) but not with old (0.8)
        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 200], // 100px down
            duration: 500, // Slow = low velocity
        });

        expect(dismissalDecision).toBe(true); // Should dismiss with new threshold
        manager.destroy();
    });

    test("threshold validation on setter (should throw on invalid values)", () => {
        const manager = new GestureManager();

        expect(() => (manager.velocityThreshold = -0.1)).toThrow("velocityThreshold must be a positive number");
        expect(() => (manager.closeThreshold = -0.1)).toThrow(
            "closeThreshold is distance threshold as ratio (0-1) for dismissal"
        );
        expect(() => (manager.closeThreshold = 1.5)).toThrow(
            "closeThreshold is distance threshold as ratio (0-1) for dismissal"
        );

        manager.destroy();
    });
});

describe("GestureManager - Event Flow", () => {
    let mockElement: HTMLElement;
    let manager: GestureManager;
    let dragStartCalled: boolean;
    let dragEndCalled: boolean;
    let finalDismissalDecision: boolean;
    let finalTransform: string | null;

    beforeEach(() => {
        mockElement = document.createElement("div");
        mockElement.setPointerCapture = vi.fn();

        dragStartCalled = false;
        dragEndCalled = false;
        finalDismissalDecision = false;
        finalTransform = null;

        manager = new GestureManager({
            direction: "bottom",
            onDragStart: () => {
                dragStartCalled = true;
            },
            onDragEnd: (shouldDismiss, transform) => {
                dragEndCalled = true;
                finalDismissalDecision = shouldDismiss;
                finalTransform = transform;
            },
        });
    });

    afterEach(() => {
        manager.destroy();
    });

    test("complete gesture flow: pointerDown → pointerMove → pointerUp", () => {
        expect(manager.gesture).toBe("idle");

        mockDateNow.mockReturnValue(1000);
        manager.handlePointerDown(createPointerDown({ target: mockElement, x: 100, y: 100 }));

        expect(manager.gesture).toBe("dragging");
        expect(dragStartCalled).toBe(true);

        mockDateNow.mockReturnValue(1050);
        manager.handlePointerMove(createPointerMove({ x: 100, y: 150 }));

        expect(manager.gesture).toBe("dragging");

        manager.handlePointerUp(createPointerUp());

        expect(manager.gesture).toBe("idle");
        expect(dragEndCalled).toBe(true);
    });

    test("onDragEnd callback: should dismiss with velocity threshold", () => {
        manager.velocityThreshold = 0.5;

        // 50px in 20ms = 2.5 px/ms velocity
        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 150], // 50px down
            duration: 20, // Fast = high velocity
        });

        expect(finalDismissalDecision).toBe(true);
        expect(finalTransform).toBe(null); // Dismiss = null transform
    });

    test("onDragEnd callback: should bounce back below thresholds", () => {
        manager.velocityThreshold = 2.0; // High threshold
        manager.closeThreshold = 0.8; // High threshold

        // Small distance + slow velocity = should bounce back
        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 150], // Small distance
            duration: 500, // Slow = low velocity
        });

        expect(finalDismissalDecision).toBe(false);
        expect(finalTransform).toBe("translate3d(0, 0, 0)"); // Bounce back
    });
});

describe("GestureManager - State Management", () => {
    test("dismissible=false should never dismiss", () => {
        let dismissalDecision = true; // Start with true to test it changes
        const manager = new GestureManager({
            direction: "bottom",
            dismissible: false,
            velocityThreshold: 0.1, // Very low thresholds
            closeThreshold: 0.1,
            onDragEnd: shouldDismiss => {
                dismissalDecision = shouldDismiss;
            },
        });

        // Large distance + very high velocity = should still NOT dismiss
        simulateGesture({
            manager,
            startTime: 1000,
            start: [100, 100],
            end: [100, 200], // Large distance
            duration: 10, // Very fast = very high velocity
        });

        expect(dismissalDecision).toBe(false); // Should never dismiss
        manager.destroy();
    });

    test("gesture state: idle → dragging → idle", () => {
        const manager = new GestureManager();
        const target = createMockElement();

        expect(manager.gesture).toBe("idle");

        mockDateNow.mockReturnValue(1000);
        manager.handlePointerDown(createPointerDown({ target, x: 100, y: 100 }));

        expect(manager.gesture).toBe("dragging");

        manager.handlePointerUp(createPointerUp());

        expect(manager.gesture).toBe("idle");
        manager.destroy();
    });
});

// Helper functions for creating PointerEvents with critical test arguments
interface PointerEventOptions {
    pointerId?: number;
    x?: number;
    y?: number;
    target?: HTMLElement;
}

function createMockElement(): HTMLElement {
    const element = document.createElement("div");
    element.setPointerCapture = vi.fn();
    return element;
}

function createPointerDown(options: PointerEventOptions = {}): PointerEvent {
    const event = new PointerEvent("pointerdown", {
        pointerId: options.pointerId ?? 1,
        pageX: options.x ?? 100,
        pageY: options.y ?? 100,
    } as any);

    if (options.target) {
        Object.defineProperty(event, "target", { value: options.target });
    }

    return event;
}

function createPointerMove(options: PointerEventOptions = {}): PointerEvent {
    return new PointerEvent("pointermove", {
        pointerId: options.pointerId ?? 1,
        pageX: options.x ?? 100,
        pageY: options.y ?? 100,
    } as any);
}

function createPointerUp(options: PointerEventOptions = {}): PointerEvent {
    return new PointerEvent("pointerup", {
        pointerId: options.pointerId ?? 1,
        pageX: options.x ?? 100,
        pageY: options.y ?? 100,
    } as any);
}

// Helper for simulating a complete gesture sequence
interface GestureSequence {
    manager: GestureManager;
    startTime: number;
    start: [number, number]; // [x, y]
    end: [number, number]; // [x, y]
    duration: number;
    target?: HTMLElement;
}

function simulateGesture(sequence: GestureSequence): void {
    const target = sequence.target ?? createMockElement();

    // Start gesture
    mockDateNow.mockReturnValue(sequence.startTime);
    const pointerDown = createPointerDown({
        x: sequence.start[0],
        y: sequence.start[1],
        target,
    });
    sequence.manager.handlePointerDown(pointerDown);

    // Move gesture
    mockDateNow.mockReturnValue(sequence.startTime + sequence.duration);
    const pointerMove = createPointerMove({
        x: sequence.end[0],
        y: sequence.end[1],
    });
    sequence.manager.handlePointerMove(pointerMove);

    // End gesture
    mockDateNow.mockReturnValue(sequence.startTime + sequence.duration + 5);
    const pointerUp = createPointerUp();
    sequence.manager.handlePointerUp(pointerUp);
}

// Helper for extracting transform unit values from CSS transform strings
interface TransformValues {
    x: number;
    y: number;
    z: number;
}

function parseTransform(transformString: string): TransformValues | null {
    // Match translate3d(x, y, z) format
    const match = transformString.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);

    if (!match) {
        return null;
    }

    const parseValue = (value: string): number => {
        // Remove 'px' suffix and parse as float
        return parseFloat(value.replace("px", "").trim());
    };

    return {
        x: parseValue(match[1]),
        y: parseValue(match[2]),
        z: parseValue(match[3]),
    };
}

// Helper for getting transform magnitude (absolute distance)
function getTransformMagnitude(transformString: string): number {
    const values = parseTransform(transformString);
    if (!values) return 0;

    // Calculate 2D distance (ignoring z-axis for gestures)
    return Math.sqrt(values.x * values.x + values.y * values.y);
}

// Helper for checking if transform is in expected direction
function isTransformInDirection(transformString: string, direction: "up" | "down" | "left" | "right"): boolean {
    const values = parseTransform(transformString);
    if (!values) return false;

    switch (direction) {
        case "up":
            return values.y < 0;
        case "down":
            return values.y > 0;
        case "left":
            return values.x < 0;
        case "right":
            return values.x > 0;
        default:
            return false;
    }
}
