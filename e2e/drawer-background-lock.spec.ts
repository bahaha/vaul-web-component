import { test, expect, type Page } from "@playwright/test";
import { createDrawer } from "./utils";

type ColorBlock = "red" | "blue";
type ScrollDirection = "up" | "down";

interface FocusState {
    activeElementId: string | null;
    activeElementTag: string | null;
    canFocusBackground: boolean;
}

const backgroundLockTemplate = `
  <div data-testid="red-block" style="height: 100vh; background: red; display: flex; align-items: center; justify-content: center;">
    <h1 style="color: white; font-size: 3rem; text-align: center;">RED BLOCK</h1>
  </div>
  <div data-testid="blue-block" style="height: 100vh; background: blue; display: flex; align-items: center; justify-content: center;">
    <h1 style="color: white; font-size: 3rem; text-align: center;">BLUE BLOCK</h1>
  </div>
  
  <button id="bg-btn1" style="position: fixed; top: 50px; left: 20px; z-index: 10; padding: 10px; border: 2px solid blue;" onfocus="this.style.border='3px solid red'" onblur="this.style.border='2px solid blue'">Background Button 1</button>
  <button id="bg-btn2" style="position: fixed; top: 100px; left: 20px; z-index: 10; padding: 10px; border: 2px solid blue;" onfocus="this.style.border='3px solid red'" onblur="this.style.border='2px solid blue'">Background Button 2</button>
  
  <vaul-drawer direction="bottom">
    <vaul-drawer-trigger style="position: fixed; top: 20px; left: 20px; z-index: 100; padding: 10px; background: white; border: 2px solid black;">
      Open Drawer
    </vaul-drawer-trigger>
    <vaul-drawer-portal style="--vaul-drawer-duration: 100ms;">
      <vaul-drawer-content style="padding: 20px; background: white;">
        <h2>Drawer Content</h2>
        <button id="drawer-btn1" style="padding: 10px; margin: 5px; border: 2px solid gray;" onfocus="this.style.border='3px solid red'" onblur="this.style.border='2px solid gray'">Drawer Button 1</button>
        <button id="drawer-btn2" style="padding: 10px; margin: 5px; border: 2px solid gray;" onfocus="this.style.border='3px solid red'" onblur="this.style.border='2px solid gray'">Drawer Button 2</button>
        <div style="height: 200px; overflow-y: auto; background: lightgray; margin: 20px 0; padding: 10px; border: 1px solid gray;" tabindex="-1">
          <h3>Scrollable Content</h3>
          <div style="height: 400px;">
            <p>This content should be scrollable within the drawer...</p>
            <p>Line 1 of scrollable content</p>
            <p>Line 2 of scrollable content</p>
            <p>Line 3 of scrollable content</p>
            <p>Line 4 of scrollable content</p>
            <p>Line 5 of scrollable content</p>
            <p>Line 6 of scrollable content</p>
            <p>Line 7 of scrollable content</p>
            <p>Line 8 of scrollable content</p>
            <p>Line 9 of scrollable content</p>
            <p>Line 10 of scrollable content</p>
            <p>Line 11 of scrollable content</p>
            <p>Line 12 of scrollable content</p>
            <p>Line 13 of scrollable content</p>
            <p>Line 14 of scrollable content</p>
            <p>Line 15 of scrollable content</p>
            <p>End of scrollable content</p>
          </div>
        </div>
      </vaul-drawer-content>
    </vaul-drawer-portal>
  </vaul-drawer>
`;

// Scroll Lock Tests
test("should prevent background scroll when drawer opens", async ({ page }) => {
    const { openDrawer } = await createDrawer({
        page,
        template: backgroundLockTemplate,
    });

    expect(await getCurrentVisibleBlock(page)).toBe("red");

    await openDrawer();

    await tryScrollBackground(page, "down");
    expect(await getCurrentVisibleBlock(page)).toBe("red");
});

test("should allow drawer internal scrolling", async ({ page }) => {
    const { openDrawer } = await createDrawer({
        page,
        template: backgroundLockTemplate,
    });

    await openDrawer();

    const scrollableDiv = page.locator("vaul-drawer-content div[style*='overflow-y: auto']");
    await expect(scrollableDiv).toBeVisible();

    const initialScrollTop = await scrollableDiv.evaluate(el => el.scrollTop);
    expect(initialScrollTop).toBe(0);

    await scrollableDiv.hover();

    try {
        // Try mouse wheel for desktop browsers
        await page.mouse.wheel(0, 100);
    } catch (error) {
        // Fallback for mobile browsers
        if (error.message.includes("Mouse wheel is not supported")) {
            await scrollableDiv.evaluate(el => {
                el.scrollTop += 100;
            });
        } else {
            throw error;
        }
    }

    await page.waitForTimeout(100);

    const afterScrollTop = await scrollableDiv.evaluate(el => el.scrollTop);
    expect(afterScrollTop).toBeGreaterThan(0);

    expect(await getCurrentVisibleBlock(page)).toBe("red");
});

