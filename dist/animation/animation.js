"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class _Animation {
    constructor() {
        this.listeners = [];
        this.statusListeners = [];
        this._listenerCounter = 0;
    }
    didRegisterListener() {
        if (this._listenerCounter == 0) {
            this.didStartListening();
            this._listenerCounter++;
        }
    }
    didUnregisterListener() {
        this._listenerCounter--;
        if (this._listenerCounter == 0) {
            this.didStopListening();
        }
    }
    didStartListening() { }
    didStopListening() { }
    dispose() { }
    addListener(listener) {
        this.listeners.push(listener);
    }
    removeListener(listener) {
        let len = this.listeners.length;
        while (len--) {
            if (this.listeners[len] == listener) {
                this.listeners.splice(len, 1);
                return;
            }
        }
    }
    addStatusListener(listener) {
        this.statusListeners.push(listener);
    }
    removeStatusListener(listener) {
        let len = this.statusListeners.length;
        while (len--) {
            if (this.statusListeners[len] == listener) {
                this.statusListeners.splice(len, 1);
                return;
            }
        }
    }
    notifyListeners() {
        let listeners = this.listeners.slice();
        listeners.forEach((listener) => listener());
    }
    notifyStatusListeners(status) {
        let listeners = this.statusListeners.slice();
        listeners.forEach((listener) => listener(status));
    }
    get isDismissed() {
        return this.status == types_1.AnimationStatus.DISMISSED;
    }
    get isCompleted() {
        return this.status == types_1.AnimationStatus.COMPLETED;
    }
}
exports.default = _Animation;
//# sourceMappingURL=animation.js.map