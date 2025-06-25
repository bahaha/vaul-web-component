import { logger } from "../logger";

export interface ScrollManagerOptions {
    /** Elements to allow scrolling within */
    allowScrollWithin?: HTMLElement[];
    /** Additional elements to exclude from inert */
    excludeFromInert?: Element[];
    /** Custom function to determine if scrolling should be allowed */
    shouldAllowScroll?: (target: Node) => boolean;
}

export class ScrollManager {
    #scrollPosition = 0;
    #scrollbarWidth = 0;
    #inertElements: Element[] = [];
    #isLocked = false;
    #options: ScrollManagerOptions;

    constructor(options: ScrollManagerOptions = {}) {
        this.#options = options;
    }

    get isLocked(): boolean {
        return this.#isLocked;
    }

    lock(): void {
        if (this.#isLocked) return;

        this.#scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        this.#scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${this.#scrollbarWidth}px`;
        document.body.style.top = `-${this.#scrollPosition}px`;
        document.body.style.position = "fixed";
        document.body.style.width = "100%";

        this.#applyInertToBackground();
        this.#addScrollListeners();

        this.#isLocked = true;
        logger.debug("ScrollManager: Background scroll locked");
    }

    unlock(): void {
        if (!this.#isLocked) return;

        this.#removeScrollListeners();
        this.#removeInertFromBackground();

        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        document.body.style.top = "";
        document.body.style.position = "";
        document.body.style.width = "";

        window.scrollTo(0, this.#scrollPosition);

        this.#isLocked = false;
        logger.debug("ScrollManager: Background scroll unlocked");
    }

    destroy(): void {
        this.unlock();
    }

    updateOptions(options: Partial<ScrollManagerOptions>): void {
        this.#options = { ...this.#options, ...options };
    }

    #applyInertToBackground(): void {
        // inert attribute makes elements non-interactive for assistive technologies
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert
        const allowedElements = this.#options.allowScrollWithin || [];
        const excludeElements = this.#options.excludeFromInert || [];

        Array.from(document.body.children).forEach(child => {
            const isAllowedContainer = allowedElements.some(element => child.contains(element) || child === element);
            const isExcluded = excludeElements.includes(child);
            const isScript = child.tagName === "SCRIPT";

            if (!isAllowedContainer && !isExcluded && !isScript) {
                child.setAttribute("inert", "");
                this.#inertElements.push(child);
            }
        });
    }

    #removeInertFromBackground(): void {
        this.#inertElements.forEach(element => {
            element.removeAttribute("inert");
        });
        this.#inertElements = [];
    }

    #addScrollListeners(): void {
        document.addEventListener("wheel", this.#preventScrollHandler, { passive: true });
        document.addEventListener("touchmove", this.#preventScrollHandler, { passive: false });
    }

    #removeScrollListeners(): void {
        document.removeEventListener("wheel", this.#preventScrollHandler);
        document.removeEventListener("touchmove", this.#preventScrollHandler);
    }

    #preventScrollHandler = (event: Event): void => {
        const target = event.target as Node;

        if (this.#options.shouldAllowScroll?.(target)) {
            return;
        }

        const allowedElements = this.#options.allowScrollWithin;
        const isWithinAllowed = allowedElements?.some(element => element.contains(target));
        if (isWithinAllowed) return;

        event.preventDefault();
    };
}
