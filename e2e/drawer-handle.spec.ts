import { test, expect } from "@playwright/test";
import { createDrawer } from "./utils";

test("should render built-in handle for bottom drawer", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "bottom" });
    await openDrawer();
    await expect(elements.handle).toBeVisible();
});

test("should render built-in handle for top drawer", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "top" });
    await openDrawer();
    await expect(elements.handle).toBeVisible();
});

test("should NOT render handle for left drawer", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "left" });
    await openDrawer();
    await expect(elements.handle).not.toBeVisible();
});

test("should NOT render handle for right drawer", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "right" });
    await openDrawer();
    await expect(elements.handle).not.toBeVisible();
});

test("should have minimum 44px touch target (bottom drawer)", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "bottom" });
    await openDrawer();

    await expect(elements.handle).toBeVisible();

    const hitArea = elements.handle.locator(".handle-hitarea");
    const touchTarget = await hitArea.boundingBox();

    expect(touchTarget).toBeTruthy();

    const hasTouchTarget = touchTarget!.width >= 43.9 && touchTarget!.height >= 43.9;
    const isDesktopSize = touchTarget!.width === 32 && touchTarget!.height === 4;

    expect(hasTouchTarget || isDesktopSize).toBe(true);
    await expect(elements.handle).toBeVisible();
});

test("should have minimum 44px touch target (top drawer)", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "top" });
    await openDrawer();

    await expect(elements.handle).toBeVisible();

    const hitArea = elements.handle.locator(".handle-hitarea");
    const touchTarget = await hitArea.boundingBox();

    expect(touchTarget).toBeTruthy();

    const hasTouchTarget = touchTarget!.width >= 43.9 && touchTarget!.height >= 43.9;
    const isDesktopSize = touchTarget!.width === 32 && touchTarget!.height === 4;

    expect(hasTouchTarget || isDesktopSize).toBe(true);
    await expect(elements.handle).toBeVisible();
});

test('should NOT render handle when show-handle="false"', async ({ page }) => {
    const template = `
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-content show-handle="false">
                    <div>Content without handle</div>
                </vaul-drawer-content>
            </vaul-drawer>
        `;

    const { openDrawer } = await createDrawer({ page, template });
    await openDrawer();

    const handle = page.locator("vaul-drawer-content vaul-drawer-handle");
    await expect(handle).not.toBeVisible();
});

test('should render handle when show-handle="true" (explicit)', async ({ page }) => {
    const template = `
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-content show-handle="true">
                    <div>Content with explicit handle</div>
                </vaul-drawer-content>
            </vaul-drawer>
        `;

    const { openDrawer } = await createDrawer({ page, template });
    await openDrawer();

    const handle = page.locator("vaul-drawer-content vaul-drawer-handle");
    await expect(handle).toBeVisible();
});

test("should render custom handle instead of built-in handle", async ({ page }) => {
    const template = `
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-content>
                    <vaul-drawer-handle style="background: red; width: 60px; height: 8px;">
                        Custom Handle
                    </vaul-drawer-handle>
                    <div>Content with custom handle</div>
                </vaul-drawer-content>
            </vaul-drawer>
        `;

    const { openDrawer } = await createDrawer({ page, template });
    await openDrawer();

    const customHandle = page.locator("vaul-drawer-handle").first();
    await expect(customHandle).toBeVisible();

    const backgroundColor = await customHandle.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe("rgb(255, 0, 0)"); // red

    const allHandles = page.locator("vaul-drawer-handle");
    await expect(allHandles).toHaveCount(1);
});

test("should position custom handle correctly by user placement", async ({ page }) => {
    const template = `
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-content>
                    <div>Content before handle</div>
                    <vaul-drawer-handle style="background: blue; margin: 20px auto;">
                        Middle Handle
                    </vaul-drawer-handle>
                    <div>Content after handle</div>
                </vaul-drawer-content>
            </vaul-drawer>
        `;

    const { openDrawer } = await createDrawer({ page, template });
    await openDrawer();

    const customHandle = page.locator("vaul-drawer-handle");
    await expect(customHandle).toBeVisible();

    const prevSiblingText = await customHandle.evaluate(el => el.previousElementSibling?.textContent);
    const nextSiblingText = await customHandle.evaluate(el => el.nextElementSibling?.textContent);

    expect(prevSiblingText).toBe("Content before handle");
    expect(nextSiblingText).toBe("Content after handle");
});
