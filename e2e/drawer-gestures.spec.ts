import { test, expect, type Locator } from "@playwright/test";
import { createDrawer } from "./utils";
import type { Direction } from "../src/types";

// Basic dismissible behavior tests
test("should close drawer when clicking on backdrop", { tag: "@dismissible" }, async ({ page }) => {
    const { getDialogDescriber, openDrawer, clickOnBackdrop, waitDialogAnimation } = await createDrawer({ page });
    await openDrawer();

    await clickOnBackdrop();
    await waitDialogAnimation();

    const { open } = await getDialogDescriber();
    expect(open).toBe(false);
});

test("should close drawer when pressing ESC key", { tag: "@dismissible" }, async ({ page }) => {
    const { getDialogDescriber, openDrawer, waitDialogAnimation } = await createDrawer({ page });
    await openDrawer();

    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    const { open } = await getDialogDescriber();
    expect(open).toBe(false);
});

test("should not close when clicking on drawer content area", { tag: "@dismissible" }, async ({ page }) => {
    const { elements, getDialogDescriber, openDrawer } = await createDrawer({ page });
    await openDrawer();

    await elements.contentLabel.click();
    const checked = await elements.contentCheckbox.isChecked();
    expect(checked).toBe(true);

    const { open } = await getDialogDescriber();
    expect(open).toBe(true);
});

// Non-dismissible behavior tests
test("should NOT close drawer when clicking on backdrop", { tag: "@non-dismissible" }, async ({ page }) => {
    const { getDialogDescriber, openDrawer, clickOnBackdrop } = await createDrawer({
        page,
        dismissible: false,
        animationDuration: 100,
    });
    await openDrawer();

    await clickOnBackdrop();
    await page.waitForTimeout(100);

    const { open } = await getDialogDescriber();
    expect(open).toBe(true);
});

test("should NOT close drawer when pressing ESC key", { tag: "@non-dismissible" }, async ({ page }) => {
    const { getDialogDescriber, openDrawer } = await createDrawer({
        page,
        dismissible: false,
        animationDuration: 100,
    });
    await openDrawer();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);

    const { open } = await getDialogDescriber();
    expect(open).toBe(true);
});

test("should NOT close drawer on multiple ESC presses", { tag: "@non-dismissible" }, async ({ page }) => {
    const { getDialogDescriber, openDrawer, waitDialogAnimation } = await createDrawer({
        page,
        dismissible: false,
    });
    await openDrawer();

    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await waitDialogAnimation();

    const { open } = await getDialogDescriber();
    expect(open).toBe(true);
});

