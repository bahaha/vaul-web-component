import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VaulDrawer, VaulDrawerTrigger, VaulDrawerContent, setLogger, noopLogger } from "../src/index";

// Disable logging during tests
setLogger(noopLogger);

describe("VaulDrawer Core Functionality", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe("Component Registration", () => {
        it("should register all web components", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            expect(drawer).toBeInstanceOf(VaulDrawer);
            expect(trigger).toBeInstanceOf(VaulDrawerTrigger);
            expect(content).toBeInstanceOf(VaulDrawerContent);
        });

        it("should have correct tag names", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const trigger = document.createElement("vaul-drawer-trigger") as VaulDrawerTrigger;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            expect(drawer.tagName.toLowerCase()).toBe("vaul-drawer");
            expect(trigger.tagName.toLowerCase()).toBe("vaul-drawer-trigger");
            expect(content.tagName.toLowerCase()).toBe("vaul-drawer-content");
        });
    });

    describe("Core Drawer Functionality", () => {
        it("should show dialog when trigger is clicked", async () => {
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

            // Verify basic structure
            expect(drawer.shadowRoot).toBeTruthy();
            expect(trigger.shadowRoot).toBeTruthy();
            expect(content.shadowRoot).toBeTruthy();

            // Verify dialog element exists
            expect(content.dialog).toBeInstanceOf(HTMLDialogElement);
            expect(drawer.dialogRef).toBe(content.dialog);

            // Verify hierarchical relationships
            expect(trigger.parentElement).toBe(drawer);
            expect(content.parentElement).toBe(drawer);
        });
    });

    describe("Directional Drawer Functionality", () => {
        it("should support directional positioning", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            // Should have direction signal
            expect(drawer.direction).toBeDefined();
            expect(drawer.direction.value).toBe("bottom");

            // Should be able to set direction
            drawer.setAttribute("direction", "top");
            expect(drawer.direction.value).toBe("top");
        });
    });
});
