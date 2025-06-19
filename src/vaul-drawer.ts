export class VaulDrawer extends HTMLElement {
    connectedCallback() {
        this.textContent = "Hello World - Vaul Drawer";
    }
}

customElements.define("vaul-drawer", VaulDrawer);
