import { test, expect, type Page } from "@playwright/test";

type DialogStyles = {
    margin: { left: string; right: string; top: string; bottom: string };
};

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "./dist/vaul-web-component.esm.js", type: "module" });
});

test.describe("Drawer Direction Functionality", () => {
    async function getDialogStyles(page: Page) {
        const dialogStyles = await page.evaluate(() => {
            const drawer = document.querySelector("vaul-drawer") as any;
            const dialog = drawer?.dialogRef as HTMLDialogElement;
            if (!dialog) return null;

            const styles = window.getComputedStyle(dialog);
            return {
                margin: {
                    left: styles.marginLeft,
                    right: styles.marginRight,
                    top: styles.marginTop,
                    bottom: styles.marginBottom,
                },
            };
        });

        expect(dialogStyles).not.toBeNull();
        return dialogStyles!;
    }

    async function openDrawer(
        page: Page,
        templ: string,
        assertions: (context: { getDialogStyles: () => Promise<DialogStyles> }) => Promise<void>
    ) {
        await page.setContent(templ);
        await page.waitForTimeout(100);

        const trigger = page.locator("vaul-drawer-trigger");
        await trigger.click();

        await assertions({ getDialogStyles: () => getDialogStyles(page) });

        await page.keyboard.press("Escape");
        await page.waitForTimeout(100);
    }

    test("should position drawer from correct edge when opened", async ({ page }) => {
        const args = [
            {
                direction: "top",
                spaceDirection: "bottom",
            },
            {
                direction: "bottom",
                spaceDirection: "top",
            },
            {
                direction: "left",
                spaceDirection: "right",
            },
            {
                direction: "right",
                spaceDirection: "left",
            },
        ];

        for (const { direction, spaceDirection } of args) {
            await openDrawer(
                page,
                `
                <vaul-drawer direction="${direction}">
                    <vaul-drawer-trigger>Open ${direction} drawer</vaul-drawer-trigger>
                    <vaul-drawer-content>
                        <p>Content from ${direction}</p>
                    </vaul-drawer-content>
                </vaul-drawer>
                `,
                async ({ getDialogStyles }) => {
                    const { margin } = await getDialogStyles();
                    for (const [dir, value] of Object.entries(margin)) {
                        if (dir === spaceDirection) {
                            expect(value, `margin-${dir} should not be 0 for direction "${direction}"`).not.toBe("0px");
                        } else {
                            expect(value, `margin-${dir} should be 0 for direction "${direction}"`).toBe("0px");
                        }
                    }
                }
            );
        }
    });

    test("should handle invalid direction values gracefully", async ({ page }) => {
        await openDrawer(
            page,
            `
            <vaul-drawer direction="unknown">
                <vaul-drawer-trigger>Open unknown drawer (fallback to bottom)</vaul-drawer-trigger>
                <vaul-drawer-content>
                    <p>Content from bottom as fallback</p>
                </vaul-drawer-content>
            </vaul-drawer>
            `,
            async ({ getDialogStyles }) => {
                const { margin } = await getDialogStyles();
                expect(margin.top).not.toBe("0px");
                expect(margin.bottom).toBe("0px");
                expect(margin.left).toBe("0px");
                expect(margin.right).toBe("0px");
            }
        );
    });

    test("should maintain direction state across multiple opens/closes", async ({ page }) => {
        await page.setContent(`
            <vaul-drawer direction="bottom">
                <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
                <vaul-drawer-content>
                    <p>Drawer Content</p>
                </vaul-drawer-content>
            </vaul-drawer>
        `);
        await page.waitForTimeout(100);

        for (let i = 0; i < 3; i++) {
            const trigger = page.locator("vaul-drawer-trigger");
            await trigger.click();

            const { margin } = await getDialogStyles(page);
            expect(margin.top).not.toBe("0px");
            expect(margin.bottom).toBe("0px");
            expect(margin.left).toBe("0px");
            expect(margin.right).toBe("0px");

            await page.keyboard.press("Escape");
            await page.waitForTimeout(100);
        }
    });
});
