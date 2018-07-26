import { GestureRecognizer } from './gesture_recognizer';

export enum GestureDisposition {
    ACCEPTED,
    REJECTED
}

class GestureArena {

    eagerWinner: GestureRecognizer;

    isOpen: boolean = true;

    hasPendingSweep: boolean = false;

    isHeld: number = 0;

    recognizers: GestureRecognizer[] = [];
    
    add(recognizer: GestureRecognizer): void {
        this.recognizers.push(recognizer);
    }
}

export class GestureArenaManager {

    arenas: {[kye: number]: GestureArena} = {};

    add(pointer: number, recognizer: GestureRecognizer): void {
        if(!this.arenas[pointer]) {
            this.arenas[pointer] = new GestureArena();
        }
        this.arenas[pointer].add(recognizer);
    }

    close(pointer: number) {
        let arena = this.arenas[pointer];
        if(!arena) return;
        arena.isOpen = false;
        this._tryToResolveArena(pointer, arena);
    }

    hold(pointer: number) {
        let arena = this.arenas[pointer];
        if(!arena) return;
        arena.isHeld++;
    }

    release(pointer: number) {
        let arena = this.arenas[pointer];
        if(!arena) return;
        arena.isHeld--;
        if(arena.isHeld <= 0 && arena.hasPendingSweep) {
            this.sweep(pointer);
        }
    }

    sweep(pointer: number) {
        let arena = this.arenas[pointer];
        if(!arena) return;
        if(arena.isHeld > 0) {
            arena.hasPendingSweep = true;
            return;
        }
        delete this.arenas[pointer];
        if(arena.recognizers.length) {
            arena.recognizers[0].accept();
            for(let i = 0; i < arena.recognizers.length; i++) {
                arena.recognizers[i].reject();
            }
        }
    }

    reoslve(pointer: number, recognizer: GestureRecognizer, disposition: GestureDisposition) {
        let arena = this.arenas[pointer];
        if(!arena) return;
        if(disposition == GestureDisposition.REJECTED) {
            let index = arena.recognizers.indexOf(recognizer);
            if(index != -1) {
                arena.recognizers.splice(index, 1);
            }
            if(!arena.isOpen) {
                this._tryToResolveArena(pointer, arena);
            }
        } else {
            if(arena.isOpen) {
                arena.eagerWinner = arena.eagerWinner || recognizer;
            } else {
                this._resolveInFavorOf(pointer, arena, recognizer);
            }
        }
    }

    _tryToResolveArena(pointer: number, arena: GestureArena) {
        if(arena.recognizers.length == 0) {
            delete this.arenas[pointer];
        } else if(arena.recognizers.length == 1) {
            setTimeout(()=> this._resolveByDefault(pointer, arena), 0);
        } else if(arena.eagerWinner) {
            this._resolveInFavorOf(pointer, arena, arena.eagerWinner);
        }
    }

    _resolveByDefault(pointer: number, arena: GestureArena) {
        if(!this.arenas[pointer]) return;
        delete this.arenas[pointer];
        arena.recognizers[0].accept();
    }

    _resolveInFavorOf(pointer: number, arena: GestureArena, recognizer: GestureRecognizer) {
        delete this.arenas[pointer];
        for(let i = 0; i < arena.recognizers.length; i++) {
            if(arena.recognizers[i] != recognizer) {
                arena.recognizers[i].reject();
            }
        }
        recognizer.accept();
    }

}