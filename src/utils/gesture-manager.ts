import { signal, computed, effect } from "@preact/signals";
import { logger } from "../logger";
import { type Direction } from "../types";

const DEFAULT_VELOCITY_THRESHOLD = 0.4; // px/ms
const DEFAULT_CLOSE_THRESHOLD = 0.25; // ratio (25% of dialog dimension)

function assert(condition: boolean, message: string): void {
    if (condition) {
        throw new Error(`[GestureManager] ${message}`);
    }
}

function dampenValue(value: number): number {
    return 8 * (Math.log(Math.abs(value) + 1) - 2);
}

export type GestureState = "idle" | "dragging";

export interface DragPosition {
    x: number;
    y: number;
}

export interface GestureManagerOptions {
    /** Direction of the drawer for gesture validation */
    direction?: Direction;
    /** Whether drawer is dismissible */
    dismissible?: boolean;
    /** Velocity threshold in px/ms for dismissal */
    velocityThreshold?: number;
    /** Distance threshold as ratio (0-1) for dismissal */
    closeThreshold?: number;
    /** Getter function for target dimensions used in drag ratio calculations */
    getTargetDimensions?: () => { width: number; height: number } | null;
    /** Callback when dragging starts */
    onDragStart?: () => void;
    /** Callback during dragging with transform string */
    onDrag?: (transform: string) => void;
    /** Callback when dragging ends with dismissal decision */
    onDragEnd?: (shouldDismiss: boolean, transform: string | null) => void;
}

export class GestureManager {
    #direction = signal<Direction>("bottom");
    #dismissible = signal<boolean>(true);
    #gesture = signal<GestureState>("idle");
    #pointerStart = signal<{ x: number; y: number } | null>(null);
    #currentPointer = signal<DragPosition>({ x: 0, y: 0 });
    #lastPointer = signal<DragPosition>({ x: 0, y: 0 });
    #currentTime = signal<number>(0);
    #lastTime = signal<number>(0);
    #effectCleanups: (() => void)[] = [];
    #velocityThreshold = signal<number>(DEFAULT_VELOCITY_THRESHOLD);
    #closeThreshold = signal<number>(DEFAULT_CLOSE_THRESHOLD);
    #getTargetDimensions?: () => { width: number; height: number } | null;
    #callbacks: Required<Pick<GestureManagerOptions, "onDragStart" | "onDrag" | "onDragEnd">>;

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

    #timeDelta = computed(() => this.#currentTime.value - this.#lastTime.value);

    #velocity = computed(() => {
        const timeDelta = this.#timeDelta.value;
        if (timeDelta <= 0) return 0;

        const current = this.#currentPointer.value;
        const last = this.#lastPointer.value;
        const isVertical = this.#isVertical.value;

        const distanceFromLast = isVertical ? Math.abs(current.y - last.y) : Math.abs(current.x - last.x);