// Quick swipe dismiss tests
test(
    "should close when quick swipe down on bottom drawer",
    { tag: ["@drag-to-dismiss", "@quick-swipe", "@bottom"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("bottom"),
        });
        await openDrawer();

        // high velocity = 70 / 100 = 0.7 > 0.4, short distance = 70 / 400 = 0.175
        await performDrag({ delta: [0, 70], duration: 100 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    }
);

test(
    "should close when quick swipe up on top drawer",
    { tag: ["@drag-to-dismiss", "@quick-swipe", "@top"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("top"),
        });
        await openDrawer();

        // high velocity = 70 / 100 = 0.7 > 0.4, short distance = 70 / 400 = 0.175
        await performDrag({ delta: [0, -70], duration: 100 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    }
);

test(
    "should close when quick swipe left on left drawer",
    { tag: ["@drag-to-dismiss", "@quick-swipe", "@left"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("left"),
        });
        await openDrawer();

        // high velocity = 70 / 100 = 0.7 > 0.4, short distance = 70 / 400 = 0.175
        await performDrag({ delta: [-70, 0], duration: 100 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    }
);

test(
    "should close when quick swipe right on right drawer",
    { tag: ["@drag-to-dismiss", "@quick-swipe", "@right"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("right"),
        });
        await openDrawer();

        // high velocity = 70 / 100 = 0.7 > 0.4, short distance = 70 / 400 = 0.175
        await performDrag({ delta: [70, 0], duration: 100 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    }
);

// Long distance dismiss tests
test(
    "should close when dragged long distance on bottom drawer",
    { tag: ["@drag-to-dismiss", "@long-distance", "@bottom"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("bottom"),
        });
        await openDrawer();

        // low velocity = 160 / 800 = 0.2 < 0.4, long distance = 160 / 400 = 0.4 > 0.25
        await performDrag({ delta: [0, 160], duration: 800 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    }
);

test(
    "should close when dragged long distance on top drawer",
    { tag: ["@drag-to-dismiss", "@long-distance", "@top"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("top"),
        });
        await openDrawer();

        // low velocity = 160 / 800 = 0.2 < 0.4, long distance = 160 / 400 = 0.4 > 0.25
        await performDrag({ delta: [0, -160], duration: 800 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    }
);

test(
    "should close when dragged long distance on left drawer",
    { tag: ["@drag-to-dismiss", "@long-distance", "@left"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("left"),
        });
        await openDrawer();

        // low velocity = 160 / 800 = 0.2 < 0.4, long distance = 160 / 400 = 0.4 > 0.25
        await performDrag({ delta: [-160, 0], duration: 800 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    }
);

test(
    "should close when dragged long distance on right drawer",
    { tag: ["@drag-to-dismiss", "@long-distance", "@right"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("right"),
        });
        await openDrawer();

        // low velocity = 160 / 800 = 0.2 < 0.4, long distance = 160 / 400 = 0.4 > 0.25
        await performDrag({ delta: [160, 0], duration: 800 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(false);
    }
);

// Low velocity + short distance tests (should NOT dismiss)
test(
    "should NOT dismiss bottom drawer with low velocity and short distance",
    { tag: ["@drag-to-dismiss", "@bottom"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("bottom"),
        });
        await openDrawer();

        // low velocity = 50 / 250 = 0.2 < 0.4, short distance = 50 / 400 = 0.125 < 0.25
        await performDrag({ delta: [0, 50], duration: 250 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    }
);

test(
    "should NOT dismiss top drawer with low velocity and short distance",
    { tag: ["@drag-to-dismiss", "@top"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("top"),
        });
        await openDrawer();

        // low velocity = 50 / 250 = 0.2 < 0.4, short distance = 50 / 400 = 0.125 < 0.25
        await performDrag({ delta: [0, -50], duration: 250 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    }
);

test(
    "should NOT dismiss left drawer with low velocity and short distance",
    { tag: ["@drag-to-dismiss", "@left"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("left"),
        });
        await openDrawer();

        // low velocity = 50 / 250 = 0.2 < 0.4, short distance = 50 / 400 = 0.125 < 0.25
        await performDrag({ delta: [-50, 0], duration: 250 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    }
);

test(
    "should NOT dismiss right drawer with low velocity and short distance",
    { tag: ["@drag-to-dismiss", "@right"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("right"),
        });
        await openDrawer();

        // low velocity = 50 / 250 = 0.2 < 0.4, short distance = 50 / 400 = 0.125 < 0.25
        await performDrag({ delta: [50, 0], duration: 250 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    }
);

// Damping effect tests (overdrag in wrong direction)
test(
    "should apply damping when overdragging bottom drawer upward",
    { tag: ["@drag-to-dismiss", "@damping", "@bottom"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("bottom"),
        });
        await openDrawer();

        // Drag upward (wrong direction for bottom drawer) - should trigger overdrag dampening
        await performDrag({ delta: [0, -100], duration: 100 });

        const { open, transform } = await getDialogDescriber();
        expect(open).toBe(true); // Should remain open
        expect(transform).toBe("translate3d(0px, 0px, 0px)"); // Should reset to origin after overdrag
    }
);

test(
    "should apply damping when overdragging top drawer downward",
    { tag: ["@drag-to-dismiss", "@damping", "@top"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("top"),
        });
        await openDrawer();

        // Drag downward (wrong direction for top drawer) - should trigger overdrag dampening
        await performDrag({ delta: [0, 100], duration: 100 });

        const { open, transform } = await getDialogDescriber();
        expect(open).toBe(true); // Should remain open
        expect(transform).toBe("translate3d(0px, 0px, 0px)"); // Should reset to origin after overdrag
    }
);

test(
    "should apply damping when overdragging left drawer rightward",
    { tag: ["@drag-to-dismiss", "@damping", "@left"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("left"),
        });
        await openDrawer();

        // Drag rightward (wrong direction for left drawer) - should trigger overdrag dampening
        await performDrag({ delta: [100, 0], duration: 100 });

        const { open, transform } = await getDialogDescriber();
        expect(open).toBe(true); // Should remain open
        expect(transform).toBe("translate3d(0px, 0px, 0px)"); // Should reset to origin after overdrag
    }
);

test(
    "should apply damping when overdragging right drawer leftward",
    { tag: ["@drag-to-dismiss", "@damping", "@right"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("right"),
        });
        await openDrawer();

        // Drag leftward (wrong direction for right drawer) - should trigger overdrag dampening
        await performDrag({ delta: [-100, 0], duration: 100 });

        const { open, transform } = await getDialogDescriber();
        expect(open).toBe(true); // Should remain open
        expect(transform).toBe("translate3d(0px, 0px, 0px)"); // Should reset to origin after overdrag
    }
);

// Custom threshold tests
test(
    "should respect custom velocity threshold",
    { tag: ["@drag-to-dismiss", "@custom-thresholds", "@bottom"] },
    async ({ page }) => {
        const customTemplate = `
    <vaul-drawer direction="bottom" velocity-threshold="1">
        <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
        <vaul-drawer-content style="--vaul-drawer-duration: 100ms;">
            <div style="height: 400px; width: 100%; background: #1989;">Custom Velocity Threshold</div>
        </vaul-drawer-content>
    </vaul-drawer>
    `;

        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: customTemplate,
        });
        await openDrawer();

        // velocity = 60 / 100 = 0.6 < 1 (custom threshold), should NOT dismiss
        await performDrag({ delta: [0, 70], duration: 100 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    }
);

test(
    "should respect custom close threshold",
    { tag: ["@drag-to-dismiss", "@custom-thresholds", "@bottom"] },
    async ({ page }) => {
        const customTemplate = `
    <vaul-drawer direction="bottom" close-threshold="0.5">
        <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
        <vaul-drawer-content style="--vaul-drawer-duration: 100ms;">
            <div style="height: 400px; width: 100%; background: #1989;">Custom Close Threshold</div>
        </vaul-drawer-content>
    </vaul-drawer>
    `;

        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: customTemplate,
        });
        await openDrawer();

        // distance = 160 / 400 = 0.4 < 0.5 (custom threshold), should NOT dismiss
        await performDrag({ delta: [0, 160], duration: 800 });

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    }
);

test(
    "should not dismiss drawer with dismissable=false",
    { tag: ["@non-dismissible", "@drag-to-dismiss", "@bottom"] },
    async ({ page }) => {
        const customTemplate = `
    <vaul-drawer direction="bottom" dismissible="false">
        <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
        <vaul-drawer-content style="--vaul-drawer-duration: 100ms;">
            <div style="height: 400px; width: 100%; background: #1989;">Custom Velocity Threshold</div>
        </vaul-drawer-content>
    </vaul-drawer>
    `;

        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: customTemplate,
        });
        await openDrawer();

        // velocity = 60 / 100 = 0.6 > 0.25, should dismiss but with dismissable=false, we should NOT dismiss
        await performDrag({ delta: [0, 70], duration: 100 });

        const { open, transform } = await getDialogDescriber();
        expect(open).toBe(true);
        expect(transform).toBe("translate3d(0px, 0px, 0px)"); // Should reset to origin after overdrag
    }
);

test(
    "should disable drag when there are highlighted text elements",
    { tag: ["@drag-to-dismiss", "@edge-cases", "@bottom"] },
    async ({ page }) => {
        const { getDialogDescriber, openDrawer, performDrag } = await createDrawer({
            page,
            animationDuration: 100,
            template: getDragToDismissDrawer("bottom"),
        });
        await openDrawer();
        const selection = await selectText(page.getByTestId("hello_world"));
        expect(selection.length).toBeGreaterThan(0);

        await performDrag({
            delta: [0, 100],
            duration: 100,
            beforeDialogAnimation: async () => {
                const { transform } = await getDialogDescriber();
                expect(transform).toBe("translate3d(0px, 0px, 0px)");
            },
        });

        const { open } = await getDialogDescriber();
        expect(open).toBe(true);
    }
);

// Helper function for drag tests
function getDragToDismissDrawer(direction: Direction) {
    const isVertical = direction === "bottom" || direction === "top";
    const dimension = isVertical ? "height: 400px; width: 100%;" : "width: 400px; height: 100%;";
    return `
    <vaul-drawer direction="${direction}">
        <vaul-drawer-trigger>Open drawer</vaul-drawer-trigger>
        <vaul-drawer-content style="--vaul-drawer-duration: 100ms;">
            <div style="${dimension} background: #1989;" data-testid="hello_world">Hello Web Component Drawer!</div>
        </vaul-drawer-content>
    </vaul-drawer>
`;
}

function selectText(target: Locator) {
    return target.evaluate(el => {
        el.style.userSelect = "text";
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        return window.getSelection()?.toString() ?? "";
    });
}
