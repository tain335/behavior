"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PointerType;
(function (PointerType) {
    PointerType[PointerType["POINTER_DOWN"] = 0] = "POINTER_DOWN";
    PointerType[PointerType["POINTER_MOVE"] = 1] = "POINTER_MOVE";
    PointerType[PointerType["POINTER_UP"] = 2] = "POINTER_UP";
    PointerType[PointerType["POINTER_CANCEL"] = 3] = "POINTER_CANCEL";
})(PointerType = exports.PointerType || (exports.PointerType = {}));
class PointerEvent {
    constructor(opts) {
        this.identifier = opts.identifier;
        this.pageX = opts.pageX;
        this.pageY = opts.pageY;
        this.screenX = opts.screenX;
        this.screenY = opts.screenY;
        this.clientX = opts.clientX;
        this.clientY = opts.clientY;
        this.type = opts.type;
        this.sourceEvent = opts.sourceEvent;
    }
    static covenrtTouchEventToPointerEvent(event) {
        let events = [];
        for (let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            events.push(new PointerEvent({
                identifier: touch.identifier,
                pageX: touch.pageX,
                pageY: touch.pageY,
                screenX: touch.screenX,
                screenY: touch.screenY,
                clientX: touch.clientX,
                clientY: touch.clientY,
                type: PointerEvent.getPointerTypeFromTouchEvent(event),
                sourceEvent: event
            }));
        }
        return events;
    }
    static getPointerTypeFromTouchEvent(event) {
        let type;
        switch (event.type) {
            case 'touchstart':
                type = PointerType.POINTER_DOWN;
                break;
            case 'touchmove':
                type = PointerType.POINTER_MOVE;
                break;
            case 'touchend':
                type = PointerType.POINTER_UP;
                break;
            case 'touchcancel':
                type = PointerType.POINTER_CANCEL;
                break;
        }
        return type;
    }
}
exports.PointerEvent = PointerEvent;
class PointerRouter {
    constructor() {
        this.routeMap = {};
    }
    addRoute(pointer, route) {
        if (!this.routeMap[pointer]) {
            this.routeMap[pointer] = [];
        }
        this.routeMap[pointer].push(route);
    }
    removeRoute(pointer, route) {
        if (this.routeMap[pointer]) {
            let routes = this.routeMap[pointer];
            let index = routes.indexOf(route);
            if (index != -1) {
                routes.splice(index, 1);
            }
            if (routes.length == 0) {
                delete this.routeMap[pointer];
            }
        }
    }
    route(event) {
        if (this.routeMap[event.identifier]) {
            this.routeMap[event.identifier].forEach((route) => {
                route(event);
            });
        }
    }
}
exports.PointerRouter = PointerRouter;
//# sourceMappingURL=pointer_router.js.map