test("should restore scroll position after drawer closes", async ({ page }) => {
    const { openDrawer, getDialogDescriber, waitDialogAnimation } = await createDrawer({
        page,
        template: backgroundLockTemplate,
    });

    await scrollToBlock(page, "blue");
    expect(await getCurrentVisibleBlock(page)).toBe("blue");

    await openDrawer();
    await tryScrollBackground(page, "up");
    expect(await getCurrentVisibleBlock(page)).toBe("blue");

    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    const { open } = await getDialogDescriber();
    expect(open).toBe(false);
    expect(await getCurrentVisibleBlock(page)).toBe("blue");
});

test("should handle keyboard dismissal with scroll restoration", async ({ page }) => {
    const { openDrawer, getDialogDescriber, waitDialogAnimation } = await createDrawer({
        page,
        template: backgroundLockTemplate,
    });

    await scrollToBlock(page, "blue");
    expect(await getCurrentVisibleBlock(page)).toBe("blue");

    await openDrawer();
    expect(await getCurrentVisibleBlock(page)).toBe("blue");

    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    const { open } = await getDialogDescriber();
    expect(open).toBe(false);
    expect(await getCurrentVisibleBlock(page)).toBe("blue");
});

test("should handle backdrop click dismissal with scroll restoration", async ({ page }) => {
    const { openDrawer, clickOnBackdrop, getDialogDescriber, waitDialogAnimation } = await createDrawer({
        page,
        template: backgroundLockTemplate,
    });

    await scrollToBlock(page, "blue");
    await openDrawer();

    await clickOnBackdrop();
    await waitDialogAnimation();

    const { open } = await getDialogDescriber();
    expect(open).toBe(false);
    expect(await getCurrentVisibleBlock(page)).toBe("blue");
});

test("should trap focus within drawer when opened", async ({ page }) => {
    const { openDrawer } = await createDrawer({
        page,
        template: backgroundLockTemplate,
    });

    await openDrawer();
    await expect(page.locator("#drawer-btn1")).toBeVisible();
    await expect(page.locator("#drawer-btn2")).toBeVisible();

    await page.locator("#drawer-btn1").focus();

    await testFocusTrapWithKeypress(page, "Tab", 5, async () => await expectFocusTrappedInDrawer(page));
    await testFocusTrapWithKeypress(page, "Shift+Tab", 5, async () => await expectFocusTrappedInDrawer(page));
});

async function getCurrentVisibleBlock(page: Page): Promise<ColorBlock | null> {
    const redVisible = await page.getByTestId("red-block").isVisible();
    const blueVisible = await page.getByTestId("blue-block").isVisible();

    if (redVisible && !blueVisible) return "red";
    if (blueVisible && !redVisible) return "blue";

    if (redVisible && blueVisible) {
        const result = await page.evaluate(() => {
            const redBlock = document.querySelector('[data-testid="red-block"]');
            const blueBlock = document.querySelector('[data-testid="blue-block"]');

            if (!redBlock || !blueBlock) return null;

            const redRect = redBlock.getBoundingClientRect();
            const blueRect = blueBlock.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const redVisibleHeight = Math.max(0, Math.min(redRect.bottom, viewportHeight) - Math.max(redRect.top, 0));
            const blueVisibleHeight = Math.max(
                0,
                Math.min(blueRect.bottom, viewportHeight) - Math.max(blueRect.top, 0)
            );

            if (redVisibleHeight > blueVisibleHeight) return "red";
            if (blueVisibleHeight > redVisibleHeight) return "blue";

            return window.scrollY < viewportHeight / 2 ? "red" : "blue";
        });

        return result as ColorBlock | null;
    }

    return null;
}

async function scrollToBlock(page: Page, color: ColorBlock): Promise<void> {
    if (color === "blue") {
        await page.evaluate(() => {
            window.scrollTo(0, window.innerHeight);
        });
    } else {
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });
    }
    await page.waitForTimeout(100);
}

async function getFocusState(page: Page): Promise<FocusState> {
    return page.evaluate(() => ({
        activeElementId: document.activeElement?.id || null,
        activeElementTag: document.activeElement?.tagName?.toLowerCase() || null,
        canFocusBackground: !!document.getElementById("bg-btn1")?.offsetParent,
    }));
}

async function expectFocusTrappedInDrawer(page: Page): Promise<void> {
    const focusState = await getFocusState(page);

    if (focusState.activeElementId !== null) {
        expect(focusState.activeElementId).not.toMatch(/bg-btn[12]/);
        expect(focusState.activeElementId).toMatch(/drawer-btn[12]/);
    }
}

async function testFocusTrapWithKeypress(
    page: Page,
    key: string,
    iterations: number = 10,
    assertion?: () => Promise<void>
): Promise<void> {
    for (let i = 0; i < iterations; i++) {
        await page.keyboard.press(key);
        await page.waitForTimeout(50);
        await assertion?.();
    }
}

async function tryScrollBackground(page: Page, direction: ScrollDirection = "down"): Promise<void> {
    const viewport = page.viewportSize();
    const scrollAmount = direction === "down" ? viewport?.height || 800 : -(viewport?.height || 800);

    try {
        // Try mouse wheel for desktop browsers
        await page.mouse.wheel(0, scrollAmount);
    } catch (error) {
        // Fallback for mobile browsers (WebKit doesn't support mouse.wheel)
        if (error.message.includes("Mouse wheel is not supported")) {
            await page.evaluate(amount => {
                window.scrollBy(0, amount);
            }, scrollAmount);
        } else {
            throw error;
        }
    }

    await page.waitForTimeout(100);
}
