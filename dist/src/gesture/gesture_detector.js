"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pointer_router_1 = require("./pointer_router");
const gesture_arena_1 = require("./gesture_arena");
class GestureDetector {
    constructor(el, recognizers) {
        this.router = new pointer_router_1.PointerRouter();
        this.manager = new gesture_arena_1.GestureArenaManager();
        this.recognizers = recognizers;
        this.el = el;
        this.init();
    }
    init() {
        this._bindRecognizers();
        this._bindEvents();
    }
    _bindRecognizers() {
        this.recognizers.forEach((recognizer) => {
            recognizer.bindDetector(this);
        });
    }
    _bindEvents() {
        this.el.addEventListener('touchstart', this._touchEventHandler, false);
        this.el.addEventListener('touchmove', this._touchEventHandler, { passive: false, capture: false });
        this.el.addEventListener('touchend', this._touchEventHandler, false);
        this.el.addEventListener('touchcancel', this._touchEventHandler, false);
    }
    _touchEventHandler(event) {
        let events = pointer_router_1.PointerEvent.covenrtTouchEventToPointerEvent(event);
        events.forEach((event) => {
            this._internalEventHandler(event);
        });
    }
    _internalEventHandler(event) {
        this.router.route(event);
        if (event.type == pointer_router_1.PointerType.POINTER_DOWN) {
            this.recognizers.forEach((recognizer) => recognizer.addPointer(event));
            this.manager.close(event.identifier);
        }
        else if (event.type == pointer_router_1.PointerType.POINTER_UP) {
            this.manager.sweep(event.identifier);
        }
    }
    dispose() {
        this.el.removeEventListener('touchstart', this._touchEventHandler);
        this.el.removeEventListener('touchmove', this._touchEventHandler);
        this.el.removeEventListener('touchend', this._touchEventHandler);
        this.el.removeEventListener('touchcancel', this._touchEventHandler);
    }
}
exports.GestureDetector = GestureDetector;
//# sourceMappingURL=gesture_detector.js.map