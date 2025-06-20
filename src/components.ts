import drawerStyles from "./styles/vaul-drawer.css?raw";
import triggerStyles from "./styles/vaul-drawer-trigger.css?raw";
import contentStyles from "./styles/vaul-drawer-content.css?raw";
import { logger } from "./logger";
import { signal, effect } from "@preact/signals";

type Direction = "top" | "bottom" | "left" | "right";

export class VaulDrawer extends HTMLElement {
    #dialogRef?: HTMLDialogElement;
    #direction = signal<Direction>("bottom");
    #open = signal<boolean>(false);

    constructor() {
        super();
    }

    connectedCallback() {
        this.#render();
        this.#updateDirection();
    }

    static get observedAttributes() {
        return ["direction"];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "direction" && oldValue !== newValue) {
            this.#updateDirection();
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

    #updateDirection() {
        const directionAttr = this.getAttribute("direction");
        const validDirections = ["top", "bottom", "left", "right"] as const;

        if (!directionAttr || !validDirections.includes(directionAttr as Direction)) {
            if (directionAttr) {
                logger.warn(`VaulDrawer: invalid direction "${directionAttr}", defaulting to "bottom"`);
            }
            this.direction = "bottom";
            return;
        }

        this.direction = directionAttr as Direction;
    }

    get direction() {
        return this.#direction.value;
    }

    set direction(direction: Direction) {
        this.#direction.value = direction;
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

    constructor() {
        super();
    }

    connectedCallback() {
        this.#render();
        this.#setupDrawerRef();
        this.#bindDrawerAttributes();
        this.#setupAnimationListeners();
    }

    disconnectedCallback() {
        this.dialog?.removeEventListener("animationend", this.#handleAnimationEnd);
        this.dialog?.removeEventListener("animationcancel", this.#handleAnimationCancel);
        this.dialog?.removeEventListener("cancel", this.#handleCancel);
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

        effect(() => this.dialog.setAttribute("data-direction", this.#drawer!.direction));
        effect(() => this.dialog.setAttribute("data-state", this.#drawer!.open ? "open" : "closed"));
    }

    #setupAnimationListeners() {
        this.dialog.addEventListener("animationend", this.#handleAnimationEnd);
        this.dialog.addEventListener("animationcancel", this.#handleAnimationCancel);
        this.dialog.addEventListener("cancel", this.#handleCancel);
    }

    #handleAnimationEnd = (event: AnimationEvent) => {
        if (event.target !== this.dialog || !this.#drawer) return;

        if (event.animationName.startsWith("slide-to-")) {
            this.dialog.close();
        }
    };

    #handleAnimationCancel = (event: AnimationEvent) => {
        if (event.target !== this.dialog || !this.#drawer) return;
        this.#drawer.open = false;
    };

    #handleCancel = (event: Event) => {
        if (event.target !== this.dialog || !this.#drawer) return;
        if (!this.#drawer.open) return;

        event.preventDefault();
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
}

customElements.define("vaul-drawer", VaulDrawer);
customElements.define("vaul-drawer-trigger", VaulDrawerTrigger);
customElements.define("vaul-drawer-content", VaulDrawerContent);
