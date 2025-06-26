// Polyfill for HTMLDialogElement methods in JSDOM
if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
    };
}

if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function (returnValue?: string) {
        this.open = false;
        this.returnValue = returnValue ?? "";
    };
}

// Mock window.scrollTo for JSDOM
Object.defineProperty(window, "scrollTo", {
    value: () => {},
    writable: true,
});

// Helper for creating animation events in JSDOM
export const createAnimationEvent = (type: string, animationName: string) => {
    const event = new Event(type);
    Object.assign(event, { animationName });
    return event;
};
