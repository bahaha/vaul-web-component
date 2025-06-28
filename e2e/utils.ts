import { expect, type Locator, type Page } from "@playwright/test";

type BaseCreateDrawerOptions = { page: Page; animationDuration?: number };

type SimpleDrawer = BaseCreateDrawerOptions & {
    direction?: "top" | "bottom" | "left" | "right" | (string & {});
    dismissible?: boolean;
};

type FlexibleDrawer = BaseCreateDrawerOptions & {
    template: string;
};

type CreateDrawerOptions = SimpleDrawer | FlexibleDrawer;

export async function createDrawer(options: CreateDrawerOptions) {
    const { page } = options;
    const template = isFlexibleDrawer(options) ? options.template : getVaulDrawerTemplate(options);

    // Set content first - establish DOM structure
    await page.setContent(template);

    // Then load script - components register after DOM is ready
    await page.addScriptTag({ path: "./dist/vaul-web-component.esm.js", type: "module" });

    await page.waitForTimeout(100);

    const trigger = page.locator("vaul-drawer-trigger");
    const content = page.locator("vaul-drawer-content");
    const handle = content.locator("vaul-drawer-handle");
    const dialogSelector = "vaul-drawer-content dialog";
    const direction = (await page.locator("vaul-drawer").getAttribute("direction")) ?? "bottom";
    const dialog = page.locator(dialogSelector);

    const waitDialogAnimation = async () => {
        await waitForAnimation(dialog, options.animationDuration ?? 100);
        // add short delay to ensure browser sync the dialog attributes
        await page.waitForTimeout(50);
    };

    const getDialogDescriber = () =>
        dialog.evaluate((el: HTMLDialogElement) => {
            const styles = window.getComputedStyle(el);
            const backdropStyles = window.getComputedStyle(el, "::backdrop");
            return {
                open: el.open,
                dataset: el.dataset,
                animation: {
                    name: styles.animationName,
                    duration: styles.animationDuration,
                },
                transform: el.style.transform,
                margin: {
                    left: styles.marginLeft,
                    right: styles.marginRight,
                    top: styles.marginTop,
                    bottom: styles.marginBottom,
                },
                backdrop: {
                    animation: { name: backdropStyles.animationName },
                },
            };
        });
    const openDrawer = async () => {
        await trigger.click();
        await waitDialogAnimation();
        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    };

    const clickOnBackdrop = async () => {
        const size = page.viewportSize();
        if (!size) return;
        const offset = 10;
        if (direction === "top") {
            await page.mouse.click(offset, size.height - offset);
        } else if (direction === "bottom") {
            await page.mouse.click(offset, offset);
        } else if (direction === "left") {
            await page.mouse.click(size.width - offset, offset);
        } else if (direction === "right") {
            await page.mouse.click(offset, offset);
        }
    };

    const performDrag = async (options: { delta: [number, number]; duration?: number }) => {
        const dialogBox = await dialog.boundingBox();
        if (!dialogBox) return;

        const { x, y, width, height } = dialogBox;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const { delta, duration = 300 } = options;
        const [deltaX, deltaY] = delta;

        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await page.mouse.move(centerX + deltaX, centerY + deltaY);
        await page.waitForTimeout(duration);
        await page.mouse.up();
        await waitDialogAnimation();
    };

    return {
        elements: {
            trigger,
            content,
            handle,
            contentCheckbox: page.getByTestId("drawer__content_checkbox"),
            contentLabel: page.getByTestId("drawer__content_label"),
        },
        getDialogDescriber,
        openDrawer,
        clickOnBackdrop,
        waitDialogAnimation,
        performDrag,
    };
}

function isFlexibleDrawer(options: CreateDrawerOptions): options is FlexibleDrawer {
    return options && "template" in options;
}

function getVaulDrawerTemplate({ direction = "bottom", dismissible = true, animationDuration = 100 }: SimpleDrawer) {
    return `
        <vaul-drawer direction="${direction}" dismissible="${dismissible}">
            <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
            <vaul-drawer-content style="--vaul-drawer-duration: ${animationDuration}ms;">
                <div>Hello Web Component Drawer!</div>
                <label>
                    <input name="checkbox" type="checkbox" data-testid="drawer__content_checkbox">
                    <span data-testid="drawer__content_label">checkbox will be checked if label clicks</span>
                </label>
            </vaul-drawer-content>
        </vaul-drawer>
    `;
}

export async function waitForAnimation(dialog: Locator, timeoutMS?: number) {
    return dialog.evaluate(
        (el, timeout) =>
            Promise.race([
                ...(timeout !== undefined
                    ? [
                          new Promise<void>(resolve => {
                              setTimeout(resolve, timeout);
                          }),
                      ]
                    : []),
                new Promise<void>(resolve => {
                    const onEnd = () => {
                        el.removeEventListener("animationend", onEnd);
                        resolve();
                    };
                    el.addEventListener("animationend", onEnd);
                }),
            ]),
        timeoutMS
    );
}
