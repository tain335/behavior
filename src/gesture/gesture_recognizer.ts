
import { PointerEvent, PointerType } from './pointer_router';
import { GestureDetector } from './gesture_detector';
import { GestureDisposition } from './gesture_arena';

export enum GestureRecognizerStatus {
    PENDING,
    RESOLVED,
    REJECTED
}

export abstract class GestureRecognizer {

    detector: GestureDetector;

    abstract addPointer(event: PointerEvent): void;

    abstract handleEvent(event: PointerEvent): void;

    abstract reject(): void;

    abstract accept(): void;

    bindDetector(detector: GestureDetector) {
        this.detector = detector;
    }

    invokeCallback(name: string, callback: any): any {
        if(process.env.NODE_ENV != 'production') {
            console.info(`calling ${name} callback`);
        }
        return callback();
    }

}