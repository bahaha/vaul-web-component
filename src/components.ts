import drawerStyles from "./styles/vaul-drawer.css?raw";
import triggerStyles from "./styles/vaul-drawer-trigger.css?raw";
import contentStyles from "./styles/vaul-drawer-content.css?raw";
import { logger } from "./logger";
import { signal, effect } from "@preact/signals";

type Direction = "top" | "bottom" | "left" | "right";

export class VaulDrawer extends HTMLElement {
    #dialogRef?: HTMLDialogElement;
    #direction = signal<Direction>("bottom");

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
            this.#direction.value = "bottom";
            return;
        }

        this.#direction.value = directionAttr as Direction;
    }

    get direction() {
        return this.#direction;
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
    #boundHandleClick: () => void;

    constructor() {
        super();
        this.#boundHandleClick = this.#handleClick.bind(this);
    }

    connectedCallback() {
        this.#render();
        this.addEventListener("click", this.#boundHandleClick);
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.#boundHandleClick);
    }

    #render() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = triggerStyles;
        const slot = document.createElement("slot");
        shadow.appendChild(style);
        shadow.appendChild(slot);
    }

    #handleClick() {
        const drawer = this.closest("vaul-drawer") as VaulDrawer;
        if (!drawer) {
            logger.warn("VaulDrawerTrigger: No parent vaul-drawer found");
            return;
        }
        const dialogRef = drawer.dialogRef;
        if (dialogRef) {
            dialogRef.showModal();
        } else {
            logger.warn("VaulDrawerTrigger: dialogRef not available");
        }
    }
}

export class VaulDrawerContent extends HTMLElement {
    #dialog!: HTMLDialogElement;
    #drawer?: VaulDrawer;

    constructor() {
        super();
    }

    connectedCallback() {
        this.#render();
        this.#setupDrawerRef();
        this.#bindDrawerAttributes();
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

        const direction = this.#drawer.direction;

        effect(() => {
            this.#dialog.setAttribute("data-direction", direction.value);
        });
    }

    #render() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = contentStyles;
        this.#dialog = document.createElement("dialog");
        const slot = document.createElement("slot");
        shadow.appendChild(style);
        shadow.appendChild(this.#dialog);
        this.#dialog.appendChild(slot);
    }

    get dialog() {
        return this.#dialog;
    }
}

customElements.define("vaul-drawer", VaulDrawer);
customElements.define("vaul-drawer-trigger", VaulDrawerTrigger);
customElements.define("vaul-drawer-content", VaulDrawerContent);
