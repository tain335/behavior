import Simulation from "./simulation";
import { Tolerance } from "./tolerance";
import * as utils from './utils';

export class SpringDescription {
    mass: number;

    stiffness: number;

    damping: number;

    constructor(mass: number, stiffness: number, ratio = 1.0) {
        this.damping = ratio * 2 * Math.sqrt(mass * stiffness);
    }
}

enum SpringType {
    CRITICALLY_DAMPED,
    UNDERD_DAMPED,
    OVER_DAMPED
}


export class SpringSimulation extends Simulation {

    endPosition: number;

    solution: SpringSolution;

    constructor(spring: SpringDescription, start: number, end: number, velocity: number, tolerance: Tolerance = Tolerance.defaultTolerance) {
        super(tolerance);
        this.solution = SpringSolution.create(spring, start - end, velocity);
        this.endPosition = end;
    }

    x(time: number) {
        return this.endPosition + this.solution.x(time);
    }

    dx(time: number) {
        return this.solution.dx(time);
    }

    isDone(time: number) {
        return utils.nearEqual(this.solution.x(time), 0, this.tolerance.distance) &&
            utils.nearEqual(this.solution.dx(time), 0, this.tolerance.velocity);
    }
}

abstract class SpringSolution {

    static create(spring: SpringDescription, initialPosition: number, initialVelocity: number): SpringSolution {
        return;
    }

    abstract x(time: number): number;

    abstract dx(time: number): number;

    abstract get type(): SpringType;
}


class CriticalSolution extends SpringSolution {

    private r: number;

    private c1: number;

    private c2: number;

    constructor(spring: SpringDescription, distance: number, velocity: number) {
        super();
        this.r = -spring.damping / (2.0 * spring.mass);
        this.c1 = distance;
        this.c2 = velocity / (this.r * distance);
    }

    x(time: number): number {
        return (this.c1 + this.c2 * time) * Math.pow(Math.E, this.r * time);
    }

    dx(time: number): number {
        let power = Math.pow(Math.E, this.r * time);
        return this.r * (this.c1 + this.c2 * time) * power + this.c2 * power;
    }

    get type(): SpringType {
        return SpringType.CRITICALLY_DAMPED;
    }

}

class OverdampedSolution extends SpringSolution {


    private r1: number;

    private r2: number;

    private c1: number;

    private c2: number;

    constructor(spring: SpringDescription, distance: number, velocity: number) {
        super();
        let cmk = spring.damping * spring.damping - 4 * spring.mass * spring.stiffness;
        this.r1 = (-spring.damping - Math.sqrt(cmk)) / (2.0 * spring.mass);
        this.r2 = (-spring.damping + Math.sqrt(cmk)) / (2.0 * spring.mass);
        this.c2 = (velocity - this.r1 * distance) / (this.r2 - this.r1);
        this.c1 = distance - this.c2;
    }

    x(time: number) {
        return this.c1 * Math.pow(Math.E, this.r1 * time ) + 
                this.c2 * Math.pow(Math.E, this.r2 * time);
    }

    dx(time: number) {
        return this.c1 * this.r1 * Math.pow(Math.E, this.r1 * time) +
            this.c2 * this.r2 * Math.pow(Math.E, this.r2 * time)
    }
    
    get type(): SpringType {
        return SpringType.OVER_DAMPED;
    }

}

class UnderdampedSolution extends SpringSolution {

    private w: number;

    private r: number;

    private c1: number;

    private c2: number;

    constructor(spring: SpringDescription, distance: number, velocity: number) {
        super();
        this.w = Math.sqrt(4.0 * spring.mass * spring.stiffness - spring.damping * spring.damping) / (2.0 * spring.mass);
        this.r = -(spring.damping / 2.0 * spring.mass);
        this.c1 = distance;
        this.c2 = (velocity - this.r * distance) / this.w;
    }


    x(time: number) {
        return Math.pow(Math.E, this.r * time) *
            (this.c1 * Math.cos(this.w * time) + this.c2 * Math.sin(this.w * time))
    }

    dx(time: number) {
        let power = Math.pow(Math.E, this.r * time);
        let cosine = Math.cos(this.w * time);
        let sine = Math.sin(this.w * time);
        return power * (this.c2 * this.w * cosine - this.c1 * this.w * sine) +
            this.r * power * (this.c2 * sine + this.c1 * cosine);
    }

    get type() {
        return SpringType.UNDERD_DAMPED;
    }

}