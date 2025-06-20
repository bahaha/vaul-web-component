import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VaulDrawer, VaulDrawerContent, setLogger, noopLogger } from "./index";

setLogger(noopLogger);

describe("drawer-direction", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it("should have a direction signal in the context of vaul-drawer", () => {
        container.innerHTML = `<vaul-drawer></vaul-drawer>`;

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        expect(drawer.direction).toBe("bottom");
    });

    it("should add data-direction data attribute in vaul-drawer-content", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-content></vaul-drawer-content>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const content = container.querySelector("vaul-drawer-content") as VaulDrawerContent;
        const dialog = content.dialog;
        expect(dialog.dataset.direction).toBe("bottom");
    });

    it("should have default direction as bottom", () => {
        container.innerHTML = `<vaul-drawer></vaul-drawer>`;

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        expect(drawer.direction).toBe("bottom");
    });

    it("should have fallback direction as bottom", () => {
        container.innerHTML = `<vaul-drawer direction="invalid"></vaul-drawer>`;

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        expect(drawer.direction).toBe("bottom");
    });

    it("should be case-insensitive of direction", () => {
        container.innerHTML = `<vaul-drawer></vaul-drawer>`;

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const caseVariations = ["BOTTOM", "Bottom", "BoTtOm", "bottom"];

        caseVariations.forEach(input => {
            drawer.setAttribute("direction", input);
            expect(drawer.direction).toBe("bottom");
        });
    });

    it("should update data-direction data attributes across direction attribute changes", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-content></vaul-drawer-content>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const content = container.querySelector("vaul-drawer-content") as VaulDrawerContent;
        const dialog = content.dialog;

        const directions = ["top", "left", "right", "bottom"];
        for (const direction of directions) {
            drawer.setAttribute("direction", direction);
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(dialog.dataset.direction).toBe(direction);
        }
    });
});
