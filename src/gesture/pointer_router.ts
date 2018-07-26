export enum PointerType {
    POINTER_DOWN,
    POINTER_MOVE,
    POINTER_UP,
    POINTER_CANCEL
}

export class PointerEvent {

    identifier: number;

    pageX: number;

    pageY: number;

    screenX: number;

    screenY: number;

    clientX: number;

    clientY: number;

    type: PointerType;

    sourceEvent: TouchEvent

    constructor(opts: {
        identifier: number,
        pageX: number,
        pageY: number,
        screenX: number,
        screenY: number,
        clientX: number,
        clientY: number,
        type: PointerType,
        sourceEvent: TouchEvent
    }) {
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

    static covenrtTouchEventToPointerEvent(event: TouchEvent): PointerEvent[] {
        let events: PointerEvent[] = [];
        for(let i = 0; i < event.changedTouches.length; i++) {
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
            }))
        }
        return events;
    }

    static getPointerTypeFromTouchEvent(event: TouchEvent): PointerType {
        let type;
        switch(event.type) {
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

export class PointerRouter {

    routeMap: {[key: number]: any[]} = {};

    addRoute(pointer: number, route: any) {
        if(!this.routeMap[pointer]) {
            this.routeMap[pointer] = [];
        }
        this.routeMap[pointer].push(route);
    }

    removeRoute(pointer: number, route: any) {
        if(this.routeMap[pointer]) {
            let routes = this.routeMap[pointer];
            let index = routes.indexOf(route);
            if(index != -1) {
                routes.splice(index, 1);
            }
            if(routes.length == 0) {
                delete this.routeMap[pointer];
            }
        }
    }

    route(event: PointerEvent) {   
        if(this.routeMap[event.identifier]) {
            this.routeMap[event.identifier].forEach((route)=> {
                route(event);
            });
        }
    }

}
