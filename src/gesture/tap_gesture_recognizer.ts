
import { GestureDisposition } from './gesture_arena';

import { PointerEvent, PointerType } from './pointer_router';

import { GestureRecognizer, GestureRecognizerStatus } from './gesture_recognizer';

export class TapGestureRecognizer extends GestureRecognizer {

    _initialX: number = -1;

    _initialY: number = -1;

    _trackPointer: number = -1;

    _timer: number = -1;

    _sentDown: boolean = false;

    _hasPointerUp: boolean = false;

    _status: GestureRecognizerStatus = GestureRecognizerStatus.PENDING;

    _internalHandleEvent: any;

    onTapDown: any;

    onTap: any;

    onTapUp: any;

    onTapCancel: any;

    deadline: number;

    extent: number;

    constructor(opts: {
        onTapDown?: any,
        onTapUp?: any,
        onTap?: any,
        onTapCancel?: any,
        deadline?: number,
        extent?: number
    }) {
        super();
        this.onTapDown = opts.onTapDown;
        this.onTap = opts.onTap;
        this.onTapUp = opts.onTapUp;
        this.deadline = opts.deadline;
        this.extent = opts.extent || 10;
        this.deadline = opts.deadline || 100;
    }

    addPointer(event: PointerEvent) {
        if(this._trackPointer != -1 && this._trackPointer != event.identifier) {
            return;
        }
        if(event.type == PointerType.POINTER_DOWN) {
            this.detector.manager.add(event.identifier, this);
            this._internalHandleEvent = this.handleEvent.bind(this);
            this.detector.router.addRoute(event.identifier, this._internalHandleEvent);
            this._status = GestureRecognizerStatus.PENDING;
            this._trackPointer = event.identifier;
            this._initialX = event.pageX;
            this._initialY = event.pageY;
            this._timer = setTimeout(()=> {
                this._checkDown();
            }, this.deadline);
        }
    }

    handleEvent(event: PointerEvent) {
        switch(event.type) {
            case PointerType.POINTER_MOVE:
                if(Math.abs(event.pageX - this._initialX) > this.extent || 
                    Math.abs(event.pageY - this._initialY) > this.extent) {
                        this._stopTrack();
                    }
                break;
            case PointerType.POINTER_UP:
                this.detector.manager.reoslve(this._trackPointer, this, GestureDisposition.ACCEPTED);
                this._hasPointerUp = true;
                if(this._status == GestureRecognizerStatus.RESOLVED) {
                    this._checkUp();
                }
                break;
            case PointerType.POINTER_CANCEL:
                this._stopTrack();
                this.invokeCallback('onTapCancel', this.onTapCancel);
                break;
        }
    }

    _checkDown() {
        if(!this._sentDown && this.onTapDown) {
            this.invokeCallback('onTapDown', this.onTapDown);
            this._sentDown = true;
            clearTimeout(this._timer);
        }
    }

    _checkUp() {
        if(this._status == GestureRecognizerStatus.RESOLVED && this._hasPointerUp) {
            if(this.onTapUp) {
                this.invokeCallback('onTapUp', this.onTapUp)
            }
            if(this.onTap) {
                this.invokeCallback('onTap', this.onTap);
            }
            this._stopTrack();
        }
    }

    _stopTrack() {
        clearTimeout(this._timer);
        this.detector.manager.reoslve(this._trackPointer, this, GestureDisposition.REJECTED);
        this.detector.router.removeRoute(this._trackPointer, this._internalHandleEvent);
        this._reset();
    }

    reject() {
        this._status = GestureRecognizerStatus.REJECTED;
        this._reset();
    }

    accept() {
        this._status = GestureRecognizerStatus.RESOLVED;
        this._checkDown();
        this._checkUp();
    }

    _reset() {
        this._initialX = -1;
        this._initialY = -1;
        this._trackPointer = -1;
        this._timer = 1;
        this._sentDown = false;
        this._hasPointerUp = false;
    }

}