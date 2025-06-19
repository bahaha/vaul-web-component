import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
});

test.describe("Vaul Drawer E2E Tests", () => {
    test("should display drawer triggers on page", async ({ page }) => {
        // Check that trigger elements are visible
        await expect(page.locator("vaul-drawer-trigger").first()).toBeVisible();

        // Check trigger text content through shadow DOM
        const defaultTrigger = page.locator("vaul-drawer-trigger").first();
        await expect(defaultTrigger).toContainText("Open Default Drawer");

        const styledTrigger = page.locator("vaul-drawer-trigger").nth(1);
        await expect(styledTrigger).toContainText("Open Styled Drawer");
    });

    test("should open dialog when default trigger is clicked", async ({ page }) => {
        // Get the first drawer trigger
        const trigger = page.locator("vaul-drawer-trigger").first();

        // Check that dialog is not open initially
        const dialogOpen = await page.evaluate(() => {
            const content = document.querySelector("vaul-drawer-content");
            return content?.shadowRoot?.querySelector("dialog")?.hasAttribute("open");
        });
        expect(dialogOpen).toBe(false);

        // Click the trigger
        await trigger.click();

        // Check that dialog is now open
        const dialogOpenAfterClick = await page.evaluate(() => {
            const content = document.querySelector("vaul-drawer-content");
            return content?.shadowRoot?.querySelector("dialog")?.hasAttribute("open");
        });
        expect(dialogOpenAfterClick).toBe(true);

        // Check that the original content is still in the light DOM
        const drawer = page.locator("vaul-drawer").first();
        await expect(drawer).toContainText("Default Drawer");
        await expect(drawer).toContainText("This drawer uses default component styling");
    });

    test("should open styled dialog when styled trigger is clicked", async ({ page }) => {
        // Get the styled drawer trigger
        const trigger = page.locator("vaul-drawer-trigger").nth(1);

        // Check that dialog is not open initially
        const dialogOpen = await page.evaluate(() => {
            const content = document.querySelectorAll("vaul-drawer-content")[1];
            return content?.shadowRoot?.querySelector("dialog")?.hasAttribute("open");
        });
        expect(dialogOpen).toBe(false);

        // Click the trigger
        await trigger.click();

        // Check that dialog is now open
        const dialogOpenAfterClick = await page.evaluate(() => {
            const content = document.querySelectorAll("vaul-drawer-content")[1];
            return content?.shadowRoot?.querySelector("dialog")?.hasAttribute("open");
        });
        expect(dialogOpenAfterClick).toBe(true);

        // Check that the styled content is in the light DOM
        const drawer = page.locator("vaul-drawer").nth(1);
        await expect(drawer).toContainText("🎨 Styled Drawer");
        await expect(drawer).toContainText("This drawer has custom TailwindCSS styling applied!");
        await expect(drawer).toContainText("✨ Custom background gradient");
    });

    test("should close dialog when escape is pressed", async ({ page }) => {
        // Open the dialog first
        const trigger = page.locator("vaul-drawer-trigger").first();
        await trigger.click();

        // Verify dialog is open
        const dialogOpen = await page.evaluate(() => {
            const content = document.querySelector("vaul-drawer-content");
            return content?.shadowRoot?.querySelector("dialog")?.hasAttribute("open");
        });
        expect(dialogOpen).toBe(true);

        // Press escape to close dialog
        await page.keyboard.press("Escape");

        // Check that dialog is closed
        const dialogClosed = await page.evaluate(() => {
            const content = document.querySelector("vaul-drawer-content");
            return content?.shadowRoot?.querySelector("dialog")?.hasAttribute("open");
        });
        expect(dialogClosed).toBe(false);
    });

    test("should have proper shadow DOM structure", async ({ page }) => {
        // Check that components have shadow roots
        const drawerHasShadow = await page.evaluate(() => {
            const drawer = document.querySelector("vaul-drawer");
            return drawer?.shadowRoot !== null;
        });
        expect(drawerHasShadow).toBe(true);

        const triggerHasShadow = await page.evaluate(() => {
            const trigger = document.querySelector("vaul-drawer-trigger");
            return trigger?.shadowRoot !== null;
        });
        expect(triggerHasShadow).toBe(true);

        const contentHasShadow = await page.evaluate(() => {
            const content = document.querySelector("vaul-drawer-content");
            return content?.shadowRoot !== null;
        });
        expect(contentHasShadow).toBe(true);
    });

    test("should maintain component hierarchy structure", async ({ page }) => {
        // Check that drawer contains trigger and content
        const structure = await page.evaluate(() => {
            const drawer = document.querySelector("vaul-drawer");
            const trigger = drawer?.querySelector("vaul-drawer-trigger");
            const content = drawer?.querySelector("vaul-drawer-content");

            return {
                hasDrawer: !!drawer,
                hasTrigger: !!trigger,
                hasContent: !!content,
                triggerParent: trigger?.parentElement?.tagName.toLowerCase(),
                contentParent: content?.parentElement?.tagName.toLowerCase(),
            };
        });

        expect(structure.hasDrawer).toBe(true);
        expect(structure.hasTrigger).toBe(true);
        expect(structure.hasContent).toBe(true);
        expect(structure.triggerParent).toBe("vaul-drawer");
        expect(structure.contentParent).toBe("vaul-drawer");
    });

    test("should verify milestone 1 requirements", async ({ page }) => {
        // Verify basic drawer structure exists
        await expect(page.locator("vaul-drawer")).toHaveCount(2);
        await expect(page.locator("vaul-drawer-trigger")).toHaveCount(2);
        await expect(page.locator("vaul-drawer-content")).toHaveCount(2);

        // Verify trigger shows content when clicked
        const trigger = page.locator("vaul-drawer-trigger").first();

        // Initial state: dialog closed
        const initialDialogState = await page.evaluate(() => {
            const content = document.querySelector("vaul-drawer-content");
            return content?.shadowRoot?.querySelector("dialog")?.hasAttribute("open");
        });
        expect(initialDialogState).toBe(false);

        // After click: dialog open with content visible
        await trigger.click();

        const finalDialogState = await page.evaluate(() => {
            const content = document.querySelector("vaul-drawer-content");
            return content?.shadowRoot?.querySelector("dialog")?.hasAttribute("open");
        });
        expect(finalDialogState).toBe(true);

        // Content is properly displayed in the drawer element
        const drawer = page.locator("vaul-drawer").first();
        await expect(drawer).toContainText("Default Drawer");
    });
});
