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
            it("should auto-initialize handle for bottom drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector(".drawer-handle");

                expect(handle?.getAttribute("data-show")).toBe("true");
            });

            it("should auto-initialize handle for top drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="top">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("true");
            });

            it("should NOT show handle for left drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="left">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");
            });

            it("should NOT show handle for right drawer", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="right">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");
            });
        });

        describe("Direction Change Behavior", () => {
            it("should show handle when changing from bottom to top", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                let handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("true");
                drawer.setAttribute("direction", "top");
                await new Promise(resolve => setTimeout(resolve, 0));

                handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("true");
            });

            it("should hide handle when changing from vertical to horizontal", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                let handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("true");

                drawer.setAttribute("direction", "left");
                await new Promise(resolve => setTimeout(resolve, 0));

                handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");
            });

            it("should show handle when changing from horizontal to vertical", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="left">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const drawer = container.querySelector("vaul-drawer") as VaulDrawer;
                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                let handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");

                drawer.setAttribute("direction", "bottom");
                await new Promise(resolve => setTimeout(resolve, 0));

                handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("true");
            });
        });
    });

    describe('show-handle="false" Override Logic', () => {
        describe("Attribute Control", () => {
            it('should prevent handle display when show-handle="false" on vertical drawer', async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal show-handle="false">
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const handle = content.shadowRoot?.querySelector(".drawer-handle");

                expect(handle?.getAttribute("data-show")).toBe("false");
            });

            it('should hide handle when changed to show-handle="false"', async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                let handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("true");

                content.setAttribute("show-handle", "false");
                await new Promise(resolve => setTimeout(resolve, 0));

                handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");
            });

            it('should show handle when changed back to show-handle="true"', async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal show-handle="false">
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                let handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");

                content.setAttribute("show-handle", "true");
                await new Promise(resolve => setTimeout(resolve, 0));

                handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("true");
            });

            it("should have no effect on horizontal drawers (already no handle)", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="left">
                        <vaul-drawer-portal>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;

                let handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");

                content.setAttribute("show-handle", "false");
                await new Promise(resolve => setTimeout(resolve, 0));
                handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");

                content.setAttribute("show-handle", "true");
                await new Promise(resolve => setTimeout(resolve, 0));
                handle = content.shadowRoot?.querySelector(".drawer-handle");
                expect(handle?.getAttribute("data-show")).toBe("false");
            });
        });
    });

    describe("Custom Handle Override Logic", () => {
        describe("Custom Handle Detection", () => {
            it("should hide built-in handle when custom handle exists", async () => {
                container.innerHTML = `
                    <vaul-drawer direction="bottom">
                        <vaul-drawer-portal>
                            <vaul-drawer-handle>Custom Handle</vaul-drawer-handle>
                            <vaul-drawer-content>Content</vaul-drawer-content>
                        </vaul-drawer-portal>
                    </vaul-drawer>
                `;

                await new Promise(resolve => setTimeout(resolve, 0));

                const content = container.querySelector("vaul-drawer-portal") as VaulDrawerPortal;
                const builtInHandle = content.shadowRoot?.querySelector(".drawer-handle");
                const customHandle = content.querySelector("vaul-drawer-handle");

                expect(builtInHandle?.getAttribute("data-show")).toBe("false");
                expect(customHandle).toBeTruthy();
            });

            it("should hide built-in handle with multiple custom handles", async () => {
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
                const builtInHandle = content.shadowRoot?.querySelector(".drawer-handle");
                const customHandles = content.querySelectorAll("vaul-drawer-handle");

                expect(builtInHandle?.getAttribute("data-show")).toBe("false");
                expect(customHandles.length).toBe(2);
            });
        });
    });
});
