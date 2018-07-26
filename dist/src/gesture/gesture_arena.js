"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GestureDisposition;
(function (GestureDisposition) {
    GestureDisposition[GestureDisposition["ACCEPTED"] = 0] = "ACCEPTED";
    GestureDisposition[GestureDisposition["REJECTED"] = 1] = "REJECTED";
})(GestureDisposition = exports.GestureDisposition || (exports.GestureDisposition = {}));
class GestureArena {
    constructor() {
        this.isOpen = true;
        this.hasPendingSweep = false;
        this.isHeld = 0;
        this.recognizers = [];
    }
    add(recognizer) {
        this.recognizers.push(recognizer);
    }
}
class GestureArenaManager {
    constructor() {
        this.arenas = {};
    }
    add(pointer, recognizer) {
        if (!this.arenas[pointer]) {
            this.arenas[pointer] = new GestureArena();
        }
        this.arenas[pointer].add(recognizer);
    }
    close(pointer) {
        let arena = this.arenas[pointer];
        if (!arena)
            return;
        arena.isOpen = false;
        this._tryToResolveArena(pointer, arena);
    }
    hold(pointer) {
        let arena = this.arenas[pointer];
        if (!arena)
            return;
        arena.isHeld++;
    }
    release(pointer) {
        let arena = this.arenas[pointer];
        if (!arena)
            return;
        arena.isHeld--;
        if (arena.isHeld <= 0 && arena.hasPendingSweep) {
            this.sweep(pointer);
        }
    }
    sweep(pointer) {
        let arena = this.arenas[pointer];
        if (!arena)
            return;
        if (arena.isHeld > 0) {
            arena.hasPendingSweep = true;
            return;
        }
        delete this.arenas[pointer];
        if (arena.recognizers.length) {
            arena.recognizers[0].accept();
            for (let i = 0; i < arena.recognizers.length; i++) {
                arena.recognizers[i].reject();
            }
        }
    }
    reoslve(pointer, recognizer, disposition) {
        let arena = this.arenas[pointer];
        if (!arena)
            return;
        if (disposition == GestureDisposition.REJECTED) {
            let index = arena.recognizers.indexOf(recognizer);
            if (index != -1) {
                arena.recognizers.splice(index, 1);
            }
            if (!arena.isOpen) {
                this._tryToResolveArena(pointer, arena);
            }
        }
        else {
            if (arena.isOpen) {
                arena.eagerWinner = arena.eagerWinner || recognizer;
            }
            else {
                this._resolveInFavorOf(pointer, arena, recognizer);
            }
        }
    }
    _tryToResolveArena(pointer, arena) {
        if (arena.recognizers.length == 0) {
            delete this.arenas[pointer];
        }
        else if (arena.recognizers.length == 1) {
            setTimeout(() => this._resolveByDefault(pointer, arena), 0);
        }
        else if (arena.eagerWinner) {
            this._resolveInFavorOf(pointer, arena, arena.eagerWinner);
        }
    }
    _resolveByDefault(pointer, arena) {
        delete this.arenas[pointer];
        arena.recognizers[0].accept();
    }
    _resolveInFavorOf(pointer, arena, recognizer) {
        delete this.arenas[pointer];
        for (let i = 0; i < arena.recognizers.length; i++) {
            if (arena.recognizers[i] != recognizer) {
                arena.recognizers[i].reject();
            }
        }
        recognizer.accept();
    }
}
exports.GestureArenaManager = GestureArenaManager;
//# sourceMappingURL=gesture_arena.js.map