        return distanceFromLast / timeDelta;
    });

    #distance = computed(() => {
        const position = this.#position.value;
        const isVertical = this.#isVertical.value;
        const draggedDistance = isVertical ? Math.abs(position.y) : Math.abs(position.x);

        const dimensions = this.#getTargetDimensions?.() ?? { width: window.innerWidth, height: window.innerHeight };
        const targetDimension = isVertical ? dimensions.height : dimensions.width;

        return targetDimension > 0 ? draggedDistance / targetDimension : 0;
    });

    #shouldDismiss = computed(() => {
        const isOverdragging = this.#isOverdragging.value;
        if (isOverdragging) return false;

        const isQuickSwipe = this.#velocity.value >= this.#velocityThreshold.value;
        const isLongDraggedDistance = this.#distance.value >= this.#closeThreshold.value;

        return this.#dismissible.value && (isQuickSwipe || isLongDraggedDistance);
    });

    #isOverdragging = computed(() => {
        const position = this.#position.value;
        const direction = this.#direction.value;

        if (direction === "bottom") return position.y < 0; // Dragging up = overdrag
        if (direction === "top") return position.y > 0; // Dragging down = overdrag
        if (direction === "right") return position.x < 0; // Dragging left = overdrag
        if (direction === "left") return position.x > 0; // Dragging right = overdrag

        return false;
    });

    #transform = computed(() => {
        const position = this.#position.value;
        const isVertical = this.#isVertical.value;
        const isOverdragging = this.#isOverdragging.value;

        let translateValue: number;

        if (isOverdragging) {
            // Apply dampening for overdrag - reduce magnitude but preserve direction
            const draggedDistance = isVertical ? position.y : position.x;
            translateValue = Math.sign(draggedDistance) * dampenValue(Math.abs(draggedDistance));
        } else {
            translateValue = isVertical ? position.y : position.x;
        }

        return isVertical ? `translate3d(0, ${translateValue}px, 0)` : `translate3d(${translateValue}px, 0, 0)`;
    });

    constructor(options: GestureManagerOptions = {}) {
        const velocityThreshold = options.velocityThreshold ?? DEFAULT_VELOCITY_THRESHOLD;
        const closeThreshold = options.closeThreshold ?? DEFAULT_CLOSE_THRESHOLD;

        assert(velocityThreshold < 0, "velocityThreshold must be a positive number (px/ms)");
        assert(
            closeThreshold < 0 || closeThreshold > 1,
            "closeThreshold is distance threshold as ratio (0-1) for dismissal"
        );

        this.#direction.value = options.direction ?? "bottom";
        this.#dismissible.value = options.dismissible ?? true;
        this.#velocityThreshold.value = velocityThreshold;
        this.#closeThreshold.value = closeThreshold;
        this.#getTargetDimensions = options.getTargetDimensions;

        this.#callbacks = {
            onDragStart: options.onDragStart || (() => {}),
            onDrag: options.onDrag || (() => {}),
            onDragEnd: options.onDragEnd || (() => {}),
        };

        this.#setupEffects();
    }

    #setupEffects() {
        const draggingTransformEffect = effect(() => {
            if (this.#gesture.value !== "dragging") return;
            const transform = this.#transform.value;
            this.#callbacks.onDrag(transform);
        });

        this.#effectCleanups.push(draggingTransformEffect);
    }

    destroy(): void {
        this.#effectCleanups.forEach(cleanup => cleanup());
        this.#effectCleanups = [];
        logger.debug("GestureManager: Destroyed");
    }

    // Core gesture detection methods
    handlePointerDown(event: PointerEvent): void {
        // Capture pointer for target element to ensure we get move/up events even outside bounds
        (event.target as HTMLElement).setPointerCapture(event.pointerId);

        const now = Date.now();
        this.#pointerStart.value = { x: event.pageX, y: event.pageY };

        this.#currentPointer.value = { x: event.pageX, y: event.pageY };
        this.#lastPointer.value = { x: event.pageX, y: event.pageY };
        this.#currentTime.value = now;
        this.#lastTime.value = now;

        this.#gesture.value = "dragging";
        this.#callbacks.onDragStart();

        logger.debug("🔥 DRAG START");
    }

    handlePointerMove(event: PointerEvent): void {
        if (this.#gesture.value !== "dragging") return;
        if (!this.#pointerStart.value) return;

        this.#lastPointer.value = this.#currentPointer.value;
        this.#lastTime.value = this.#currentTime.value;
        this.#currentPointer.value = { x: event.pageX, y: event.pageY };
        this.#currentTime.value = Date.now();
    }

    handlePointerUp(_event: PointerEvent): void {
        logger.debug(
            `🔥 DRAG END - Distance: ${this.#distance.value.toFixed(2)} Dismiss: ${this.#shouldDismiss.value}`
        );

        const shouldDismiss = this.#shouldDismiss.value;
        this.#callbacks.onDragEnd(shouldDismiss, shouldDismiss ? null : "translate3d(0, 0, 0)");

        this.#gesture.value = "idle";
        this.#pointerStart.value = null;

        const now = Date.now();
        this.#currentPointer.value = { x: 0, y: 0 };
        this.#lastPointer.value = { x: 0, y: 0 };
        this.#currentTime.value = now;
        this.#lastTime.value = now;
    }

    get gesture(): GestureState {
        return this.#gesture.value;
    }

    set direction(value: Direction) {
        this.#direction.value = value;
    }

    set dismissible(value: boolean) {
        this.#dismissible.value = value;
    }

    get velocityThreshold(): number {
        return this.#velocityThreshold.value;
    }

    set velocityThreshold(value: number) {
        assert(value < 0, "velocityThreshold must be a positive number (px/ms)");
        this.#velocityThreshold.value = value;
    }

    get closeThreshold(): number {
        return this.#closeThreshold.value;
    }

    set closeThreshold(value: number) {
        assert(value < 0 || value > 1, "closeThreshold is distance threshold as ratio (0-1) for dismissal");
        this.#closeThreshold.value = value;
    }
}
