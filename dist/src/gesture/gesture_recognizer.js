"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pointer_router_1 = require("./pointer_router");
const gesture_arena_1 = require("./gesture_arena");
var GestureRecognizerStatus;
(function (GestureRecognizerStatus) {
    GestureRecognizerStatus[GestureRecognizerStatus["PENDING"] = 0] = "PENDING";
    GestureRecognizerStatus[GestureRecognizerStatus["RESOLVED"] = 1] = "RESOLVED";
    GestureRecognizerStatus[GestureRecognizerStatus["REJECTED"] = 2] = "REJECTED";
})(GestureRecognizerStatus || (GestureRecognizerStatus = {}));
class GestureRecognizer {
    bindDetector(detector) {
        this.detector = detector;
    }
    invokeCallback(name, callback) {
        if (process.env.NODE_ENV != 'production') {
            console.info(`calling ${name} callback`);
        }
        return callback();
    }
}
exports.GestureRecognizer = GestureRecognizer;
class TapGestureRecognizer extends GestureRecognizer {
    constructor(opts) {
        super();
        this._initialX = -1;
        this._initialY = -1;
        this._timer = -1;
        this._hasPointerUp = false;
        this.onTapDown = opts.onTapDown;
        this.onTap = opts.onTap;
        this.onTapUp = opts.onTapUp;
        this.deadline = opts.deadline;
        this.extent = opts.extent;
        this.deadline = opts.deadline;
    }
    addPointer(event) {
        if (this._trackPointer != -1 && this._trackPointer != event.identifier) {
            return;
        }
        if (event.type == pointer_router_1.PointerType.POINTER_DOWN) {
            this.detector.manager.add(event.identifier, this);
            this.detector.router.addRoute(event.identifier, this.handleEvent);
            this._status = GestureRecognizerStatus.PENDING;
            this._trackPointer = event.identifier;
            this._initialX = event.pageX;
            this._initialY = event.pageY;
            this._timer = setTimeout(this._checkDown, this.deadline);
        }
    }
    handleEvent(event) {
        switch (event.type) {
            case pointer_router_1.PointerType.POINTER_MOVE:
                if (Math.abs(event.pageX - this._initialX) > this.extent ||
                    Math.abs(event.pageY - this._initialY) > this.extent) {
                    this._stopTrack();
                }
                break;
            case pointer_router_1.PointerType.POINTER_UP:
                this.detector.manager.reoslve(this._trackPointer, this, gesture_arena_1.GestureDisposition.ACCEPTED);
                this._hasPointerUp = true;
                this._checkUp();
                break;
            case pointer_router_1.PointerType.POINTER_CANCEL:
                this._stopTrack();
                this.invokeCallback('onTapCancel', this.onTapCancel);
                break;
        }
    }
    _checkDown() {
        if (!this._sentDown && this.onTapDown) {
            this.invokeCallback('onTapDown', this.onTapDown);
            this._sentDown = true;
            clearTimeout(this._timer);
        }
    }
    _checkUp() {
        if (this._status == GestureRecognizerStatus.RESOLVED && this._hasPointerUp) {
            if (this.onTapUp) {
                this.invokeCallback('onTapUp', this.onTapUp);
            }
            if (this.onTap) {
                this.invokeCallback('onTap', this.onTap);
            }
            this.reset();
        }
    }
    _stopTrack() {
        clearTimeout(this._timer);
        this.detector.manager.reoslve(this._trackPointer, this, gesture_arena_1.GestureDisposition.REJECTED);
        this.detector.router.removeRoute(this._trackPointer, this.handleEvent);
        this.reset();
    }
    reject() {
        this._status = GestureRecognizerStatus.REJECTED;
        this.reset();
    }
    accept() {
        this._status = GestureRecognizerStatus.RESOLVED;
        this._checkDown();
        this._checkUp();
    }
    reset() {
        this._initialX = -1;
        this._initialY = -1;
        this._trackPointer = -1;
        this._timer = 1;
        this._sentDown = false;
        this._hasPointerUp = false;
    }
}
exports.TapGestureRecognizer = TapGestureRecognizer;
//# sourceMappingURL=gesture_recognizer.js.map