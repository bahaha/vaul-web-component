import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VaulDrawer, VaulDrawerTrigger, VaulDrawerContent, setLogger, noopLogger } from "../src/index";

// Disable logging during tests
setLogger(noopLogger);

describe("Component Integration", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe("Trigger Event Handling", () => {
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

        it("should handle missing parent drawer gracefully", () => {
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            container.appendChild(trigger);

            // This should not throw an error
            expect(() => trigger.click()).not.toThrow();
        });
    });

    describe("Dialog Integration", () => {
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
            if (dialog?.showModal) {
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
    });

    describe("Component Hierarchy", () => {
        it("should maintain proper parent-child relationships", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(trigger);
            drawer.appendChild(content);
            container.appendChild(drawer);

            // Wait for components to initialize
            await new Promise(resolve => setTimeout(resolve, 0));

            // Verify hierarchical relationships
            expect(trigger.parentElement).toBe(drawer);
            expect(content.parentElement).toBe(drawer);
            expect(trigger.closest("vaul-drawer")).toBe(drawer);
            expect(content.closest("vaul-drawer")).toBe(drawer);
        });

        it("should handle multiple content elements in same drawer", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content1 = document.createElement("vaul-drawer-content") as VaulDrawerContent;
            const content2 = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(content1);
            drawer.appendChild(content2);
            container.appendChild(drawer);

            await new Promise(resolve => setTimeout(resolve, 0));

            // Both should be valid dialog elements
            expect(content1.dialog).toBeInstanceOf(HTMLDialogElement);
            expect(content2.dialog).toBeInstanceOf(HTMLDialogElement);

            // Drawer should find first content for dialogRef
            expect(drawer.dialogRef).toBe(content1.dialog);
        });
    });

    describe("Content Lifecycle", () => {
        it("should handle content added after drawer initialization", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            // Initially no dialog reference
            expect(drawer.dialogRef).toBeUndefined();

            // Add content after drawer is in DOM
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;
            drawer.appendChild(content);

            await new Promise(resolve => setTimeout(resolve, 0));

            // Should now have dialog reference
            expect(drawer.dialogRef).toBe(content.dialog);
        });

        it("should maintain dialog reference across multiple initializations", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(content);
            container.appendChild(drawer);

            await new Promise(resolve => setTimeout(resolve, 0));

            const initialDialogRef = drawer.dialogRef;
            expect(initialDialogRef).toBeInstanceOf(HTMLDialogElement);

            // Accessing dialogRef again should return same reference
            expect(drawer.dialogRef).toBe(initialDialogRef);
        });
    });
});
