import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VaulDrawer, VaulDrawerContent, setLogger, noopLogger } from "../src/index";

// Disable logging during tests
setLogger(noopLogger);

describe("Drawer Direction Business Logic", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe("Direction Signal Management", () => {
        it("should have default direction as bottom", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            expect(drawer.direction.value).toBe("bottom");
        });

        it("should update direction signal when attribute changes", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            drawer.setAttribute("direction", "top");
            expect(drawer.direction.value).toBe("top");

            drawer.setAttribute("direction", "left");
            expect(drawer.direction.value).toBe("left");

            drawer.setAttribute("direction", "right");
            expect(drawer.direction.value).toBe("right");

            drawer.setAttribute("direction", "bottom");
            expect(drawer.direction.value).toBe("bottom");
        });

        it("should validate direction values and fallback to bottom for invalid inputs", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            // Test invalid direction values that should fallback to bottom
            const invalidDirections = [
                "end",
                "start",
                "invalid",
                "center",
                "middle",
                "",
                "TOP",
                "Left",
                "RIGHT",
                "Bottom",
                "null",
                "undefined",
                "123",
                "true",
                "false",
            ];

            invalidDirections.forEach(invalidDir => {
                drawer.setAttribute("direction", invalidDir);
                expect(drawer.direction.value).toBe("bottom");
            });
        });

        it("should handle attribute removal by defaulting to bottom", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            // Set valid direction first
            drawer.setAttribute("direction", "top");
            expect(drawer.direction.value).toBe("top");

            // Remove attribute should default to bottom
            drawer.removeAttribute("direction");
            expect(drawer.direction.value).toBe("bottom");
        });

        it("should only accept exact lowercase valid direction strings", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            // Valid directions (should work)
            const validDirections = ["top", "bottom", "left", "right"];
            validDirections.forEach(validDir => {
                drawer.setAttribute("direction", validDir);
                expect(drawer.direction.value).toBe(validDir);
            });

            // Invalid case variations (should fallback to bottom)
            const invalidCaseDirections = [
                "TOP",
                "Top",
                "tOP",
                "ToP",
                "BOTTOM",
                "Bottom",
                "BoTtOm",
                "LEFT",
                "Left",
                "LeFt",
                "RIGHT",
                "Right",
                "RiGhT",
            ];

            invalidCaseDirections.forEach(invalidCase => {
                drawer.setAttribute("direction", invalidCase);
                expect(drawer.direction.value).toBe("bottom");
            });
        });
    });

    describe("Data Attribute Binding", () => {
        it("should set data-direction attribute on dialog when content is inside drawer", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(content);
            container.appendChild(drawer);

            // Wait for components to initialize and effects to run
            await new Promise(resolve => setTimeout(resolve, 0));

            const dialog = content.dialog;
            expect(dialog.getAttribute("data-direction")).toBe("bottom");
        });

        it("should reactively update data-direction when drawer direction changes", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(content);
            container.appendChild(drawer);

            await new Promise(resolve => setTimeout(resolve, 0));
            const dialog = content.dialog;

            // Test each valid direction
            const directions = ["top", "left", "right", "bottom"];
            for (const direction of directions) {
                drawer.setAttribute("direction", direction);
                await new Promise(resolve => setTimeout(resolve, 0));
                expect(dialog.getAttribute("data-direction")).toBe(direction);
            }
        });

        it("should update data-direction to bottom when invalid direction is set", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(content);
            container.appendChild(drawer);

            await new Promise(resolve => setTimeout(resolve, 0));
            const dialog = content.dialog;

            // Set valid direction first
            drawer.setAttribute("direction", "top");
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(dialog.getAttribute("data-direction")).toBe("top");

            // Set invalid direction - should fallback to bottom
            drawer.setAttribute("direction", "end");
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(dialog.getAttribute("data-direction")).toBe("bottom");
        });

        it("should not set data-direction when content is not inside drawer", () => {
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;
            container.appendChild(content);

            const dialog = content.dialog;
            expect(dialog.hasAttribute("data-direction")).toBe(false);
        });

        it("should handle multiple direction changes without issues", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(content);
            container.appendChild(drawer);

            await new Promise(resolve => setTimeout(resolve, 0));
            const dialog = content.dialog;

            // Rapidly change directions multiple times
            const changes = ["top", "invalid", "left", "END", "right", "BOTTOM", "bottom", "start", "top"];

            for (const direction of changes) {
                drawer.setAttribute("direction", direction);
                await new Promise(resolve => setTimeout(resolve, 0));

                // Should always have a valid direction (either the valid one or bottom fallback)
                const dataDirection = dialog.getAttribute("data-direction");
                expect(["top", "bottom", "left", "right"]).toContain(dataDirection);
            }

            // Final state should be top (last valid direction)
            expect(dialog.getAttribute("data-direction")).toBe("top");
        });
    });

    describe("Component Integration", () => {
        it("should maintain direction state across component lifecycle", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            // Set direction before adding to DOM
            drawer.setAttribute("direction", "right");

            drawer.appendChild(content);
            container.appendChild(drawer);

            await new Promise(resolve => setTimeout(resolve, 0));

            // Direction should be preserved
            expect(drawer.direction.value).toBe("right");
            expect(content.dialog.getAttribute("data-direction")).toBe("right");
        });

        it("should handle direction changes when content is added after drawer", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            // Set direction before content exists
            drawer.setAttribute("direction", "left");
            expect(drawer.direction.value).toBe("left");

            // Add content after direction is set
            const content = document.createElement("vaul-drawer-content") as VaulDrawerContent;
            drawer.appendChild(content);

            await new Promise(resolve => setTimeout(resolve, 0));

            // Content should pick up existing direction
            expect(content.dialog.getAttribute("data-direction")).toBe("left");
        });

        it("should handle multiple content elements in same drawer", async () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            const content1 = document.createElement("vaul-drawer-content") as VaulDrawerContent;
            const content2 = document.createElement("vaul-drawer-content") as VaulDrawerContent;

            drawer.appendChild(content1);
            drawer.appendChild(content2);
            container.appendChild(drawer);

            await new Promise(resolve => setTimeout(resolve, 0));

            // Both content elements should get the direction
            expect(content1.dialog.getAttribute("data-direction")).toBe("bottom");
            expect(content2.dialog.getAttribute("data-direction")).toBe("bottom");

            // Change direction
            drawer.setAttribute("direction", "top");
            await new Promise(resolve => setTimeout(resolve, 0));

            // Both should update
            expect(content1.dialog.getAttribute("data-direction")).toBe("top");
            expect(content2.dialog.getAttribute("data-direction")).toBe("top");
        });
    });

    describe("Signal Reactivity", () => {
        it("should expose direction as a readable signal", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            const directionSignal = drawer.direction;

            // Should be a signal with value property
            expect(typeof directionSignal.value).toBe("string");
            expect(directionSignal.value).toBe("bottom");

            // Should be reactive
            drawer.setAttribute("direction", "top");
            expect(directionSignal.value).toBe("top");
        });

        it("should maintain signal reference across attribute changes", () => {
            const drawer = document.createElement("vaul-drawer") as VaulDrawer;
            container.appendChild(drawer);

            const directionSignal = drawer.direction;
            const initialReference = directionSignal;

            // Change direction multiple times
            drawer.setAttribute("direction", "top");
            drawer.setAttribute("direction", "left");
            drawer.setAttribute("direction", "right");

            // Signal reference should remain the same
            expect(drawer.direction).toBe(initialReference);
            expect(drawer.direction.value).toBe("right");
        });
    });
});
