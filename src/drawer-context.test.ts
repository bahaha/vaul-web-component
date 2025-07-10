import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VaulDrawer, VaulDrawerPortal, setLogger, noopLogger } from "./index";

setLogger(noopLogger);

describe("drawer-context", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it("should find and cache dialog reference from vaul-drawer-portal", async () => {
        container.innerHTML = `
            <vaul-drawer>
                <vaul-drawer-portal></vaul-drawer-portal>
            </vaul-drawer>
        `;

        await new Promise(resolve => setTimeout(resolve, 0));

        const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
        const dialogRef = drawer.dialogRef;
        expect(dialogRef).toBeInstanceOf(HTMLDialogElement);
    });
});
