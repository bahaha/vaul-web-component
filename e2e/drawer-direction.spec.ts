import { test, expect } from "@playwright/test";
import { createDrawer } from "./utils";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "./dist/vaul-web-component.esm.js", type: "module" });
});

test("should position drawer from top edge", async ({ page }) => {
    const { getDialogDescriber, openDrawer } = await createDrawer({ page, direction: "top" });
    await openDrawer();

    const { margin } = await getDialogDescriber();
    expect(margin.bottom).not.toBe("0px");
    expect(margin.top).toBe("0px");
    expect(margin.left).toBe("0px");
    expect(margin.right).toBe("0px");
});

test("should position drawer from bottom edge", async ({ page }) => {
    const { getDialogDescriber, openDrawer } = await createDrawer({ page, direction: "bottom" });
    await openDrawer();

    const { margin } = await getDialogDescriber();
    expect(margin.top).not.toBe("0px");
    expect(margin.bottom).toBe("0px");
    expect(margin.left).toBe("0px");
    expect(margin.right).toBe("0px");
});

test("should position drawer from left edge", async ({ page }) => {
    const { getDialogDescriber, openDrawer } = await createDrawer({ page, direction: "left" });
    await openDrawer();

    const { margin } = await getDialogDescriber();
    expect(margin.right).not.toBe("0px");
    expect(margin.top).toBe("0px");
    expect(margin.bottom).toBe("0px");
    expect(margin.left).toBe("0px");
});

test("should position drawer from right edge", async ({ page }) => {
    const { getDialogDescriber, openDrawer } = await createDrawer({ page, direction: "right" });
    await openDrawer();

    const { margin } = await getDialogDescriber();
    expect(margin.left).not.toBe("0px");
    expect(margin.top).toBe("0px");
    expect(margin.bottom).toBe("0px");
    expect(margin.right).toBe("0px");
});

test("should handle invalid direction values gracefully", async ({ page }) => {
    const { getDialogDescriber, openDrawer } = await createDrawer({ page, direction: "unknown" });

    await openDrawer();

    const { margin } = await getDialogDescriber();
    expect(margin.top).not.toBe("0px");
    expect(margin.bottom).toBe("0px");
    expect(margin.left).toBe("0px");
    expect(margin.right).toBe("0px");
});

test("should maintain direction state across multiple opens/closes", async ({ page }) => {
    const { getDialogDescriber, elements, waitDialogAnimation } = await createDrawer({ page, direction: "bottom" });

    for (let i = 0; i < 3; i++) {
        await elements.trigger.click();
        await waitDialogAnimation();

        const { margin } = await getDialogDescriber();
        expect(margin.top).not.toBe("0px");
        expect(margin.bottom).toBe("0px");
        expect(margin.left).toBe("0px");
        expect(margin.right).toBe("0px");

        await page.keyboard.press("Escape");
        await waitDialogAnimation();
    }
});
