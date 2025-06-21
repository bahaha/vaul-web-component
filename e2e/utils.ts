import { expect, type Locator, type Page } from "@playwright/test";

type BaseCreateDrawerOptions = { page: Page };

type SimpleDrawer = BaseCreateDrawerOptions & {
    direction?: "top" | "bottom" | "left" | "right" | (string & {});
    dismissible?: boolean;
    animationDuration?: number;
};

type FlexibleDrawer = BaseCreateDrawerOptions & {
    template: string;
};

type CreateDrawerOptions = SimpleDrawer | FlexibleDrawer;

export async function createDrawer(options: CreateDrawerOptions) {
    const { page } = options;
    const template = isFlexibleDrawer(options) ? options.template : getVaulDrawerTemplate(options);
    await page.setContent(template);
    await page.waitForTimeout(100);

    const trigger = page.locator("vaul-drawer-trigger");
    const dialogSelector = "vaul-drawer-content dialog";
    const direction = (await page.locator("vaul-drawer").getAttribute("direction")) ?? "bottom";
    const dialog = page.locator(dialogSelector);

    const waitDialogAnimation = async () => {
        await waitForAnimation(dialog, isFlexibleDrawer(options) ? undefined : options.animationDuration ?? 100);
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

    return {
        elements: {
            trigger,
            contentCheckbox: page.getByTestId("drawer__content_checkbox"),
            contentLabel: page.getByTestId("drawer__content_label"),
        },
        getDialogDescriber,
        openDrawer,
        clickOnBackdrop,
        waitDialogAnimation,
    };
}

function isFlexibleDrawer(options: CreateDrawerOptions): options is FlexibleDrawer {
    return options && "template" in options;
}

function getVaulDrawerTemplate({ direction = "bottom", dismissible = true, animationDuration = 100 }: SimpleDrawer) {
    return `
        <vaul-drawer direction=${direction} dismissible=${dismissible}>
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
