import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VaulDrawer, VaulDrawerTrigger, VaulDrawerContent, setLogger, noopLogger } from "../src/index";

// Disable logging during tests
setLogger(noopLogger);

describe("Component Basics", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe("VaulDrawer Component", () => {
        it("should create and render VaulDrawer component", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            expect(drawer.tagName.toLowerCase()).toBe("vaul-drawer");
            expect(drawer.shadowRoot).toBeTruthy();
        });

        it("should find and cache dialog reference from VaulDrawerContent", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(content);
            container.appendChild(drawer);

            // Wait for components to initialize
            await new Promise(resolve => setTimeout(resolve, 0));

            const dialogRef = drawer.dialogRef;
            expect(dialogRef).toBeInstanceOf(HTMLDialogElement);
        });

        it("should return undefined dialogRef when no content found", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            const dialogRef = drawer.dialogRef;
            expect(dialogRef).toBeUndefined();
        });
    });

    describe("VaulDrawerTrigger Component", () => {
        it("should create and render VaulDrawerTrigger component", () => {
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            container.appendChild(trigger);

            expect(trigger.tagName.toLowerCase()).toBe("vaul-drawer-trigger");
            expect(trigger.shadowRoot).toBeTruthy();
        });
    });

    describe("VaulDrawerContent Component", () => {
        it("should create and render VaulDrawerContent with dialog element", () => {
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;
            container.appendChild(content);

            expect(content.tagName.toLowerCase()).toBe("vaul-drawer-content");
            expect(content.shadowRoot).toBeTruthy();
            expect(content.dialog).toBeInstanceOf(HTMLDialogElement);
        });

        it("should expose dialog element through getter", () => {
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;
            container.appendChild(content);

            const dialog = content.dialog;
            expect(dialog).toBeInstanceOf(HTMLDialogElement);
            expect(dialog.tagName.toLowerCase()).toBe("dialog");
        });
    });

    describe("Shadow DOM Structure", () => {
        it("should have proper shadow DOM structure for all components", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            container.appendChild(drawer);
            container.appendChild(trigger);
            container.appendChild(content);

            expect(drawer.shadowRoot).toBeTruthy();
            expect(trigger.shadowRoot).toBeTruthy();
            expect(content.shadowRoot).toBeTruthy();
        });
    });
});
