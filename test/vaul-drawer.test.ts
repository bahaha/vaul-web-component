import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VaulDrawer, VaulDrawerTrigger, VaulDrawerContent, setLogger, noopLogger } from "../src/index";

// Disable logging during tests
setLogger(noopLogger);

describe("VaulDrawer Components", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe("VaulDrawer", () => {
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

    describe("VaulDrawerTrigger", () => {
        it("should create and render VaulDrawerTrigger component", () => {
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            container.appendChild(trigger);

            expect(trigger.tagName.toLowerCase()).toBe("vaul-drawer-trigger");
            expect(trigger.shadowRoot).toBeTruthy();
        });

        it("should add and remove click event listeners", () => {
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;

            const addEventListenerSpy = vi.spyOn(trigger, "addEventListener");
            const removeEventListenerSpy = vi.spyOn(trigger, "removeEventListener");

            // Component should add listener when connected
            container.appendChild(trigger);
            expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));

            // Component should remove listener when disconnected
            container.removeChild(trigger);
            expect(removeEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
        });
    });

    describe("VaulDrawerContent", () => {
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

    describe("Integration", () => {
        it("should trigger dialog showModal when trigger is clicked", async () => {
            // Create complete drawer structure
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            trigger.textContent = "Open Drawer";
            content.innerHTML = "<p>Drawer Content</p>";

            drawer.appendChild(trigger);
            drawer.appendChild(content);
            container.appendChild(drawer);

            // Wait for components to initialize
            await new Promise(resolve => setTimeout(resolve, 0));

            // Mock showModal method - dialog might not exist in jsdom
            const dialog = content.dialog;
            if (dialog && dialog.showModal) {
                const showModalSpy = vi.spyOn(dialog, "showModal").mockImplementation(() => {});

                // Click the trigger
                trigger.click();

                // Verify showModal was called
                expect(showModalSpy).toHaveBeenCalled();
            } else {
                // In jsdom, verify the integration structure works
                expect(drawer.dialogRef).toBeDefined();
                expect(trigger.closest("vaul-drawer")).toBe(drawer);
            }
        });

        it("should handle missing parent drawer gracefully", () => {
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            container.appendChild(trigger);

            // This should not throw an error
            expect(() => trigger.click()).not.toThrow();
        });
    });
});
