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
    /** Tolerance in pixels for scroll edge detection (default: 1) */
    scrollTolerance?: number;
    /** Getter function for target dimensions used in drag ratio calculations */
    getTargetDimensions?: () => { width: number; height: number } | null;
    boundaryElement?: HTMLElement;
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
    #dragStartTime = signal<number>(0);
    #releaseTime = signal<number>(0);
    #velocityThreshold = signal<number>(DEFAULT_VELOCITY_THRESHOLD);
    #closeThreshold = signal<number>(DEFAULT_CLOSE_THRESHOLD);
    #getTargetDimensions?: () => { width: number; height: number } | null;
    #boundaryElement?: HTMLElement;
    #scrollTolerance: number;
    #callbacks: Required<Pick<GestureManagerOptions, "onDragStart" | "onDrag" | "onDragEnd">>;
    #effectCleanups: (() => void)[] = [];

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
        const dragStartTime = this.#dragStartTime.value;
        const releaseTime = this.#releaseTime.value;
        if (dragStartTime === 0 || releaseTime === 0) return 0;
        return releaseTime - dragStartTime;
    });

    #velocity = computed(() => {
        const timeDelta = this.#timeDelta.value;
        if (timeDelta <= 0) return 0;

        const pointerStart = this.#pointerStart.value;
        const current = this.#currentPointer.value;
        if (!pointerStart) return 0;

        const isVertical = this.#isVertical.value;
        const totalDistance = isVertical ? Math.abs(current.y - pointerStart.y) : Math.abs(current.x - pointerStart.x);

        return totalDistance / timeDelta;
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

    #checkOverdragging(deltaX: number, deltaY: number, direction: Direction): boolean {
        if (direction === "bottom") return deltaY < 0; // Dragging up = overdrag
        if (direction === "top") return deltaY > 0; // Dragging down = overdrag
        if (direction === "right") return deltaX < 0; // Dragging left = overdrag
        if (direction === "left") return deltaX > 0; // Dragging right = overdrag
        return false;
    }

    #isOverdragging = computed(() => {
        const position = this.#position.value;
        const direction = this.#direction.value;
        return this.#checkOverdragging(position.x, position.y, direction);
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

        assert(velocityThreshold <= 0, "velocityThreshold must be a positive number (px/ms)");
        assert(
            closeThreshold <= 0 || closeThreshold > 1,
            "closeThreshold is distance threshold as ratio (0-1) for dismissal"
        );

        this.#direction.value = options.direction ?? "bottom";
        this.#dismissible.value = options.dismissible ?? true;
        this.#velocityThreshold.value = velocityThreshold;
        this.#closeThreshold.value = closeThreshold;
        this.#getTargetDimensions = options.getTargetDimensions;
        this.#boundaryElement = options.boundaryElement;
        this.#scrollTolerance = options.scrollTolerance ?? 1;

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

    handleTouchMove(event: TouchEvent): void {
        if (this.#gesture.value !== "dragging") return;
        const pointerStart = this.#pointerStart.value;
        if (!pointerStart) return;
        if (!this.#shouldDrag(event.target)) return;

        const touch = event.touches[0];
        const direction = this.#direction.value;
        const deltaX = touch.pageX - pointerStart.x;
        const deltaY = touch.pageY - pointerStart.y;

        const isOverdragging = this.#checkOverdragging(deltaX, deltaY, direction);
        if (!isOverdragging) {
            event.preventDefault();
        }
    }

    handlePointerDown(event: PointerEvent): void {
        // Check for text selection before starting drag
        const highlightedText = window.getSelection()?.toString();
        if (highlightedText && highlightedText.length > 0) return;

        // Capture pointer for target element to ensure we get move/up events even outside bounds
        (event.target as HTMLElement).setPointerCapture(event.pointerId);

        const now = Date.now();
        this.#pointerStart.value = { x: event.pageX, y: event.pageY };
        this.#currentPointer.value = { x: event.pageX, y: event.pageY };
        this.#lastPointer.value = { x: event.pageX, y: event.pageY };
        this.#dragStartTime.value = now;

        this.#gesture.value = "dragging";
        this.#callbacks.onDragStart();

        logger.debug("GestureManager: Drag started");
    }

    handlePointerMove(event: PointerEvent): void {
        if (this.#gesture.value !== "dragging") return;
        if (!this.#pointerStart.value) return;
        if (!this.#shouldDrag(event.target)) return;

        this.#lastPointer.value = this.#currentPointer.value;
        this.#currentPointer.value = { x: event.pageX, y: event.pageY };
    }

    handlePointerUp(_event: PointerEvent): void {
        logger.debug("GestureManager: Drag ended", {
            distance: this.#distance.value.toFixed(2),
            shouldDismiss: this.#shouldDismiss.value,
        });

        this.#releaseTime.value = Date.now();
        const shouldDismiss = this.#shouldDismiss.value;
        this.#callbacks.onDragEnd(shouldDismiss, shouldDismiss ? null : "translate3d(0, 0, 0)");

        // Reset state
        this.#gesture.value = "idle";
        this.#pointerStart.value = null;
        this.#currentPointer.value = { x: 0, y: 0 };
        this.#lastPointer.value = { x: 0, y: 0 };
        this.#dragStartTime.value = 0;
        this.#releaseTime.value = 0;
    }

    #shouldDrag(target: EventTarget | null): boolean {
        // Check for text selection
        const highlightedText = window.getSelection()?.toString();
        if (highlightedText && highlightedText.length > 0) {
            logger.debug("GestureManager: Blocking drag due to text selection");
            return false;
        }

        let element = target as HTMLElement;
        const direction = this.#direction.value;

        while (element && element !== this.#boundaryElement) {
            const isVertical = this.#isVertical.value;
            if (isVertical && element.scrollHeight > element.clientHeight) {
                const scrollRemaining =
                    direction === "bottom"
                        ? element.scrollTop
                        : element.scrollHeight - element.scrollTop - element.clientHeight;

                if (scrollRemaining > this.#scrollTolerance) {
                    logger.debug("GestureManager: Blocking drag - vertical scroll not at edge", {
                        tagName: element.tagName,
                        scrollRemaining,
                    });
                    return false;
                }
            }

            if (!isVertical && element.scrollWidth > element.clientWidth) {
                const scrollRemaining =
                    direction === "right"
                        ? element.scrollLeft
                        : element.scrollWidth - element.scrollLeft - element.clientWidth;

                if (scrollRemaining > this.#scrollTolerance) {
                    logger.debug("GestureManager: Blocking drag - horizontal scroll not at edge", {
                        tagName: element.tagName,
                        scrollRemaining,
                    });
                    return false;
                }
            }

            element = element.parentNode as HTMLElement;
        }

        return true;
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
        assert(value <= 0, "velocityThreshold must be a positive number (px/ms)");
        this.#velocityThreshold.value = value;
    }

    get closeThreshold(): number {
        return this.#closeThreshold.value;
    }

    set closeThreshold(value: number) {
        assert(value <= 0 || value > 1, "closeThreshold is distance threshold as ratio (0-1) for dismissal");
        this.#closeThreshold.value = value;
    }
}
