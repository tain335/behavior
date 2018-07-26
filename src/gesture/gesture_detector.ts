import { PointerRouter, PointerEvent, PointerType } from "./pointer_router";
import { GestureArenaManager } from "./gesture_arena";
import { GestureRecognizer } from "./gesture_recognizer";

//import { GestureRecognizer } from './gesture_recognizer';

export class GestureDetector {

    el: HTMLElement;

    router: PointerRouter;

    manager: GestureArenaManager;

    recognizers: GestureRecognizer[];

    _internalTouchEventHandler: any;

    constructor(el: HTMLElement, recognizers: GestureRecognizer[]) {
        this.router = new PointerRouter();
        this.manager = new GestureArenaManager();
        this.recognizers = recognizers;
        this.el = el;
        this.init();
        
    }

    init() {
        this._bindRecognizers();
        this._bindEvents();
    }

    _bindRecognizers() {
        this.recognizers.forEach((recognizer: GestureRecognizer)=> {
            recognizer.bindDetector(this);
        });
    }

    _bindEvents() {
        this._internalTouchEventHandler = this._touchEventHandler.bind(this);
        this.el.addEventListener('touchstart', this._internalTouchEventHandler, false);
        this.el.addEventListener('touchmove', this._internalTouchEventHandler, {passive: false, capture: false});
        this.el.addEventListener('touchend', this._internalTouchEventHandler, false);
        this.el.addEventListener('touchcancel', this._internalTouchEventHandler, false);
    }

    _touchEventHandler(event: TouchEvent) {
        let events = PointerEvent.covenrtTouchEventToPointerEvent(event);
        events.forEach((event: PointerEvent)=> {
            this._internalEventHandler(event);
        });
    }

    _internalEventHandler(event: PointerEvent) {
        this.router.route(event);
        if(event.type == PointerType.POINTER_DOWN) {
            this.recognizers.forEach((recognizer)=> recognizer.addPointer(event));

            this.manager.close(event.identifier);
        } else if(event.type == PointerType.POINTER_UP) {
            this.manager.sweep(event.identifier);
        }
    }

    dispose() {
        this.el.removeEventListener('touchstart', this._internalTouchEventHandler);
        this.el.removeEventListener('touchmove', this._internalTouchEventHandler);
        this.el.removeEventListener('touchend', this._internalTouchEventHandler);
        this.el.removeEventListener('touchcancel', this._internalTouchEventHandler);
    }
}