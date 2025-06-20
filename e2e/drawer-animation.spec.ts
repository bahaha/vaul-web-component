import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "./dist/vaul-web-component.esm.js", type: "module" });
});

test.describe("Drawer Animation Functionality", () => {
    test("should animate slide-from-bottom with correct transform values", async ({ page }) => {
        const { trigger, dialog } = await setupDrawer(page, "bottom", "300ms");
        const drawerHeight = await getDrawerDimensions(page, dialog);

        await trigger.click();
        const openingSamples = await sampleAnimationProgress(page, dialog, [50, 150, 250]);

        expectSampleDrawerPosition(openingSamples, (posA, posB) => posA.y > posB.y);
        expectDrawerAtRestPosition(openingSamples[openingSamples.length - 1].position);

        await page.keyboard.press("Escape");
        const closingSamples = await sampleAnimationProgress(page, dialog, [50, 150]);
        expectSampleDrawerPosition(closingSamples, (posA, posB) => posA.y < posB.y);

        await waitForAnimation(page, dialog);
        const finalPosition = await parseTransformMatrix(await getTransformValue(page, dialog));
        expectDrawerNearOffScreen(finalPosition, drawerHeight, "bottom");

        const isOpen = await page.$eval(dialog, (el: HTMLDialogElement) => el.open);
        expect(isOpen).toBe(false);
    });

    test("should animate slide-from-top with correct transform values", async ({ page }) => {
        const { trigger, dialog } = await setupDrawer(page, "top", "300ms");
        const drawerHeight = await getDrawerDimensions(page, dialog);

        await trigger.click();
        const openingSamples = await sampleAnimationProgress(page, dialog, [50, 150, 250]);

        expectSampleDrawerPosition(openingSamples, (posA, posB) => posA.y < posB.y);
        expectDrawerAtRestPosition(openingSamples[openingSamples.length - 1].position);

        await page.keyboard.press("Escape");
        const closingSamples = await sampleAnimationProgress(page, dialog, [50, 150]);
        expectSampleDrawerPosition(closingSamples, (posA, posB) => posA.y > posB.y);

        await page.waitForTimeout(150);
        const finalPosition = await parseTransformMatrix(await getTransformValue(page, dialog));
        expectDrawerNearOffScreen(finalPosition, drawerHeight, "top");

        await page.waitForTimeout(100);
        const isOpen = await page.$eval(dialog, (el: HTMLDialogElement) => el.open);
        expect(isOpen).toBe(false);
    });

    test("should animate slide-from-left with correct transform values", async ({ page }) => {
        const { trigger, dialog } = await setupDrawer(page, "left", "300ms");
        const drawerWidth = await getDrawerDimensions(page, dialog);

        await trigger.click();
        const openingSamples = await sampleAnimationProgress(page, dialog, [50, 150, 250]);

        expectSampleDrawerPosition(openingSamples, (posA, posB) => posA.x < posB.x);
        expectDrawerAtRestPosition(openingSamples[openingSamples.length - 1].position);

        await page.keyboard.press("Escape");
        const closingSamples = await sampleAnimationProgress(page, dialog, [50, 150]);
        expectSampleDrawerPosition(closingSamples, (posA, posB) => posA.x > posB.x);

        await page.waitForTimeout(150);
        const finalPosition = await parseTransformMatrix(await getTransformValue(page, dialog));
        expectDrawerNearOffScreen(finalPosition, drawerWidth, "left");

        await page.waitForTimeout(100);
        const isOpen = await page.$eval(dialog, (el: HTMLDialogElement) => el.open);
        expect(isOpen).toBe(false);
    });

    test("should animate slide-from-right with correct transform values", async ({ page }) => {
        const { trigger, dialog } = await setupDrawer(page, "right", "300ms");
        const drawerWidth = await getDrawerDimensions(page, dialog);

        await trigger.click();
        const openingSamples = await sampleAnimationProgress(page, dialog, [50, 150, 250]);

        expectSampleDrawerPosition(openingSamples, (posA, posB) => posA.x > posB.x);
        expectDrawerAtRestPosition(openingSamples[openingSamples.length - 1].position);

        await page.keyboard.press("Escape");
        const closingSamples = await sampleAnimationProgress(page, dialog, [50, 150]);
        expectSampleDrawerPosition(closingSamples, (posA, posB) => posA.x < posB.x);

        await page.waitForTimeout(150);
        const finalPosition = await parseTransformMatrix(await getTransformValue(page, dialog));
        expectDrawerNearOffScreen(finalPosition, drawerWidth, "right");

        await page.waitForTimeout(100);
        const isOpen = await page.$eval(dialog, (el: HTMLDialogElement) => el.open);
        expect(isOpen).toBe(false);
    });

    test("should handle rapid open/close without visual glitches", async ({ page }) => {
        await page.setContent(`
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-content>
                    <p>Drawer content</p>
                </vaul-drawer-content>
            </vaul-drawer>
        `);
        await page.waitForTimeout(100);

        const trigger = page.locator("vaul-drawer-trigger");
        const dialogSelector = "vaul-drawer-content dialog";

        await trigger.click();
        await page.waitForTimeout(50);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(50);
        await trigger.click();

        await waitForAnimation(page, dialogSelector);
        const finalState = await getDataState(page, dialogSelector);
        expect(finalState).toBe("open");

        const isOpen = await page.$eval(dialogSelector, (el: HTMLDialogElement) => el.open);
        expect(isOpen).toBe(true);
    });

    test("should sync backdrop fade animation with drawer animation", async ({ page }) => {
        const { trigger, dialog } = await setupDrawer(page, "bottom", "300ms");

        await trigger.click();
        const openingOpacities = await sampleBackdropOpacity(page, dialog, [50, 150, 250]);

        expectSampleBackdropOpacity(openingOpacities, (opacA, opacB) => opacA < opacB);
        expect(openingOpacities[openingOpacities.length - 1].opacity).toBeGreaterThan(0.5);

        await page.keyboard.press("Escape");
        const closingOpacities = await sampleBackdropOpacity(page, dialog, [50, 150]);
        expectSampleBackdropOpacity(closingOpacities, (opacA, opacB) => opacA > opacB);

        await page.waitForTimeout(150);
        const isOpen = await page.$eval(dialog, (el: HTMLDialogElement) => el.open);
        expect(isOpen).toBe(false);
    });

    test("should respect custom animation duration CSS variable", async ({ page }) => {
        await page.setContent(`
            <style>
                vaul-drawer-content {
                    --vaul-drawer-duration: 0.1s;
                }
            </style>
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-content>
                    <p>Fast animation</p>
                </vaul-drawer-content>
            </vaul-drawer>
        `);
        await page.waitForTimeout(100);

        const trigger = page.locator("vaul-drawer-trigger");
        const dialogSelector = "vaul-drawer-content dialog";

        await trigger.click();

        const animationDuration = await page.$eval(dialogSelector, el => {
            return window.getComputedStyle(el).animationDuration;
        });
        expect(animationDuration).toBe("0.1s");

        await waitForAnimation(page, dialogSelector);
    });

    // Helper functions
    async function waitForAnimation(page: Page, selector: string) {
        return page.$eval(
            selector,
            el =>
                new Promise<void>(resolve => {
                    const onEnd = () => {
                        el.removeEventListener("animationend", onEnd);
                        resolve();
                    };
                    el.addEventListener("animationend", onEnd);
                })
        );
    }

    async function getTransformValue(page: Page, selector: string) {
        return page.$eval(selector, el => {
            const style = window.getComputedStyle(el);
            return style.transform;
        });
    }

    async function getDataState(page: Page, selector: string) {
        return page.$eval(selector, el => el.getAttribute("data-state"));
    }

    async function parseTransformMatrix(transform: string): Promise<{ x: number; y: number }> {
        if (transform === "none") {
            return { x: 0, y: 0 };
        }

        // Parse matrix3d/matrix values to extract translateX/Y
        const match = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
        if (!match) {
            return { x: 0, y: 0 };
        }

        const values = match[1].split(",").map(v => parseFloat(v.trim()));

        if (values.length === 16) {
            // matrix3d: translateX = values[12], translateY = values[13]
            return { x: values[12], y: values[13] };
        } else if (values.length === 6) {
            // matrix: translateX = values[4], translateY = values[5]
            return { x: values[4], y: values[5] };
        }

        return { x: 0, y: 0 };
    }

    async function setupDrawer(page: Page, direction: string, duration = "0.5s") {
        await page.setContent(`
            <style>
                vaul-drawer-content {
                    --vaul-drawer-duration: ${duration};
                }
            </style>
            <vaul-drawer direction="${direction}">
                <vaul-drawer-trigger>Open ${direction} drawer</vaul-drawer-trigger>
                <vaul-drawer-content>
                    <p>Content from ${direction}</p>
                </vaul-drawer-content>
            </vaul-drawer>
        `);
        await page.waitForTimeout(100);
        return {
            trigger: page.locator("vaul-drawer-trigger"),
            dialog: "vaul-drawer-content dialog",
        };
    }

    async function sampleAnimationProgress(page: Page, selector: string, intervals: number[]) {
        const samples: Array<{ time: number; position: { x: number; y: number } }> = [];

        for (const interval of intervals) {
            await page.waitForTimeout(interval);
            const transform = await getTransformValue(page, selector);
            const position = await parseTransformMatrix(transform);
            samples.push({ time: interval, position });
        }

        return samples;
    }

    function expectSampleDrawerPosition(
        samples: Array<{ time: number; position: { x: number; y: number } }>,
        compareFn: (posA: { x: number; y: number }, posB: { x: number; y: number }) => boolean
    ) {
        for (let i = 0; i < samples.length - 1; i++) {
            const current = samples[i];
            const next = samples[i + 1];
            expect(
                compareFn(current.position, next.position),
                `Position comparison failed: ${current.time}ms (${current.position.x}, ${current.position.y}) vs ${next.time}ms (${next.position.x}, ${next.position.y})`
            ).toBe(true);
        }
    }

    function expectDrawerAtRestPosition(position: { x: number; y: number }, tolerance = 1) {
        expect(Math.abs(position.x), `Drawer X should be at rest position, got ${position.x}`).toBeLessThan(tolerance);
        expect(Math.abs(position.y), `Drawer Y should be at rest position, got ${position.y}`).toBeLessThan(tolerance);
    }

    async function getDrawerDimensions(page: Page, selector: string) {
        return page.$eval(selector, el => {
            const rect = el.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        });
    }

    function expectDrawerNearOffScreen(
        position: { x: number; y: number },
        dimensions: { width: number; height: number },
        direction: string,
        tolerance = 50
    ) {
        switch (direction) {
            case "bottom":
                expect(
                    Math.abs(position.y - dimensions.height),
                    `Bottom drawer should start near height ${dimensions.height}, got Y: ${position.y}`
                ).toBeLessThan(tolerance);
                break;
            case "top":
                expect(
                    Math.abs(position.y + dimensions.height),
                    `Top drawer should start near -height ${-dimensions.height}, got Y: ${position.y}`
                ).toBeLessThan(tolerance);
                break;
            case "right":
                expect(
                    Math.abs(position.x - dimensions.width),
                    `Right drawer should start near width ${dimensions.width}, got X: ${position.x}`
                ).toBeLessThan(tolerance);
                break;
            case "left":
                expect(
                    Math.abs(position.x + dimensions.width),
                    `Left drawer should start near -width ${-dimensions.width}, got X: ${position.x}`
                ).toBeLessThan(tolerance);
                break;
        }
    }

    async function sampleBackdropOpacity(page: Page, selector: string, intervals: number[]) {
        const samples: Array<{ time: number; opacity: number }> = [];

        for (const interval of intervals) {
            await page.waitForTimeout(interval);
            const opacity = await page.$eval(selector, el => {
                const style = window.getComputedStyle(el, "::backdrop");
                return parseFloat(style.opacity) || 0;
            });
            samples.push({ time: interval, opacity });
        }

        return samples;
    }

    function expectSampleBackdropOpacity(
        samples: Array<{ time: number; opacity: number }>,
        compareFn: (opacityA: number, opacityB: number) => boolean
    ) {
        for (let i = 0; i < samples.length - 1; i++) {
            const current = samples[i];
            const next = samples[i + 1];
            expect(
                compareFn(current.opacity, next.opacity),
                `Opacity comparison failed: ${current.time}ms (${current.opacity}) vs ${next.time}ms (${next.opacity})`
            ).toBe(true);
        }
    }
});
