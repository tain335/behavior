"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const animation_1 = require("./animation");
const types_1 = require("./types");
const simulation_1 = require("./simulation");
const utils = require("./utils");
const curves_1 = require("./curves");
const spring_simulation_1 = require("./spring_simulation");
const _1 = require(".");
let kFlingSpringDescription = new spring_simulation_1.SpringDescription(1.0, 500.0, 1.0);
let kFlingTolerance = new _1.Tolerance(Infinity, 0.01);
class AnimationController extends animation_1.default {
    get progress() {
        return this._lastElapsedTime / this.duration;
    }
    get lastElapsedTime() {
        return this._lastElapsedTime;
    }
    get isAnimating() {
        return this._ticker && this._ticker.isActive;
    }
    get velocity() {
        if (this.isAnimating) {
            return 0;
        }
        return this._simulation.dx(this._lastElapsedTime);
    }
    constructor(value = 0.0, min = 0.0, max = 1.0, duration = 300, ticker) {
        super();
        this._min = min;
        this._max = max;
        this._ticker = ticker.createTicker(this._tick.bind(this));
        this.duration = duration;
        this._setValue(value);
    }
    reset() {
        this.value = this._min;
    }
    forward(from) {
        if (from !== undefined) {
            this.value = from;
        }
        this.direction = types_1.AnimationDirection.FORWARD;
        this._animateToInternal(this._max);
        return this;
    }
    reverse(from) {
        if (from !== undefined) {
            this.value = from;
        }
        this.direction = types_1.AnimationDirection.REVERSE;
        this._animateToInternal(this._min);
        return this;
    }
    stop() {
        this._lastElapsedTime = null;
        this._ticker.stop();
        return this;
    }
    repeat(min, max, period) {
        min = min || this._min;
        max = max || this._max;
        period = period || this.duration;
        this._startSimulation(new RepeatSimulation(min, max, period));
        return this;
    }
    animateWith(simulation) {
        this.stop();
        this._startSimulation(simulation);
        return this;
    }
    animateTo(target, duration, curve = curves_1.Curves.linear) {
        this.direction = types_1.AnimationDirection.FORWARD;
        this._animateToInternal(target, duration, curve);
        return this;
    }
    setProgress(progress) {
        progress = utils.clamp(progress, 0, 1);
        this.value = utils.clamp(this._simulation.x(this.duration * progress), this._min, this._max);
        return this;
    }
    setSimulation(simulation) {
        this._simulation = simulation;
        return this;
    }
    fling(velocity = 1.0) {
        this.direction = this.velocity < 0.0 ? types_1.AnimationDirection.REVERSE : types_1.AnimationDirection.FORWARD;
        let target = velocity < 0.0 ? this._min - kFlingTolerance.distance : this._max + kFlingTolerance.distance;
        let simulation = new spring_simulation_1.SpringSimulation(kFlingSpringDescription, this.value, target, velocity);
        simulation.tolerance = kFlingTolerance;
        return this.animateWith(simulation);
    }
    _checkStatusChanged() {
        if (this._lastStatus != this.status) {
            this._lastStatus = this.status;
            this.notifyStatusListeners(this.status);
        }
    }
    _animateToInternal(target, duration, curve = curves_1.Curves.linear) {
        if (duration === undefined) {
            let range = this._max - this._min;
            duration = Math.abs(target - this._value) / range * this.duration;
        }
        else if (target == this._value) {
            duration = 0;
        }
        this.stop();
        if (duration === 0) {
            if (this._value != target) {
                this._value = utils.clamp(target, this._min, this._max);
                this.notifyListeners();
            }
            this.status = this.direction == types_1.AnimationDirection.FORWARD ?
                types_1.AnimationStatus.COMPLETED :
                types_1.AnimationStatus.DISMISSED;
            return;
        }
        return this._startSimulation(new InterpolationSimulation(this._value, target, duration, curve));
    }
    _startSimulation(simulation) {
        this._lastElapsedTime = 0.0;
        this._simulation = simulation;
        this._value = utils.clamp(simulation.x(0), this._min, this._max);
        this._ticker.start();
        this.status = (this.direction == types_1.AnimationDirection.FORWARD) ?
            types_1.AnimationStatus.FORWARD :
            types_1.AnimationStatus.REVERSE;
        this._checkStatusChanged();
    }
    _setValue(value) {
        this._value = utils.clamp(value, this._min, this._max);
        if (this._value == this._min) {
            this.status = types_1.AnimationStatus.DISMISSED;
        }
        else if (this._value == this._max) {
            this.status = types_1.AnimationStatus.COMPLETED;
        }
        else {
            this.status = this.direction == types_1.AnimationDirection.FORWARD ?
                types_1.AnimationStatus.FORWARD : types_1.AnimationStatus.REVERSE;
        }
        this._checkStatusChanged();
    }
    _tick(elapsed) {
        this._lastElapsedTime = elapsed;
        this._value = utils.clamp(this._simulation.x(elapsed), this._min, this._max);
        if (this._simulation.isDone(elapsed)) {
            this.status = (this.direction == types_1.AnimationDirection.FORWARD) ?
                types_1.AnimationStatus.COMPLETED :
                types_1.AnimationStatus.DISMISSED;
            this.stop();
        }
        this.notifyListeners();
        this._checkStatusChanged();
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this.stop();
        this._setValue(value);
        this.notifyListeners();
    }
}
exports.AnimationController = AnimationController;
class InterpolationSimulation extends simulation_1.default {
    constructor(begin, end, duration, curve) {
        super();
        this._begin = begin;
        this._end = end;
        this._duration = duration;
        this._curve = curve;
    }
    x(time) {
        let t = utils.clamp(time / this._duration, 0.0, 1.0);
        if (t == 0.0) {
            return this._begin;
        }
        else if (t == 1.0) {
            return this._end;
        }
        else {
            return this._begin + (this._end - this._begin) * this._curve.transform(t);
        }
    }
    dx(time) {
        let epsilon = this.tolerance.time;
        return (this.x(time + epsilon) - this.x(time - epsilon)) / (2 * epsilon);
    }
    isDone(time) {
        return time > this._duration;
    }
}
class RepeatSimulation extends simulation_1.default {
    constructor(min, max, period) {
        super();
        this.min = min;
        this.max = max;
        this.period = period;
    }
    x(time) {
        let t = (time / this.period) % 1;
        return this.min + (this.max - this.min) * t;
    }
    dx(time) {
        return (this.max - this.min) / this.period;
    }
    isDone(time) {
        return false;
    }
}
//# sourceMappingURL=animation_controller.js.map