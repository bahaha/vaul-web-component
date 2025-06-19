import { describe, it, expect, beforeEach } from "vitest";
import "../src/vaul-drawer";
import "../src/vaul-drawer-trigger";

describe("VaulDrawer", () => {
    let drawer: HTMLElement;

    beforeEach(() => {
        drawer = document.createElement("vaul-drawer");
        document.body.appendChild(drawer);
    });

    afterEach(() => {
        document.body.removeChild(drawer);
    });

    it("should render successfully", () => {
        expect(drawer.tagName.toLowerCase()).toBe("vaul-drawer");
        expect(drawer.textContent).toContain("Hello World - Vaul Drawer");
    });
});

describe("VaulDrawerTrigger", () => {
    let trigger: HTMLElement;

    beforeEach(() => {
        trigger = document.createElement("vaul-drawer-trigger");
        document.body.appendChild(trigger);
    });

    afterEach(() => {
        document.body.removeChild(trigger);
    });

    it("should render successfully", () => {
        expect(trigger.tagName.toLowerCase()).toBe("vaul-drawer-trigger");
        expect(trigger.textContent).toContain("Hello World - Vaul Trigger");
    });
});
