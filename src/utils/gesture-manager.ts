import { signal, computed, effect } from "@preact/signals";
import { logger } from "../logger";
import { type Direction } from "../types";

// React vaul constants
const VELOCITY_THRESHOLD = 0.4; // px/ms
const CLOSE_THRESHOLD = 0.25; // 25%

export type GestureState = "idle" | "dragging" | "released";

export interface DragPosition {
    x: number;
    y: number;
}

export interface GestureManagerOptions {
    /** Direction of the drawer for gesture validation */
    direction?: Direction;
    /** Callback when dragging starts */
    onDragStart?: () => void;
    /** Callback during dragging with transform string */
    onDrag?: (transform: string) => void;
    /** Callback when dragging ends with dismissal decision */
    onDragEnd?: (shouldDismiss: boolean) => void;
}

export class GestureManager {
    #direction = signal<Direction>("bottom");
    #isDestroyed = false;
    #gesture = signal<GestureState>("idle");
    #pointerStart = signal<{ x: number; y: number } | null>(null);
    #currentPointer = signal<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
    #lastPointer = signal<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
    #effectCleanups: (() => void)[] = [];
    #callbacks: Required<GestureManagerOptions>;

    #isVertical = computed(() => {
        const direction = this.#direction.value;
        return direction === "bottom" || direction === "top";
    });

    #position = computed(() => {
        const pointerStart = this.#pointerStart.value;
        if (!pointerStart) return { x: 0, y: 0 };

        const current = this.#currentPointer.value;
        return {
            x: current.x - pointerStart.x,
            y: current.y - pointerStart.y,
        };
    });

    #timeDelta = computed(() => {
        const current = this.#currentPointer.value;
        const last = this.#lastPointer.value;
        return current.time - last.time;
    });

    #distanceFromLast = computed(() => {
        const current = this.#currentPointer.value;
        const last = this.#lastPointer.value;
        return Math.sqrt(Math.pow(current.x - last.x, 2) + Math.pow(current.y - last.y, 2));
    });

    #velocity = computed(() => {
        const timeDelta = this.#timeDelta.value;
        if (timeDelta <= 0) return 0;
        return this.#distanceFromLast.value / timeDelta;
    });

    #distance = computed(() => {
        const position = this.#position.value;
        const draggedDistance = this.#isVertical.value ? Math.abs(position.y) : Math.abs(position.x);
        return draggedDistance / 100;
    });

    #shouldDismiss = computed(() => {
        return this.#velocity.value >= VELOCITY_THRESHOLD || this.#distance.value >= CLOSE_THRESHOLD;
    });

    #transform = computed(() => {
        const position = this.#position.value;
        const isVertical = this.#isVertical.value;
        return isVertical ? `translate3d(0, ${position.y}px, 0)` : `translate3d(${position.x}px, 0, 0)`;
    });

    constructor(options: GestureManagerOptions = {}) {
        if (options.direction) {
            this.#direction.value = options.direction;
        }

        // Set up callbacks with defaults
        this.#callbacks = {
            direction: options.direction || "bottom",
            onDragStart: options.onDragStart || (() => {}),
            onDrag: options.onDrag || (() => {}),
            onDragEnd: options.onDragEnd || (() => {}),
        };

        this.#setupEffects();
        logger.debug("GestureManager: Initialized", { direction: this.#direction.value });
    }

    #setupEffects() {
        // Gesture lifecycle effect
        this.#effectCleanups.push(
            effect(() => {
                const gesture = this.#gesture.value;

                if (gesture === "dragging") {
                    // Call onDragStart only once when transitioning to dragging
                    // This is handled in handlePointerDown
                } else if (gesture === "released") {
                    const shouldDismiss = this.#shouldDismiss.value;
                    this.#callbacks.onDragEnd(shouldDismiss);
                }
            })
        );

        // Transform effect - call onDrag during dragging
        this.#effectCleanups.push(
            effect(() => {
                const gesture = this.#gesture.value;
                const transform = this.#transform.value;

                if (gesture === "dragging") {
                    this.#callbacks.onDrag(transform);

                    logger.debug("GestureManager: Dragging", {
                        gesture,
                        position: this.#position.value,
                        velocity: this.#velocity.value,
                        distance: this.#distance.value,
                        shouldDismiss: this.#shouldDismiss.value,
                        transform,
                    });
                }
            })
        );

        this.#effectCleanups.push(
            effect(() => {
                logger.debug("GestureManager: Direction changed", {
                    direction: this.#direction.value,
                    isVertical: this.#isVertical.value,
                });
            })
        );
    }

    destroy(): void {
        if (this.#isDestroyed) return;

        this.#isDestroyed = true;
        this.#effectCleanups.forEach(cleanup => cleanup());
        this.#effectCleanups = [];
        logger.debug("GestureManager: Destroyed");
    }

    // Core gesture detection methods
    handlePointerDown(event: PointerEvent): void {
        if (this.#isDestroyed) return;

        const now = Date.now();
        this.#pointerStart.value = { x: event.pageX, y: event.pageY };

        this.#currentPointer.value = { x: event.pageX, y: event.pageY, time: now };
        this.#lastPointer.value = { x: event.pageX, y: event.pageY, time: now };

        this.#gesture.value = "dragging";
        this.#callbacks.onDragStart();

        logger.debug("GestureManager: Pointer down", {
            x: event.pageX,
            y: event.pageY,
            pointerId: event.pointerId,
        });
    }

    handlePointerMove(event: PointerEvent): void {
        if (this.#isDestroyed || this.#gesture.value !== "dragging") return;
        if (!this.#pointerStart.value) return;

        this.#lastPointer.value = this.#currentPointer.value;
        this.#currentPointer.value = {
            x: event.pageX,
            y: event.pageY,
            time: Date.now(),
        };
    }

    handlePointerUp(event: PointerEvent): void {
        if (this.#isDestroyed) return;

        logger.debug("GestureManager: Pointer up", {
            x: event.pageX,
            y: event.pageY,
            velocity: this.#velocity.value,
            distance: this.#distance.value,
            shouldDismiss: this.#shouldDismiss.value,
            gesture: this.#gesture.value,
        });

        this.#gesture.value = "released";
        this.#pointerStart.value = null;

        // Reset to idle after a brief moment to allow consumers to react to "released"
        setTimeout(() => {
            if (!this.#isDestroyed) {
                this.#gesture.value = "idle";
                // Reset pointer signals (computed values will reset automatically)
                const now = Date.now();
                this.#currentPointer.value = { x: 0, y: 0, time: now };
                this.#lastPointer.value = { x: 0, y: 0, time: now };
            }
        }, 0);
    }

    get direction(): Direction {
        return this.#direction.value;
    }

    set direction(value: Direction) {
        this.#direction.value = value;
        logger.debug("GestureManager: Direction updated", { direction: this.#direction });
    }

    get gesture(): GestureState {
        return this.#gesture.value;
    }

    set gesture(value: GestureState) {
        this.#gesture.value = value;
    }

    get position(): DragPosition {
        return this.#position.value;
    }

    get velocity(): number {
        return this.#velocity.value;
    }

    get distance(): number {
        return this.#distance.value;
    }

    get shouldDismiss(): boolean {
        return this.#shouldDismiss.value;
    }

    get isVertical(): boolean {
        return this.#isVertical.value;
    }
}
