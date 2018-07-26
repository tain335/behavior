
import _Animation from './animation';
import { AnimationDirection, AnimationStatus } from './types';
import { Curve } from './curves';

export class TweenAnimation<T> extends _Animation<T> {

    private _value: T;

    get value() {
        return this._value;
    }
    
}

export class AlwaysStoppedAnimation<T> extends _Animation<T> {

    value: T;

    status = AnimationStatus.FORWARD;

    constructor(value: T) {
        super();
        this.value = value;
    }

}

export class CurveAnimation extends _Animation<number> {

    parent: _Animation<number>;

    curve: Curve;

    reverseCurve: Curve;

    curveDirection: AnimationStatus;

    constructor(parent: _Animation<number>, curve: Curve, reverseCurve?: Curve) {
        super();
        this.parent = parent;
        this.curve = curve;
        this.reverseCurve = reverseCurve;
        this._updateCurveDirection(this.parent.status);
        this.parent.addStatusListener(this._updateCurveDirection);
    }

    _updateCurveDirection(status: AnimationStatus) {
        switch(status) {
            case AnimationStatus.DISMISSED:
            case AnimationStatus.COMPLETED:
                this.curveDirection = null;
                break;
            case AnimationStatus.FORWARD:
                this.curveDirection = AnimationStatus.FORWARD;
                break;
            case AnimationStatus.REVERSE:
                this.curveDirection = AnimationStatus.REVERSE;
                break;
        }
    }

    get _useForwardCurve(): boolean {
        return this.reverseCurve == null || (this.curveDirection || this.parent.status) != AnimationStatus.REVERSE;
    }

    get value(): number {
        const activeCurve = this._useForwardCurve ? this.curve : this.reverseCurve;
        let t = this.parent.value;
        if(activeCurve == null) return t;
        if(t == 0.0 || t == 1.0) return t;
        return activeCurve.transform(t);
    }

}

export class ProxyAnimation extends _Animation<number> {

    private _status: AnimationStatus;

    private _parent: _Animation<number>;

    private _value: number;

    constructor(animation: _Animation<number>) {
        super();
        this._parent = animation;
        if(this._parent == null) {
            this._status = AnimationStatus.DISMISSED;
            this._value = 0.0;
        }
    }

    setParent(newParent: _Animation<number>) {
        if(this._parent = newParent) return;

        if(this._parent != null) {
            this._status = this._parent.status;
            this._value = this._parent.value;
            this.didStopListening();
        }
        this._parent = newParent;
        if(this._parent != null) {
            this.didStartListening();
            if(this._value != this._parent.value) { //if oldParent.value != newParent.value update
                this.notifyListeners();
            }
            if(this._status != this._parent.status) {
                this.notifyStatusListeners(this._parent.status); //if oldParent.status != newParent.status update
            }
            this._status = null;
            this._value = null;
        }
    }

    didStartListening() {
        if(this._parent != null) {
            this._parent.addListener(this.notifyListeners);
            this._parent.addStatusListener(this.notifyStatusListeners);
        }
    }

    didStopListening() {
        if(this._parent != null) {
            this._parent.removeListener(this.notifyListeners);
            this._parent.removeStatusListener(this.notifyStatusListeners);
        }
    }

    get value(): number {
        return this._parent != null ? this._parent.value : this.value;
    }

    get status(): AnimationStatus {
        return this._parent != null ? this._parent.status : this._status;
    }
}

export class ReverseAnimation extends _Animation<number> {

    parent: _Animation<number>;

    constructor(parent: _Animation<number>) {
        super();
        this.parent = parent;
    }

    addListener(listner: any) {
        this.didRegisterListener();
        this.parent.addListener(listner);
    }

    removeListener(listener: any) {
        this.parent.removeListener(listener);
        this.didUnregisterListener();
    }

    didStartListening() {
        this.parent.addStatusListener(this._statusChangeHandler)
    }

    didStopListening() {
        this.parent.removeStatusListener(this._statusChangeHandler);
    }

    _statusChangeHandler(status: AnimationStatus) {
        this.notifyStatusListeners(this._reverseStatus(status));
    }

    _reverseStatus(status: AnimationStatus) {
        switch(status) {
            case AnimationStatus.FORWARD:
                return AnimationStatus.REVERSE;
            case AnimationStatus.REVERSE:
                return AnimationStatus.FORWARD;
            case AnimationStatus.COMPLETED:
                return AnimationStatus.DISMISSED;
            case AnimationStatus.DISMISSED:
                return AnimationStatus.COMPLETED;
        }   
        return null;
    }

    get status(): AnimationStatus {
        return this._reverseStatus(this.parent.status);
    }

    get value(): number {
        return 1.0 - this.parent.value;
    }
}

