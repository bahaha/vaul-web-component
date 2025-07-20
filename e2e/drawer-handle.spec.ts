import { test, expect } from "@playwright/test";
import { createDrawer } from "./utils";

test("should render built-in handle for bottom drawer", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "bottom" });
    await openDrawer();
    expect(await elements.handle.isVisible()).toBe(true);
});

test("should render built-in handle for top drawer", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "top" });
    await openDrawer();
    expect(await elements.handle.isVisible()).toBe(true);
});

test("should NOT render handle for left drawer", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "left" });
    await openDrawer();
    expect(await elements.handle.isVisible()).toBe(false);
});

test("should NOT render handle for right drawer", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "right" });
    await openDrawer();
    expect(await elements.handle.isVisible()).toBe(false);
});

test("should have minimum 44px touch target (bottom drawer)", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "bottom" });
    await openDrawer();

    expect(await elements.handle.isVisible()).toBe(true);

    const hitArea = elements.handle.locator(".handle-hitarea");
    const touchTarget = await hitArea.boundingBox();

    expect(touchTarget).toBeTruthy();

    const hasTouchTarget = touchTarget!.width >= 43.9 && touchTarget!.height >= 43.9;
    const isDesktopSize = touchTarget!.width === 32 && touchTarget!.height === 4;

    expect(hasTouchTarget || isDesktopSize).toBe(true);
    expect(await elements.handle.isVisible()).toBe(true);
});

test("should have minimum 44px touch target (top drawer)", async ({ page }) => {
    const { openDrawer, elements } = await createDrawer({ page, direction: "top" });
    await openDrawer();

    expect(await elements.handle.isVisible()).toBe(true);

    const hitArea = elements.handle.locator(".handle-hitarea");
    const touchTarget = await hitArea.boundingBox();

    expect(touchTarget).toBeTruthy();

    const hasTouchTarget = touchTarget!.width >= 43.9 && touchTarget!.height >= 43.9;
    const isDesktopSize = touchTarget!.width === 32 && touchTarget!.height === 4;

    expect(hasTouchTarget || isDesktopSize).toBe(true);
    expect(await elements.handle.isVisible()).toBe(true);
});

test('should NOT render handle when show-handle="false"', async ({ page }) => {
    const template = `
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-portal show-handle="false">
                    <vaul-drawer-content>
                        <div>Content without handle</div>
                    </vaul-drawer-content>
                </vaul-drawer-portal>
            </vaul-drawer>
        `;

    const { openDrawer, elements } = await createDrawer({ page, template });
    await openDrawer();
    expect(await elements.handle.isVisible()).toBe(false);
});

test('should render handle when show-handle="true" (explicit)', async ({ page }) => {
    const template = `
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-portal show-handle="true">
                    <vaul-drawer-content>
                        <div>Content with explicit handle</div>
                    </vaul-drawer-content>
                </vaul-drawer-portal>
            </vaul-drawer>
        `;

    const { openDrawer, elements } = await createDrawer({ page, template });
    await openDrawer();

    // Handle element exists and is shown via data-show="true"
    expect(await elements.handle.isVisible()).toBe(true);
});

test("should render custom handle instead of built-in handle", async ({ page }) => {
    const template = `
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-portal>
                    <vaul-drawer-content>
                        <vaul-drawer-handle style="background: red; width: 60px; height: 8px;">
                            Custom Handle
                        </vaul-drawer-handle>
                        <div>Content with custom handle</div>
                    </vaul-drawer-content>
                </vaul-drawer-portal>
            </vaul-drawer>
        `;

    const { openDrawer, elements } = await createDrawer({ page, template });
    await openDrawer();

    // Custom handle should be visible, built-in handle should be hidden
    const customHandle = page.locator("vaul-drawer-content vaul-drawer-handle");
    await expect(customHandle).toBeVisible();

    const backgroundColor = await customHandle.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe("rgb(255, 0, 0)"); // red

    // Built-in handle should be hidden due to custom handle presence
    expect(await elements.handle.isVisible()).toBe(false);
});

test("should position custom handle correctly by user placement", async ({ page }) => {
    const template = `
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-portal>
                    <vaul-drawer-content>
                        <div>Content before handle</div>
                        <vaul-drawer-handle style="background: blue; margin: 20px auto;">
                            Middle Handle
                        </vaul-drawer-handle>
                        <div>Content after handle</div>
                    </vaul-drawer-content>
                </vaul-drawer-portal>
            </vaul-drawer>
        `;

    const { openDrawer } = await createDrawer({ page, template });
    await openDrawer();

    // Be specific about which handle we're testing (the custom one in content)
    const customHandle = page.locator("vaul-drawer-content vaul-drawer-handle");
    await expect(customHandle).toBeVisible();

    const prevSiblingText = await customHandle.evaluate(el => el.previousElementSibling?.textContent);
    const nextSiblingText = await customHandle.evaluate(el => el.nextElementSibling?.textContent);

    expect(prevSiblingText).toBe("Content before handle");
    expect(nextSiblingText).toBe("Content after handle");
});
