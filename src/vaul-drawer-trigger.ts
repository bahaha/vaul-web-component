export class VaulDrawerTrigger extends HTMLElement {
    connectedCallback() {
        this.textContent = "Hello World - Vaul Trigger";
    }
}

customElements.define("vaul-drawer-trigger", VaulDrawerTrigger);