enum _TrainHoppingMode {
    MINIMIZE, MAXIMIZE
}

export class TrainHoppingAnimation extends _Animation<number> {

    currentTrain: _Animation<number>;

    nextTrain: _Animation<number>;

    onSwitchedTrain: any;

    private _mode: _TrainHoppingMode;

    private _lastStatus: AnimationStatus;

    private _lastValue: number;

    constructor(currentTrain: _Animation<number>, nextTrain: _Animation<number>, onSwitchedTrain: any) {
        super();
        if(this.nextTrain != null) {
            if(this.currentTrain.value > this.nextTrain.value) {
                this._mode = _TrainHoppingMode.MAXIMIZE;
            } else {
                this._mode = _TrainHoppingMode.MINIMIZE;
                if(this.currentTrain.value == this.nextTrain.value) {
                    this.currentTrain = this.nextTrain;
                    this.nextTrain = null;
                }
            }
        }
        
    }

    _statusChangeHandler(status: AnimationStatus) {
        if(status != this._lastStatus) {
            //this.notifyListeners;
            this.notifyStatusListeners(status);
            this._lastStatus = status;
        }
    }

    _valueChangeHandler() {
        let hop = false;
        if(this.nextTrain != null) {
            switch(this._mode) {
                case _TrainHoppingMode.MAXIMIZE:
                    hop = this.nextTrain.value >= this.currentTrain.value;
                    break;
                case _TrainHoppingMode.MINIMIZE:
                    hop = this.nextTrain.value <= this.currentTrain.value;
                    break;
            }
        }
        if(hop) {
            this.currentTrain.removeStatusListener(this._statusChangeHandler);
            this.currentTrain.removeListener(this._valueChangeHandler);
            this.currentTrain = this.nextTrain;
            this.nextTrain = null;
            this.currentTrain.addStatusListener(this._statusChangeHandler);
            this._statusChangeHandler(this.currentTrain.status);
        }
        let newValue = this.value;
        if(newValue != this._lastValue) {
            this.notifyListeners();
            this._lastValue = newValue;
        }
        if(hop && this.onSwitchedTrain) {
            this.onSwitchedTrain();
        }
    }

    get value(): number {
        return this.currentTrain.value;
    }

    dispose() {
        this.currentTrain.removeStatusListener(this._statusChangeHandler);
        this.currentTrain.removeListener(this._valueChangeHandler);
        this.currentTrain = null;
        if(this.nextTrain != null) {
            this.nextTrain.removeListener(this._valueChangeHandler);
        }
        this.nextTrain = null;
        super.dispose();
    }

}

export abstract class CompoundAnimation<T> extends _Animation<T> {

    first: _Animation<number>;

    next: _Animation<number>;

    _lastValue: T;

    _lastStatus: AnimationStatus;

    constructor(first: _Animation<number>, next: _Animation<number>) {
        super();
        this.first = first;
        this.next = next;
    }

    didStartListening() {
        this.first.addListener(this._maybeNotifyListeners);
        this.first.addStatusListener(this._maybeNotifyStatusListeners);
        this.next.addListener(this._maybeNotifyListeners);
        this.next.addStatusListener(this._maybeNotifyStatusListeners);
    }

    didStopListening() {
        this.first.removeListener(this._maybeNotifyListeners);
        this.first.removeStatusListener(this._maybeNotifyStatusListeners);
        this.next.removeListener(this._maybeNotifyListeners);
        this.next.removeStatusListener(this._maybeNotifyStatusListeners);
    }

    _maybeNotifyStatusListeners(_: AnimationStatus) {
        if(this.status != this._lastStatus) {
            this._lastStatus = this.status;
            this.notifyStatusListeners(this.status);
        }
    }

    _maybeNotifyListeners() {
        if(this.value != this._lastValue) {
            this._lastValue = this.value;
            this.notifyListeners();
        }
    }

    get status(): AnimationStatus {
        if(this.next.status == AnimationStatus.FORWARD || this.next.status == AnimationStatus.REVERSE) {
            return this.next.status;
        }
        return this.first.status;
    }

}

export class AnimationMean extends CompoundAnimation<number> {
    constructor(left: _Animation<number>, right: _Animation<number>) {
        super(left, right);
    }

    get value(): number {
        return (this.first.value +  this.next.value) / 2;
    }
}

export class AnimationMax extends CompoundAnimation<number> {
    constructor(left: _Animation<number>, right: _Animation<number>) {
        super(left, right);
    }

    get value(): number {
        return Math.max(this.first.value, this.next.value);
    }
}


export class AnimationMin extends CompoundAnimation<number> {
    constructor(left: _Animation<number>, right: _Animation<number>) {
        super(left, right);
    }

    get value(): number {
        return Math.min(this.first.value, this.next.value);
    }
}