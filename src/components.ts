import drawerStyles from "./styles/vaul-drawer.css?raw";
import triggerStyles from "./styles/vaul-drawer-trigger.css?raw";
import contentStyles from "./styles/vaul-drawer-content.css?raw";
import handleStyles from "./styles/vaul-drawer-handle.css?raw";
import { logger } from "./logger";
import { signal, effect, computed } from "@preact/signals";
import { createAttributeParsers, createBooleanParser, createEnumParser } from "./utils/parser";
import { ScrollManager } from "./utils/scroll-manager";
import { GestureManager } from "./utils/gesture-manager";
import { type Direction, supportedDirections } from "./types";
const camelCase = (str: string) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

export class VaulDrawer extends HTMLElement {
    #dialogRef?: HTMLDialogElement;
    #direction = signal<Direction>("bottom");
    #open = signal<boolean>(false);
    #dismissible = signal<boolean>(true);

    #isVertical = computed(() => {
        const direction = this.#direction.value;
        return direction === "top" || direction === "bottom";
    });
    #propsSubscriptions: Map<number, () => void> = new Map();

    private static parsers = createAttributeParsers({
        direction: createEnumParser({ name: "direction", validValues: supportedDirections, defaultValue: "bottom" }),
        dismissible: createBooleanParser(true),
    });

    constructor() {
        super();
    }

    connectedCallback() {
        this.#render();
        for (const [attr, parser] of Object.entries(VaulDrawer.parsers)) {
            (this as any)[attr] = parser(this.getAttribute(attr));
        }
    }

    disconnectedCallback() {
        this.#propsSubscriptions.forEach(cleanup => cleanup());
    }

    static get observedAttributes() {
        return VaulDrawer.parsers.getObservedAttributes();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;
        const parser = VaulDrawer.parsers[name as keyof typeof VaulDrawer.parsers];
        if (parser && typeof parser === "function") {
            (this as any)[name] = parser(newValue);
        }
    }

    watch(prop: "direction" | "dismissible", callback: (newValue: any) => void): () => void {
        const key = Math.floor(Math.random() * 1000000);
        this.#propsSubscriptions.set(
            key,
            effect(() => callback(this[prop]))
        );
        return () => this.#propsSubscriptions.delete(key);
    }

    #render() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = drawerStyles;
        const slot = document.createElement("slot");
        shadow.appendChild(style);
        shadow.appendChild(slot);
    }

    get direction() {
        return this.#direction.value;
    }

    set direction(direction: Direction) {
        this.#direction.value = direction;
    }

    get dismissible() {
        return this.#dismissible.value;
    }

    set dismissible(value: boolean) {
        this.#dismissible.value = value;
    }

    get isVertical() {
        return this.#isVertical.value;
    }

    get open() {
        return this.#open.value;
    }

    set open(value: boolean) {
        this.#open.value = value;
        if (!this.dialogRef) return;

        if (value) {
            this.dialogRef.showModal();
        } else {
            // Change open to false wiill make data-state="closed", which will trigger the exit animation
            // We need to wait for the animation to finish to close the dialog, and then unlock the background interaction
        }
    }

    get dialogRef() {
        if (!this.#dialogRef) {
            const content = this.querySelector("vaul-drawer-content") as VaulDrawerContent;
            if (!content) {
                logger.error(
                    "VaulDrawer: Please ensure you have a <vaul-drawer-content> element inside your <vaul-drawer>"
                );
                return undefined;
            }
            this.#dialogRef = content.dialog;
        }
        return this.#dialogRef;
    }
}

export class VaulDrawerTrigger extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.#render();
        this.addEventListener("click", this.#handleClick);
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.#handleClick);
    }

    #render() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = triggerStyles;
        const slot = document.createElement("slot");
        shadow.appendChild(style);
        shadow.appendChild(slot);
    }

    #handleClick = () => {
        const drawer = this.closest("vaul-drawer") as VaulDrawer;
        if (!drawer) {
            logger.warn("VaulDrawerTrigger: No parent vaul-drawer found");
            return;
        }

        drawer.open = true;
    };
}

export class VaulDrawerContent extends HTMLElement {
    #drawer?: VaulDrawer;
    dialog!: HTMLDialogElement;
    #showHandle = signal<boolean>(true);
    #builtInHandle?: HTMLElement;
    #effectCleanups: (() => void)[] = [];
    #scrollManager!: ScrollManager;
    #gestureManager!: GestureManager;

