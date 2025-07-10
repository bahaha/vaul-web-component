import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VaulDrawer, VaulDrawerPortal, VaulDrawerTrigger, setLogger, noopLogger } from "./index";
import { createAnimationEvent } from "./test-setup";

setLogger(noopLogger);

describe("animation-state", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it("should set data-state to open when drawer opens", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
        const dialog = content.dialog;

        expect(drawer.dialogRef).toBeDefined();
        drawer.open = true;

        expect(dialog.dataset.state).toBe("open");
        expect(dialog.open).toBe(true);
    });

    it("should set data-state to closed when drawer closes", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
        const dialog = content.dialog;

        expect(drawer.dialogRef).toBeDefined();

        drawer.open = true;
        drawer.open = false;

        expect(dialog.dataset.state).toBe("closed");
    });

    it("should set data-state to open when trigger is clicked", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-trigger>Open</vaul-drawer-trigger>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const trigger = container.querySelector("vaul-drawer-trigger") as VaulDrawerTrigger;
        const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
        const dialog = content.dialog;

        trigger.click();

        expect(dialog.dataset.state).toBe("open");
        expect(dialog.open).toBe(true);
    });

    it("should close dialog on animationend for slide-to animations", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
        const dialog = content.dialog;

        drawer.open = true;
        drawer.open = false;

        const animationEvent = createAnimationEvent("animationend", "slide-to-bottom");

        dialog.dispatchEvent(animationEvent);

        expect(dialog.open).toBe(false);
    });

    it("should not close dialog on animationend for slide-from animations", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
        const dialog = content.dialog;

        drawer.open = true;

        const animationEvent = createAnimationEvent("animationend", "slide-from-bottom");

        dialog.dispatchEvent(animationEvent);

        expect(dialog.dataset.state).toBe("open");
        expect(dialog.open).toBe(true);
    });

    it("should set data-state to closed on ESC key press", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
        const dialog = content.dialog;

        drawer.open = true;

        const keydownEvent = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
        window.dispatchEvent(keydownEvent);

        expect(dialog.dataset.state).toBe("closed");
        expect(keydownEvent.defaultPrevented).toBe(true);
    });

    it("should handle rapid toggle without state inconsistency", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
        const dialog = content.dialog;

        // Rapid toggle
        drawer.open = true;
        drawer.open = false;
        drawer.open = true;
        drawer.open = false;

        expect(dialog.dataset.state).toBe("closed");
        expect(drawer.open).toBe(false);
    });

    it("should maintain backdrop animation state sync with dialog", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
        const dialog = content.dialog;

        drawer.open = true;
        expect(dialog.dataset.state).toBe("open");

        drawer.open = false;
        expect(dialog.dataset.state).toBe("closed");
    });
});
