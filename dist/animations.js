"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const animation_1 = require("./animation");
const types_1 = require("./types");
class TweenAnimation extends animation_1.default {
    get value() {
        return this._value;
    }
}
exports.TweenAnimation = TweenAnimation;
class AlwaysStoppedAnimation extends animation_1.default {
    constructor(value) {
        super();
        this.status = types_1.AnimationStatus.FORWARD;
        this.value = value;
    }
}
exports.AlwaysStoppedAnimation = AlwaysStoppedAnimation;
class CurveAnimation extends animation_1.default {
    constructor(parent, curve, reverseCurve) {
        super();
        this.parent = parent;
        this.curve = curve;
        this.reverseCurve = reverseCurve;
        this._updateCurveDirection(this.parent.status);
        this.parent.addStatusListener(this._updateCurveDirection);
    }
    _updateCurveDirection(status) {
        switch (status) {
            case types_1.AnimationStatus.DISMISSED:
            case types_1.AnimationStatus.COMPLETED:
                this.curveDirection = null;
                break;
            case types_1.AnimationStatus.FORWARD:
                this.curveDirection = types_1.AnimationStatus.FORWARD;
                break;
            case types_1.AnimationStatus.REVERSE:
                this.curveDirection = types_1.AnimationStatus.REVERSE;
                break;
        }
    }
    get _useForwardCurve() {
        return this.reverseCurve == null || (this.curveDirection || this.parent.status) != types_1.AnimationStatus.REVERSE;
    }
    get value() {
        const activeCurve = this._useForwardCurve ? this.curve : this.reverseCurve;
        let t = this.parent.value;
        if (activeCurve == null)
            return t;
        if (t == 0.0 || t == 1.0)
            return t;
        return activeCurve.transform(t);
    }
}
exports.CurveAnimation = CurveAnimation;
class ProxyAnimation extends animation_1.default {
    constructor(animation) {
        super();
        this._parent = animation;
        if (this._parent == null) {
            this._status = types_1.AnimationStatus.DISMISSED;
            this._value = 0.0;
        }
    }
    setParent(newParent) {
        if (this._parent = newParent)
            return;
        if (this._parent != null) {
            this._status = this._parent.status;
            this._value = this._parent.value;
            this.didStopListening();
        }
        this._parent = newParent;
        if (this._parent != null) {
            this.didStartListening();
            if (this._value != this._parent.value) {
                this.notifyListeners();
            }
            if (this._status != this._parent.status) {
                this.notifyStatusListeners(this._parent.status);
            }
            this._status = null;
            this._value = null;
        }
    }
    didStartListening() {
        if (this._parent != null) {
            this._parent.addListener(this.notifyListeners);
            this._parent.addStatusListener(this.notifyStatusListeners);
        }
    }
    didStopListening() {
        if (this._parent != null) {
            this._parent.removeListener(this.notifyListeners);
            this._parent.removeStatusListener(this.notifyStatusListeners);
        }
    }
    get value() {
        return this._parent != null ? this._parent.value : this.value;
    }
    get status() {
        return this._parent != null ? this._parent.status : this._status;
    }
}
exports.ProxyAnimation = ProxyAnimation;
class ReverseAnimation extends animation_1.default {
    constructor(parent) {
        super();
        this.parent = parent;
    }
    addListener(listner) {
        this.didRegisterListener();
        this.parent.addListener(listner);
    }
    removeListener(listener) {
        this.parent.removeListener(listener);
        this.didUnregisterListener();
    }
    didStartListening() {
        this.parent.addStatusListener(this._statusChangeHandler);
    }
    didStopListening() {
        this.parent.removeStatusListener(this._statusChangeHandler);
    }
    _statusChangeHandler(status) {
        this.notifyStatusListeners(this._reverseStatus(status));
    }
    _reverseStatus(status) {
        switch (status) {
            case types_1.AnimationStatus.FORWARD:
                return types_1.AnimationStatus.REVERSE;
            case types_1.AnimationStatus.REVERSE:
                return types_1.AnimationStatus.FORWARD;
            case types_1.AnimationStatus.COMPLETED:
                return types_1.AnimationStatus.DISMISSED;
            case types_1.AnimationStatus.DISMISSED:
                return types_1.AnimationStatus.COMPLETED;
        }
        return null;
    }
    get status() {
        return this._reverseStatus(this.parent.status);
    }
    get value() {
        return 1.0 - this.parent.value;
    }
}
exports.ReverseAnimation = ReverseAnimation;
var _TrainHoppingMode;
(function (_TrainHoppingMode) {
    _TrainHoppingMode[_TrainHoppingMode["MINIMIZE"] = 0] = "MINIMIZE";
    _TrainHoppingMode[_TrainHoppingMode["MAXIMIZE"] = 1] = "MAXIMIZE";
})(_TrainHoppingMode || (_TrainHoppingMode = {}));
class TrainHoppingAnimation extends animation_1.default {
    constructor(currentTrain, nextTrain, onSwitchedTrain) {
        super();
        if (this.nextTrain != null) {
            if (this.currentTrain.value > this.nextTrain.value) {
                this._mode = _TrainHoppingMode.MAXIMIZE;
            }
            else {
                this._mode = _TrainHoppingMode.MINIMIZE;
                if (this.currentTrain.value == this.nextTrain.value) {
                    this.currentTrain = this.nextTrain;
                    this.nextTrain = null;
                }
            }
        }
    }
    _statusChangeHandler(status) {
        if (status != this._lastStatus) {
            this.notifyStatusListeners(status);
            this._lastStatus = status;
        }
    }
    _valueChangeHandler() {
        let hop = false;
        if (this.nextTrain != null) {
            switch (this._mode) {
                case _TrainHoppingMode.MAXIMIZE:
                    hop = this.nextTrain.value >= this.currentTrain.value;
                    break;
                case _TrainHoppingMode.MINIMIZE:
                    hop = this.nextTrain.value <= this.currentTrain.value;
                    break;
            }
        }
        if (hop) {
            this.currentTrain.removeStatusListener(this._statusChangeHandler);
            this.currentTrain.removeListener(this._valueChangeHandler);
            this.currentTrain = this.nextTrain;
            this.nextTrain = null;
            this.currentTrain.addStatusListener(this._statusChangeHandler);
            this._statusChangeHandler(this.currentTrain.status);
        }
        let newValue = this.value;
        if (newValue != this._lastValue) {
            this.notifyListeners();
            this._lastValue = newValue;
        }
        if (hop && this.onSwitchedTrain) {
            this.onSwitchedTrain();
        }
    }
    get value() {
        return this.currentTrain.value;
    }
    dispose() {
        this.currentTrain.removeStatusListener(this._statusChangeHandler);
        this.currentTrain.removeListener(this._valueChangeHandler);
        this.currentTrain = null;
        if (this.nextTrain != null) {
            this.nextTrain.removeListener(this._valueChangeHandler);
        }
        this.nextTrain = null;
        super.dispose();
    }
}
exports.TrainHoppingAnimation = TrainHoppingAnimation;
class CompoundAnimation extends animation_1.default {
    constructor(first, next) {
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
    _maybeNotifyStatusListeners(_) {
        if (this.status != this._lastStatus) {
            this._lastStatus = this.status;
            this.notifyStatusListeners(this.status);
        }
    }
    _maybeNotifyListeners() {
        if (this.value != this._lastValue) {
            this._lastValue = this.value;
            this.notifyListeners();
        }
    }
    get status() {
        if (this.next.status == types_1.AnimationStatus.FORWARD || this.next.status == types_1.AnimationStatus.REVERSE) {
            return this.next.status;
        }
        return this.first.status;
    }
}
exports.CompoundAnimation = CompoundAnimation;
class AnimationMean extends CompoundAnimation {
    constructor(left, right) {
        super(left, right);
    }
    get value() {
        return (this.first.value + this.next.value) / 2;
    }
}
exports.AnimationMean = AnimationMean;
class AnimationMax extends CompoundAnimation {
    constructor(left, right) {
        super(left, right);
    }
    get value() {
        return Math.max(this.first.value, this.next.value);
    }
}
exports.AnimationMax = AnimationMax;
class AnimationMin extends CompoundAnimation {
    constructor(left, right) {
        super(left, right);
    }
    get value() {
        return Math.min(this.first.value, this.next.value);
    }
}
exports.AnimationMin = AnimationMin;
//# sourceMappingURL=animations.js.map