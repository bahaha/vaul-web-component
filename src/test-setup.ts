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

// PointerEvent polyfill for JSDOM based on https://github.com/jsdom/jsdom/issues/2527
if (!globalThis.PointerEvent) {
    globalThis.PointerEvent = class PointerEvent extends MouseEvent {
        pointerId: number;
        width: number;
        height: number;
        pressure: number;
        tangentialPressure: number;
        tiltX: number;
        tiltY: number;
        twist: number;
        pointerType: string;
        isPrimary: boolean;

        constructor(type: string, eventInitDict: any = {}) {
            // Pass through all MouseEvent properties including pageX, pageY
            super(type, {
                bubbles: eventInitDict.bubbles,
                cancelable: eventInitDict.cancelable,
                view: eventInitDict.view,
                detail: eventInitDict.detail,
                screenX: eventInitDict.screenX,
                screenY: eventInitDict.screenY,
                clientX: eventInitDict.clientX,
                clientY: eventInitDict.clientY,
                ctrlKey: eventInitDict.ctrlKey,
                altKey: eventInitDict.altKey,
                shiftKey: eventInitDict.shiftKey,
                metaKey: eventInitDict.metaKey,
                button: eventInitDict.button,
                buttons: eventInitDict.buttons,
                relatedTarget: eventInitDict.relatedTarget,
            });

            // Set PointerEvent-specific properties
            this.pointerId = eventInitDict.pointerId ?? 0;
            this.width = eventInitDict.width ?? 1;
            this.height = eventInitDict.height ?? 1;
            this.pressure = eventInitDict.pressure ?? 0;
            this.tangentialPressure = eventInitDict.tangentialPressure ?? 0;
            this.tiltX = eventInitDict.tiltX ?? 0;
            this.tiltY = eventInitDict.tiltY ?? 0;
            this.twist = eventInitDict.twist ?? 0;
            this.pointerType = eventInitDict.pointerType ?? "mouse";
            this.isPrimary = eventInitDict.isPrimary ?? false;

            // Manually set pageX and pageY since MouseEvent constructor doesn't handle them properly in JSDOM
            if (eventInitDict.pageX !== undefined) {
                Object.defineProperty(this, "pageX", { value: eventInitDict.pageX, writable: false });
            }
            if (eventInitDict.pageY !== undefined) {
                Object.defineProperty(this, "pageY", { value: eventInitDict.pageY, writable: false });
            }
        }
    } as any;
}

// Mock setPointerCapture and releasePointerCapture
HTMLElement.prototype.setPointerCapture = HTMLElement.prototype.setPointerCapture || function () {};
HTMLElement.prototype.releasePointerCapture = HTMLElement.prototype.releasePointerCapture || function () {};

// Helper for creating animation events in JSDOM
export const createAnimationEvent = (type: string, animationName: string) => {
    const event = new Event(type);
    Object.assign(event, { animationName });
    return event;
};
