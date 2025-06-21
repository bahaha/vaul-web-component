import { test, expect, type Page } from "@playwright/test";
import { createDrawer } from "./utils";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "./dist/vaul-web-component.esm.js", type: "module" });
});

test.describe("dismissible = true (default behavior)", () => {
    test("should close drawer when clicking on backdrop", async ({ page }) => {
        const { getDialogDescriber, openDrawer, clickOnBackdrop, waitDialogAnimation } = await createDrawer({ page });
        await openDrawer();

        await clickOnBackdrop();
        await waitDialogAnimation();

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    });

    test("should close drawer when pressing ESC key", async ({ page }) => {
        const { getDialogDescriber, openDrawer, waitDialogAnimation } = await createDrawer({ page });
        await openDrawer();

        await page.keyboard.press("Escape");
        await waitDialogAnimation();

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    });

    test("should not close when clicking on drawer content area", async ({ page }) => {
        const { elements, getDialogDescriber, openDrawer } = await createDrawer({ page });
        await openDrawer();

        await elements.contentLabel.click();
        const checked = await elements.contentCheckbox.isChecked();
        expect(checked).toBe(true);

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    });
});

test.describe("dismissible = false (non-dismissible)", () => {
    test("should NOT close drawer when clicking on backdrop", async ({ page }) => {
        const { getDialogDescriber, openDrawer, clickOnBackdrop } = await createDrawer({
            page,
            dismissible: false,
            animationDuration: 100,
        });
        await openDrawer();

        await clickOnBackdrop();
        await page.waitForTimeout(100);

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    });

    test("should NOT close drawer when pressing ESC key", async ({ page }) => {
        const { getDialogDescriber, openDrawer } = await createDrawer({
            page,
            dismissible: false,
            animationDuration: 100,
        });
        await openDrawer();

        await page.keyboard.press("Escape");
        await page.waitForTimeout(100);

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    });

    test("should NOT close drawer on multiple ESC presses", async ({ page }) => {
        const { getDialogDescriber, openDrawer, waitDialogAnimation } = await createDrawer({
            page,
            dismissible: false,
        });
        await openDrawer();

        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await waitDialogAnimation();

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    });
});
