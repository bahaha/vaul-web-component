import { test, expect } from "@playwright/test";

test.describe("Vaul Drawer Web Components", () => {
    test("should render vaul-drawer component", async ({ page }) => {
        await page.setContent(`
      <script type="module">
        import { VaulDrawer } from '/src/vaul-drawer.ts';
      </script>
      <vaul-drawer>
        Test content
      </vaul-drawer>
    `);

        const drawer = page.locator("vaul-drawer");
        await expect(drawer).toBeAttached();
    });

    test("should render vaul-drawer-trigger component", async ({ page }) => {
        await page.setContent(`
      <script type="module">
        import { VaulDrawerTrigger } from '/src/vaul-drawer-trigger.ts';
      </script>
      <vaul-drawer-trigger>
        Test trigger
      </vaul-drawer-trigger>
    `);

        const trigger = page.locator("vaul-drawer-trigger");
        await expect(trigger).toBeAttached();
    });
});
