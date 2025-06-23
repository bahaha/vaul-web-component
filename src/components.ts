import drawerStyles from "./styles/vaul-drawer.css?raw";
import triggerStyles from "./styles/vaul-drawer-trigger.css?raw";
import contentStyles from "./styles/vaul-drawer-content.css?raw";
import handleStyles from "./styles/vaul-drawer-handle.css?raw";
import { logger } from "./logger";
import { signal, effect, computed } from "@preact/signals";
import { createAttributeParsers, createBooleanParser, createEnumParser } from "./utils/parser";
const camelCase = (str: string) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

const supportedDirections = ["top", "bottom", "left", "right"] as const;
export type Direction = (typeof supportedDirections)[number];

export class VaulDrawer extends HTMLElement {
    #dialogRef?: HTMLDialogElement;
    #direction = signal<Direction>("bottom");
    #open = signal<boolean>(false);
    #dismissible = signal<boolean>(true);

    #isVertical = computed(() => {
        const direction = this.#direction.value;
        return direction === "top" || direction === "bottom";
    });

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
        if (value) this.dialogRef.showModal();
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
        this.#effectCleanups.push(
            effect(() => {
                const shouldShow = this.#showDrawerHandle.value;
                const direction = this.#drawer!.direction;

                logger.debug(`VaulDrawerContent: Handle effect - shouldShow: ${shouldShow}, direction: ${direction}`);

                if (shouldShow) {
                    // Remove existing handle first to reposition it for direction changes
                    this.#removeBuiltInHandle();
                    this.#addBuiltInHandle();
                } else {
                    this.#removeBuiltInHandle();
                }
            })
        );
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

    get showHandle() {
        return this.#showHandle.value;
    }

    set showHandle(value: boolean) {
        this.#showHandle.value = value;
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

        this.#effectCleanups.push(effect(() => this.dialog.setAttribute("data-direction", this.#drawer!.direction)));
        this.#effectCleanups.push(
            effect(() => this.dialog.setAttribute("data-state", this.#drawer!.open ? "open" : "closed"))
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
    }

    disconnectedCallback() {
        this.dialog?.removeEventListener("animationend", this.#closeDialog);
        this.dialog?.removeEventListener("cancel", this.#blockNativeDialogCancel, true);
        this.dialog?.removeEventListener("click", this.#handleDialogClick);
        window.removeEventListener("keydown", this.#handleKeyDown, true);
        this.#effectCleanups.forEach(cleanup => cleanup());
        this.#effectCleanups = [];
    }

    #closeDialog = (event: AnimationEvent) => {
        if (event.target !== this.dialog || !this.#drawer) return;

        if (event.animationName.startsWith("slide-to-")) {
            this.dialog.close();
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
