"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GestureRecognizer {
    constructor() {
    }
    addPointer(pointer) {
    }
    handleEvent(event) {
    }
    reject() {
    }
    accept() {
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
}
exports.TapGestureRecognizer = TapGestureRecognizer;
//# sourceMappingURL=gesture_recognizer.js.map