    #showDrawerHandle = computed(() => {
        if (!this.#drawer) return false;

        const isVertical = this.#drawer.isVertical;
        const showHandle = this.#showHandle.value;
        const hasManualHandle = this.querySelector("vaul-drawer-handle");

        return isVertical && showHandle && !hasManualHandle;
    });

    private static parsers = createAttributeParsers({
        "show-handle": createBooleanParser(true),
    });

    // === Web Component Lifecycle ===
    constructor() {
        super();
    }

    connectedCallback() {
        this.#render();
        this.#setupDrawerRef();
        this.#bindDrawerAttributes();
        this.#setupAnimationListeners();

        for (const [attr, parser] of Object.entries(VaulDrawerContent.parsers)) {
            (this as any)[camelCase(attr)] = parser(this.getAttribute(attr));
        }

        if (!this.#drawer) return;
        this.#registerDrawerHandle();
        this.#setupGestureManager();
        this.#setupScrollManager();
    }

    static get observedAttributes() {
        return VaulDrawerContent.parsers.getObservedAttributes();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;
        const parser = VaulDrawerContent.parsers[name as keyof typeof VaulDrawerContent.parsers];
        if (parser && typeof parser === "function") {
            (this as any)[camelCase(name)] = parser(newValue);
        }
    }

    disconnectedCallback() {
        this.#effectCleanups.forEach(cleanup => cleanup());
        this.#effectCleanups = [];
    }

    // === Setup Methods ===
    #render() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = contentStyles;
        this.dialog = document.createElement("dialog");
        const slot = document.createElement("slot");
        shadow.appendChild(style);
        shadow.appendChild(this.dialog);
        this.dialog.appendChild(slot);
    }

    #setupDrawerRef() {
        this.#drawer = this.closest("vaul-drawer") as VaulDrawer;
        if (!this.#drawer) {
            logger.warn("VaulDrawerContent: No parent vaul-drawer found");
            return;
        }
    }

    #bindDrawerAttributes() {
        if (!this.#drawer) return;
        this.#effectCleanups.push(
            ...[
                effect(() => this.dialog.setAttribute("data-direction", this.#drawer!.direction)),
                effect(() => this.dialog.setAttribute("data-state", this.#drawer!.open ? "open" : "closed")),
            ]
        );
    }

    #setupAnimationListeners() {
        this.dialog.addEventListener("animationend", this.#closeDialog);
        // Use capture to intercept cancel events before dialog's internal handlers
        this.dialog.addEventListener("cancel", this.#blockNativeDialogCancel, true);
        this.dialog.addEventListener("click", this.#handleDialogClick);
        // Chrome will ignore a event.preventDefault() on the second Esc press, see
        // - issues.chromium.org/issues/346597066
        // - issues.chromium.org/issues/41491338
        window.addEventListener("keydown", this.#handleKeyDown, true);

        this.#effectCleanups.push(() => {
            this.dialog?.removeEventListener("animationend", this.#closeDialog);
            this.dialog?.removeEventListener("cancel", this.#blockNativeDialogCancel, true);
            this.dialog?.removeEventListener("click", this.#handleDialogClick);
            window.removeEventListener("keydown", this.#handleKeyDown, true);
        });
    }

    #setupScrollManager() {
        if (!this.#drawer) return;
        this.#scrollManager = new ScrollManager({ allowScrollWithin: [this.dialog, this] });
        this.#effectCleanups.push(
            effect(() => (this.#drawer!.open ? this.#scrollManager.lock() : this.#scrollManager.unlock()))
        );
        this.#effectCleanups.push(() => this.#scrollManager.destroy());
    }

    #setupGestureManager() {
        if (!this.#drawer) return;

        this.#gestureManager = new GestureManager({
            direction: this.#drawer.direction,
            dismissible: this.#drawer?.dismissible ?? true,
            getTargetDimensions: () => {
                const rect = this.dialog.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
            },
            onDragStart: () => (this.dialog.style.transition = "none"),
            onDrag: (transform: string) => (this.dialog.style.transform = transform),
            onDragEnd: (shouldDismiss: boolean, transform: string | null) => {
                this.dialog.style.transition = "transform var(--vaul-drawer-duration) var(--vaul-drawer-timing)";
                if (transform) {
                    this.dialog.style.transform = transform;
                }
                if (shouldDismiss) {
                    this.#drawer!.open = false;
                }
            },
        });

        const propsWatchers = [
            this.#drawer.watch("direction", direction => (this.#gestureManager.direction = direction)),
            this.#drawer.watch("dismissible", dismissible => (this.#gestureManager.dismissible = dismissible)),
        ];

        this.dialog.addEventListener("pointerdown", this.#handlePointerDown);
        this.dialog.addEventListener("pointermove", this.#handlePointerMove);
        this.dialog.addEventListener("pointerup", this.#handlePointerUp);
        this.dialog.addEventListener("pointerout", this.#handlePointerOut);
        this.dialog.addEventListener("contextmenu", this.#handleContextMenu);

        this.#effectCleanups.push(() => {
            propsWatchers.forEach(cleanup => cleanup());

            this.dialog?.removeEventListener("pointerdown", this.#handlePointerDown);
            this.dialog?.removeEventListener("pointermove", this.#handlePointerMove);
            this.dialog?.removeEventListener("pointerup", this.#handlePointerUp);
            this.dialog?.removeEventListener("pointerout", this.#handlePointerOut);
            this.dialog?.removeEventListener("contextmenu", this.#handleContextMenu);

            this.#gestureManager.destroy();
        });
    }

    // === Event Handlers ===
    #closeDialog = (event: AnimationEvent) => {
        if (event.target !== this.dialog || !this.#drawer) return;

        if (event.animationName.startsWith("slide-to-")) {
            this.dialog.close();
            // Reset the drawer position to avoid memoried transform while reopen
            this.dialog.style.transform = "";
        }
    };

    #handleKeyDown = (event: KeyboardEvent) => {
        if (!this.#drawer || !this.#drawer.open) return;
        if (event.key !== "Escape") return;

        event.preventDefault();
        event.stopImmediatePropagation();

        if (!this.#drawer.dismissible) return;
        this.#drawer.open = false;
    };

    #blockNativeDialogCancel = (event: Event) => {
        // Always prevent the native dialog cancel behavior
        // We handle ESC through the global keydown listener instead
        event.preventDefault();
        event.stopImmediatePropagation();
    };

    #handleDialogClick = (event: MouseEvent) => {
        if (!this.#drawer || !this.#drawer.open) return;
        if (event.target !== this.dialog) return;
        if (!this.#drawer.dismissible) return;

        this.#drawer.open = false;
    };

    // === Gesture Event Handlers ===
    #handlePointerDown = (event: PointerEvent) => {
        if (!this.#drawer || !this.#drawer.open) return;

        logger.debug("VaulDrawerContent: Pointer down", {
            x: event.pageX,
            y: event.pageY,
            pointerId: event.pointerId,
        });

        this.#gestureManager.handlePointerDown(event);
    };

    #handlePointerMove = (event: PointerEvent) => {
        if (!this.#drawer || !this.#drawer.open) return;

        logger.debug("VaulDrawerContent: Pointer move", {
            x: event.pageX,
            y: event.pageY,
            gesture: this.#gestureManager.gesture,
        });

        if (this.#gestureManager.gesture !== "dragging") return;

        this.#gestureManager.handlePointerMove(event);
    };

    #handlePointerUp = (event: PointerEvent) => {
        if (!this.#drawer) return;

        logger.debug("VaulDrawerContent: Pointer up", {
            x: event.pageX,
            y: event.pageY,
            pointerId: event.pointerId,
            target: event.target,
            currentTarget: event.currentTarget,
        });

        this.#gestureManager.handlePointerUp(event);
    };

    #handlePointerOut = (event: PointerEvent) => {
        if (!this.#drawer) return;
        if (this.#gestureManager.gesture !== "dragging") return;

        this.#gestureManager.handlePointerUp(event);
    };

    #handleContextMenu = (_event: Event) => {
        if (!this.#drawer) return;
        if (this.#gestureManager.gesture !== "dragging") return;

        // Convert to PointerEvent-like object for consistency
        const syntheticEvent = new PointerEvent("pointerup", {
            clientX: 0,
            clientY: 0,
            pointerId: 1,
        });

        this.#gestureManager.handlePointerUp(syntheticEvent);
    };

    // === Handle Management Methods ===
    #registerDrawerHandle() {
        this.#effectCleanups.push(
            effect(() => {
                const shouldShow = this.#showDrawerHandle.value;
                // need to replace hanlde position when direction changes
                const direction = this.#drawer!.direction;

                logger.debug(`VaulDrawerContent: Handle effect - shouldShow: ${shouldShow}, direction: ${direction}`);

                if (shouldShow) {
                    this.#removeBuiltInHandle();
                    this.#addBuiltInHandle();
                } else {
                    this.#removeBuiltInHandle();
                }
            })
        );
    }

    #addBuiltInHandle() {
        if (this.#builtInHandle) return;
        const handle = document.createElement("vaul-drawer-handle");
        const direction = this.#drawer!.direction;
        handle.setAttribute("data-drawer-direction", direction);

        if (direction === "bottom") {
            this.dialog.insertBefore(handle, this.dialog.firstChild);
        } else if (direction === "top") {
            this.dialog.appendChild(handle);
        }

        this.#builtInHandle = handle;
        logger.debug(`VaulDrawerContent: Built-in handle added for vertical drawer`);
    }

    #removeBuiltInHandle() {
        if (!this.#builtInHandle?.parentNode) return;

        this.#builtInHandle.parentNode.removeChild(this.#builtInHandle);
        this.#builtInHandle = undefined;
        logger.debug("VaulDrawerContent: Built-in handle removed");
    }

    // === Getters & Setters ===
    get showHandle() {
        return this.#showHandle.value;
    }

    set showHandle(value: boolean) {
        this.#showHandle.value = value;
    }
}

export class VaulDrawerHandle extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.#render();
    }

    #render() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = handleStyles;

        const hitArea = document.createElement("span");
        hitArea.className = "handle-hitarea";
        hitArea.setAttribute("aria-hidden", "true");

        shadow.appendChild(style);
        shadow.appendChild(hitArea);
    }
}

customElements.define("vaul-drawer", VaulDrawer);
customElements.define("vaul-drawer-trigger", VaulDrawerTrigger);
customElements.define("vaul-drawer-content", VaulDrawerContent);
customElements.define("vaul-drawer-handle", VaulDrawerHandle);
