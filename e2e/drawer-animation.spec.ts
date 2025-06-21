import { test, expect } from "@playwright/test";
import { createDrawer } from "./utils";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "./dist/vaul-web-component.esm.js", type: "module" });
});

test("should animate slide-from-bottom with correct transform values", async ({ page }) => {
    const { getDialogDescriber, openDrawer, waitDialogAnimation } = await createDrawer({ page, direction: "bottom" });

    await openDrawer();

    const { animation, dataset } = await getDialogDescriber();
    expect(animation.name).toBe("slide-from-bottom");
    expect(animation.duration).toBe("0.1s");
    expect(dataset.state).toBe("open");

    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    const { animation: closeAnimation, dataset: closeDataset, open } = await getDialogDescriber();
    expect(closeAnimation.name).toBe("slide-to-bottom");
    expect(closeDataset.state).toBe("closed");
    expect(open).toBe(false);
});

test("should animate slide-from-top with correct transform values", async ({ page }) => {
    const { getDialogDescriber, openDrawer } = await createDrawer({ page, direction: "top" });

    await openDrawer();

    const { animation, dataset, open } = await getDialogDescriber();
    expect(animation.name).toBe("slide-from-top");
    expect(animation.duration).toBe("0.1s");
    expect(dataset.state).toBe("open");
    expect(open).toBe(true);
});

test("should animate slide-from-left with correct transform values", async ({ page }) => {
    const { getDialogDescriber, openDrawer, waitDialogAnimation } = await createDrawer({ page, direction: "left" });

    await openDrawer();

    const { animation, dataset } = await getDialogDescriber();
    expect(animation.name).toBe("slide-from-left");
    expect(animation.duration).toBe("0.1s");
    expect(dataset.state).toBe("open");

    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    const { animation: closeAnimation, dataset: closeDataset, open } = await getDialogDescriber();
    expect(closeAnimation.name).toBe("slide-to-left");
    expect(closeDataset.state).toBe("closed");
    expect(open).toBe(false);
});

test("should animate slide-from-right with correct transform values", async ({ page }) => {
    const { getDialogDescriber, openDrawer, waitDialogAnimation } = await createDrawer({ page, direction: "right" });

    await openDrawer();

    const { animation, dataset } = await getDialogDescriber();
    expect(animation.name).toBe("slide-from-right");
    expect(animation.duration).toBe("0.1s");
    expect(dataset.state).toBe("open");

    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    const { animation: closeAnimation, dataset: closeDataset, open } = await getDialogDescriber();
    expect(closeAnimation.name).toBe("slide-to-right");
    expect(closeDataset.state).toBe("closed");
    expect(open).toBe(false);
});

test("should handle rapid open/close without visual glitches", async ({ page }) => {
    const { getDialogDescriber, elements, waitDialogAnimation } = await createDrawer({ page, direction: "bottom" });

    await elements.trigger.click();
    await page.waitForTimeout(50);
    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    let { open } = await getDialogDescriber();
    expect(open).toBe(false);

    await elements.trigger.click();
    await page.waitForTimeout(30);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(30);
    await elements.trigger.click();
    await waitDialogAnimation();

    const { dataset, open: finalOpen } = await getDialogDescriber();
    expect(dataset.state).toBe("open");
    expect(finalOpen).toBe(true);
});

test("should sync backdrop fade animation with drawer animation", async ({ page }) => {
    const { getDialogDescriber, openDrawer, waitDialogAnimation } = await createDrawer({ page, direction: "bottom" });

    await openDrawer();

    const { backdrop, open } = await getDialogDescriber();
    expect(backdrop.animation.name).toBe("fade-in");
    expect(open).toBe(true);

    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    const { backdrop: closeBackdrop, open: closedOpen } = await getDialogDescriber();
    expect(closeBackdrop.animation.name).toBe("fade-out");
    expect(closedOpen).toBe(false);
});

test("should respect custom animation duration CSS variable", async ({ page }) => {
    const { getDialogDescriber, elements } = await createDrawer({ page, animationDuration: 50 });

    await elements.trigger.click();

    const { animation } = await getDialogDescriber();
    expect(animation.duration).toBe("0.05s");
});
