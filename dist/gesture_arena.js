"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GestureDisposition;
(function (GestureDisposition) {
    GestureDisposition[GestureDisposition["ACCEPTED"] = 0] = "ACCEPTED";
    GestureDisposition[GestureDisposition["REJECTED"] = 1] = "REJECTED";
})(GestureDisposition || (GestureDisposition = {}));
class GestureArenaEntry {
    constructor(arena, pointer, recognizer) {
        this.arena = arena;
        this.pointer = pointer;
        this.recognizer = recognizer;
    }
    resolve(disposition) {
        this.manager.resolve();
    }
}
class GestureArena {
}
;
[];
class GestureArenaManager {
    close() {
    }
    sweep() {
    }
    reoslve(pointer, recognizer, disposition) {
    }
}
exports.GestureArenaManager = GestureArenaManager;
//# sourceMappingURL=gesture_arena.js.map