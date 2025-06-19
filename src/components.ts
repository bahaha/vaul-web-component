import drawerStyles from "./styles/vaul-drawer.css?raw";
import triggerStyles from "./styles/vaul-drawer-trigger.css?raw";
import contentStyles from "./styles/vaul-drawer-content.css?raw";
import { logger } from "./logger";

export class VaulDrawer extends HTMLElement {
    #dialogRef?: HTMLDialogElement;

    constructor() {
        super();
        logger.debug("VaulDrawer: constructor");
    }

    connectedCallback() {
        logger.debug("VaulDrawer: connectedCallback");
        this.#render();
    }

    #render() {
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = drawerStyles;
        const slot = document.createElement("slot");
        shadow.appendChild(style);
        shadow.appendChild(slot);
    }

    get dialogRef() {
        logger.debug("VaulDrawer: dialogRef accessed");
        if (!this.#dialogRef) {
            logger.debug("VaulDrawer: dialogRef not cached, looking for content");
            const content = this.querySelector("vaul-drawer-content") as VaulDrawerContent;
            if (!content) {
                logger.error(
                    "VaulDrawer: Please ensure you have a <vaul-drawer-content> element inside your <vaul-drawer>"
                );
                return undefined;
            }
            this.#dialogRef = content.dialog;
            logger.debug("VaulDrawer: dialogRef cached successfully");
        }
        return this.#dialogRef;
    }
}

export class VaulDrawerTrigger extends HTMLElement {
    #boundHandleClick: () => void;

    constructor() {
        super();
        logger.debug("VaulDrawerTrigger: constructor");
        this.#boundHandleClick = this.#handleClick.bind(this);
    }

    connectedCallback() {
        logger.debug("VaulDrawerTrigger: connectedCallback");
        this.#render();
        this.addEventListener("click", this.#boundHandleClick);
        logger.debug("VaulDrawerTrigger: click listener added");
    }

    disconnectedCallback() {
        logger.debug("VaulDrawerTrigger: disconnectedCallback");
        this.removeEventListener("click", this.#boundHandleClick);
        logger.debug("VaulDrawerTrigger: click listener removed");
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
        logger.debug("VaulDrawerTrigger: click event triggered");
        const drawer = this.closest("vaul-drawer") as VaulDrawer;
        if (!drawer) {
            logger.warn("VaulDrawerTrigger: No parent vaul-drawer found");
            return;
        }
        logger.debug("VaulDrawerTrigger: found parent drawer, accessing dialogRef");
        const dialogRef = drawer.dialogRef;
        if (dialogRef) {
            logger.debug("VaulDrawerTrigger: showing modal");
            dialogRef.showModal();
        } else {
            logger.warn("VaulDrawerTrigger: dialogRef not available");
        }
    }
}

export class VaulDrawerContent extends HTMLElement {
    #dialog!: HTMLDialogElement;

    constructor() {
        super();
        logger.debug("VaulDrawerContent: constructor");
    }

    connectedCallback() {
        logger.debug("VaulDrawerContent: connectedCallback");
        this.#render();
    }

    #render() {
        logger.debug("VaulDrawerContent: rendering with shadow DOM");
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = contentStyles;
        this.#dialog = document.createElement("dialog");
        logger.debug("VaulDrawerContent: dialog element created");
        const slot = document.createElement("slot");
        shadow.appendChild(style);
        shadow.appendChild(this.#dialog);
        this.#dialog.appendChild(slot);
        logger.debug("VaulDrawerContent: render complete");
    }

    get dialog() {
        logger.debug("VaulDrawerContent: dialog getter accessed");
        return this.#dialog;
    }
}

customElements.define("vaul-drawer", VaulDrawer);
customElements.define("vaul-drawer-trigger", VaulDrawerTrigger);
customElements.define("vaul-drawer-content", VaulDrawerContent);
