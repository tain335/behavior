
import { AnimationStatus } from './types';

export default abstract class _Animation<T> {

    status: AnimationStatus;

    listeners: Array<any> = [];

    statusListeners: Array<any> = [];

    private _listenerCounter = 0;

    didRegisterListener() {
        if(this._listenerCounter == 0) {
            this.didStartListening();
            this._listenerCounter++;
        }
    }

    didUnregisterListener() {
        this._listenerCounter--;
        if(this._listenerCounter == 0) {
            this.didStopListening();
        }
    }

    didStartListening() {}

    didStopListening() {}

    dispose() {}

    addListener(listener: any): void {
        this.listeners.push(listener);
    }

    removeListener(listener: any): void {
        let len = this.listeners.length;
        while(len--) {
            if(this.listeners[len] == listener) {
                this.listeners.splice(len, 1);
                return;
            }
        }
    }

    addStatusListener(listener: any): void {
        this.statusListeners.push(listener);
    }

    removeStatusListener(listener: any): void {
        let len = this.statusListeners.length;
        while(len--) {
            if(this.statusListeners[len] == listener) {
                this.statusListeners.splice(len, 1);
                return;
            }
        }
    }

    notifyListeners(): void {
        let listeners = this.listeners.slice();
        listeners.forEach((listener)=> listener());
    }

    notifyStatusListeners(status: AnimationStatus): void {
        let listeners = this.statusListeners.slice();
        listeners.forEach((listener)=> listener(status));
    }

    abstract get value(): T;

    get isDismissed(): boolean {
        return this.status == AnimationStatus.DISMISSED;
    }

    get isCompleted(): boolean {
        return this.status == AnimationStatus.COMPLETED;
    }

}