import _Animation from './animation';
import { TickerProvider } from './ticker_provider';
import { AnimationStatus, AnimationDirection } from './types';
import Simulation from './simulation';
import * as utils from './utils';
import { Curve, Curves } from './curves';
import { SpringDescription, SpringSimulation } from './spring_simulation';
import { Tolerance } from './tolerance';


let kFlingSpringDescription = new SpringDescription(1.0, 500.0, 1.0);

let kFlingTolerance = new Tolerance(Infinity, 0.01);

export class AnimationController extends _Animation<number> {

    private _value: number;

    private _ticker: TickerProvider;

    private _min: number;
    
    private _max: number;

    private _lastStatus: AnimationStatus;

    private _simulation: Simulation;

    private _lastElapsedTime: number;

    duration: number;

    direction: AnimationDirection

    get progress(): number {
        return this._lastElapsedTime / this.duration;
    }

    get lastElapsedTime(): number {
        return this._lastElapsedTime;
    }

    get isAnimating(): boolean {
        return this._ticker && this._ticker.isActive;
    }

    get velocity(): number {
        if(this.isAnimating) {
            return 0;
        }
        return this._simulation.dx(this._lastElapsedTime);
    }

    constructor(value = 0.0, min = 0.0, max = 1.0, duration = 300, ticker: typeof TickerProvider) {
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

    forward(from?: number) {
        if(from !== undefined) {
            this.value = from;
        }
        this.direction = AnimationDirection.FORWARD;
        this._animateToInternal(this._max);
        return this;
    }

    reverse(from?: number) {
        if(from !== undefined) {
            this.value = from;
        }
        this.direction = AnimationDirection.REVERSE;
        this._animateToInternal(this._min);
        return this;
    }

    stop() {
        //this._simulation = null;
        this._lastElapsedTime = null;
        this._ticker.stop();
        return this;
    }

    repeat(min?: number, max?: number, period?: number) {
        min = min || this._min;
        max = max || this._max;
        period = period || this.duration;
        this._startSimulation(new RepeatSimulation(min, max, period));
        return this;
    }

    animateWith(simulation: Simulation) {
        this.stop();
        this._startSimulation(simulation);
        return this;
    }

    animateTo(target: number, duration: number, curve = Curves.linear) {
        this.direction = AnimationDirection.FORWARD;
        this._animateToInternal(target, duration, curve);
        return this;
    }

    setProgress(progress: number) {
        progress = utils.clamp(progress, 0, 1);
        this.value = utils.clamp(this._simulation.x(this.duration * progress), this._min, this._max);
        return this;
    }

    setSimulation(simulation: Simulation) {
        this._simulation = simulation;
        return this;
    }

    fling(velocity = 1.0) {
        this.direction = this.velocity < 0.0 ? AnimationDirection.REVERSE : AnimationDirection.FORWARD;
        let target = velocity < 0.0 ? this._min - kFlingTolerance.distance : this._max + kFlingTolerance.distance;
        let simulation = new SpringSimulation(kFlingSpringDescription, this.value, target, velocity);
        simulation.tolerance = kFlingTolerance;
        return this.animateWith(simulation);
    }

    _checkStatusChanged() {
        if(this._lastStatus != this.status) {
            this._lastStatus = this.status;
            this.notifyStatusListeners(this.status);
        }
    }

    _animateToInternal(target: number, duration?: number, curve: Curve = Curves.linear) {
        if(duration === undefined) {
            let range = this._max - this._min;
            duration = Math.abs(target - this._value)  / range * this.duration;
        } else if (target == this._value) {
            duration = 0;
        }
        this.stop();
        if(duration === 0) {
            if(this._value != target) {
                this._value = utils.clamp(target, this._min, this._max);
                this.notifyListeners();
            }
            this.status = this.direction == AnimationDirection.FORWARD ? 
                AnimationStatus.COMPLETED:
                AnimationStatus.DISMISSED;
            return;
        }
        return this._startSimulation(new InterpolationSimulation(this._value, target, duration, curve));
    }

    _startSimulation(simulation: Simulation) {
        this._lastElapsedTime = 0.0;
        this._simulation = simulation;
        this._value = utils.clamp(simulation.x(0), this._min, this._max);
        this._ticker.start();
        this.status = (this.direction == AnimationDirection.FORWARD) ?
            AnimationStatus.FORWARD:
            AnimationStatus.REVERSE;
        this._checkStatusChanged();
    }

    _setValue(value: number) {
        this._value = utils.clamp(value, this._min, this._max);
        if(this._value == this._min) {
            this.status = AnimationStatus.DISMISSED; 
        } else if (this._value == this._max) {
            this.status = AnimationStatus.COMPLETED;
        } else {
            this.status = this.direction ==  AnimationDirection.FORWARD ?
                AnimationStatus.FORWARD : AnimationStatus.REVERSE;
        }
        this._checkStatusChanged();
    }

    _tick(elapsed: number) {
        this._lastElapsedTime = elapsed;
        this._value = utils.clamp(this._simulation.x(elapsed), this._min, this._max);
        if(this._simulation.isDone(elapsed)) {
            this.status = (this.direction == AnimationDirection.FORWARD) ?
                AnimationStatus.COMPLETED:
                AnimationStatus.DISMISSED
            this.stop();
        }
        this.notifyListeners();
        this._checkStatusChanged();
    }

    get value() {
        return this._value;
    }

    set value(value: number) {
        this.stop();
        this._setValue(value);
        this.notifyListeners();
    }
}


class InterpolationSimulation extends Simulation {

    private _begin: number;

    private _end: number;

    private _duration: number;

    private _curve: Curve;


    constructor(begin: number, end: number, duration: number, curve: Curve) {
        super();
        this._begin = begin;
        this._end = end;
        this._duration = duration;
        this._curve = curve;
    }

    x(time: number): number {
        let t = utils.clamp(time / this._duration, 0.0, 1.0);
        if(t == 0.0) {
            return this._begin
        } else if(t == 1.0) {
            return this._end;
        } else {
            return this._begin + (this._end - this._begin) * this._curve.transform(t);
        }
    }

    dx(time: number): number {
        let epsilon = this.tolerance.time;
        return (this.x(time + epsilon) - this.x(time - epsilon)) / (2 * epsilon);
    }

    isDone(time: number): boolean {
        return time > this._duration;
    }

}

class RepeatSimulation extends Simulation {

    min: number;

    max: number;

    period: number;

    constructor(min: number, max: number, period: number) {
        super();
        this.min = min;
        this.max = max;
        this.period = period;
    }

    x(time: number): number {
        let t = (time / this.period) % 1;
        return this.min + (this.max - this.min) * t;
    }

    dx(time: number): number {
        return (this.max - this.min) / this.period;
    }

    isDone(time: number): boolean {
        return false;
    }

}
