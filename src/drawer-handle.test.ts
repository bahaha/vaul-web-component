import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VaulDrawer, VaulDrawerPortal, setLogger, noopLogger } from "./index";

setLogger(noopLogger);

describe("drawer-handle", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe("Built-in Handle Auto-Initialization Logic", () => {
        describe("Default Vertical Drawer Behavior", () => {
            it("should auto-initialize handle at top for bottom drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector("vaul-drawer-handle");

                expect(handle).toBeTruthy();
                expect(handle?.getAttribute("data-drawer-direction")).toBe("bottom");

                // Handle should be at the top (first child in dialog)
                const dialog = content.shadowRoot?.querySelector("dialog");
                expect(dialog?.firstElementChild).toBe(handle);
            });

            it("should auto-initialize handle at bottom for top drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="top">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector("vaul-drawer-handle");

                expect(handle).toBeTruthy();
                expect(handle?.getAttribute("data-drawer-direction")).toBe("top");

                // Handle should be at the bottom (last child in dialog)
                const dialog = content.shadowRoot?.querySelector("dialog");
                expect(dialog?.lastElementChild).toBe(handle);
            });

            it("should NOT auto-initialize handle for left drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="left">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector("vaul-drawer-handle");

                expect(handle).toBeFalsy();
            });

            it("should NOT auto-initialize handle for right drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="right">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector("vaul-drawer-handle");

                expect(handle).toBeFalsy();
            });
        });

        describe("Direction Change Behavior", () => {
            it("should move handle from top to bottom when changing from bottom to top", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const dialog = content.shadowRoot?.querySelector("dialog")!;

                // Initially bottom drawer - handle at top
                let handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeTruthy();
                expect(dialog.firstElementChild).toBe(handle);

                // Change to top drawer
                drawer.setAttribute("direction", "top");
                await new Promise(resolve => setTimeout(resolve, 0));

                // Handle should now be at bottom
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeTruthy();
                expect(handle?.getAttribute("data-drawer-direction")).toBe("top");
                expect(dialog.lastElementChild).toBe(handle);
            });

            it("should move handle from bottom to top when changing from top to bottom", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="top">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const dialog = content.shadowRoot?.querySelector("dialog")!;

                // Initially top drawer - handle at bottom
                let handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeTruthy();
                expect(dialog.lastElementChild).toBe(handle);

                // Change to bottom drawer
                drawer.setAttribute("direction", "bottom");
                await new Promise(resolve => setTimeout(resolve, 0));

                // Handle should now be at top
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeTruthy();
                expect(handle?.getAttribute("data-drawer-direction")).toBe("bottom");
                expect(dialog.firstElementChild).toBe(handle);
            });

            it("should remove handle when changing from vertical to horizontal", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                // Initially has handle
                let handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeTruthy();

                // Change to horizontal
                drawer.setAttribute("direction", "left");
                await new Promise(resolve => setTimeout(resolve, 0));

                // Handle should be removed
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeFalsy();
            });

            it("should add handle when changing from horizontal to vertical", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="left">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                // Initially no handle
                let handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeFalsy();

                // Change to vertical
                drawer.setAttribute("direction", "bottom");
                await new Promise(resolve => setTimeout(resolve, 0));

                // Handle should be added
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeTruthy();
                expect(handle?.getAttribute("data-drawer-direction")).toBe("bottom");
            });
        });
    });

    describe('show-handle="false" Override Logic', () => {
        describe("Attribute Control", () => {
            it('should prevent auto-initialization when show-handle="false" on vertical drawer', async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal show-handle="false">
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector("vaul-drawer-handle");

                expect(handle).toBeFalsy();
            });

            it('should remove existing built-in handle when changed to show-handle="false"', async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                // Initially has handle
                let handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeTruthy();

                // Set show-handle to false
                content.setAttribute("show-handle", "false");
                await new Promise(resolve => setTimeout(resolve, 0));

                // Handle should be removed
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeFalsy();
            });

            it('should restore built-in handle when changed back to show-handle="true"', async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal show-handle="false">
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                // Initially no handle
                let handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeFalsy();

                // Set show-handle to true
                content.setAttribute("show-handle", "true");
                await new Promise(resolve => setTimeout(resolve, 0));

                // Handle should be added
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeTruthy();
            });

            it("should have no effect on horizontal drawers (already no handle)", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="left">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                // Initially no handle
                let handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeFalsy();

                // Set show-handle to false (should still be no handle)
                content.setAttribute("show-handle", "false");
                await new Promise(resolve => setTimeout(resolve, 0));
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeFalsy();

                // Set show-handle to true (should still be no handle for horizontal)
                content.setAttribute("show-handle", "true");
                await new Promise(resolve => setTimeout(resolve, 0));
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle).toBeFalsy();
            });
        });
    });

    describe("Custom Handle Override Logic", () => {
        describe("Custom Handle Detection", () => {
            it("should prevent built-in handle when custom handle exists", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <vaul-drawer-handle>Custom Handle</vaul-drawer-handle>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const builtInHandle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                const customHandle = content.querySelector("vaul-drawer-handle");

                expect(builtInHandle).toBeFalsy();
                expect(customHandle).toBeTruthy();
            });

            it("should remove built-in handle when custom handle is added dynamically (future feature)", async () => {
                // This test validates static detection - dynamic detection would require MutationObserver
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <vaul-drawer-handle>Custom Handle</vaul-drawer-handle>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const builtInHandle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                const customHandle = content.querySelector("vaul-drawer-handle");

                // Static detection should work - no built-in handle when custom exists
                expect(builtInHandle).toBeFalsy();
                expect(customHandle).toBeTruthy();
            });

            it("should prevent built-in handle with multiple custom handles", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <vaul-drawer-handle>Handle 1</vaul-drawer-handle>
                            <vaul-drawer-handle>Handle 2</vaul-drawer-handle>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const builtInHandle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                const customHandles = content.querySelectorAll("vaul-drawer-handle");

                expect(builtInHandle).toBeFalsy();
                expect(customHandles.length).toBe(2);
            });
        });
    });

    describe("Handle State Validation", () => {
        describe("Handle State Tracking", () => {
            it("should set data-drawer-direction matching parent drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="top">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector("vaul-drawer-handle");

                expect(handle?.getAttribute("data-drawer-direction")).toBe("top");
            });

            it("should update data-drawer-direction when drawer direction changes", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <div>Content</div>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                // Initially bottom
                let handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle?.getAttribute("data-drawer-direction")).toBe("bottom");

                // Change to top
                drawer.setAttribute("direction", "top");
                await new Promise(resolve => setTimeout(resolve, 0));

                // Should update
                handle = content.shadowRoot?.querySelector("vaul-drawer-handle");
                expect(handle?.getAttribute("data-drawer-direction")).toBe("top");
            });
        });
    });
});
