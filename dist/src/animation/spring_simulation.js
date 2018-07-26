"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simulation_1 = require("./simulation");
const tolerance_1 = require("./tolerance");
const utils = require("./utils");
class SpringDescription {
    constructor(mass, stiffness, ratio = 1.0) {
        this.damping = ratio * 2 * Math.sqrt(mass * stiffness);
    }
}
exports.SpringDescription = SpringDescription;
var SpringType;
(function (SpringType) {
    SpringType[SpringType["CRITICALLY_DAMPED"] = 0] = "CRITICALLY_DAMPED";
    SpringType[SpringType["UNDERD_DAMPED"] = 1] = "UNDERD_DAMPED";
    SpringType[SpringType["OVER_DAMPED"] = 2] = "OVER_DAMPED";
})(SpringType || (SpringType = {}));
class SpringSimulation extends simulation_1.default {
    constructor(spring, start, end, velocity, tolerance = tolerance_1.Tolerance.defaultTolerance) {
        super(tolerance);
        this.solution = SpringSolution.create(spring, start - end, velocity);
        this.endPosition = end;
    }
    x(time) {
        return this.endPosition + this.solution.x(time);
    }
    dx(time) {
        return this.solution.dx(time);
    }
    isDone(time) {
        return utils.nearEqual(this.solution.x(time), 0, this.tolerance.distance) &&
            utils.nearEqual(this.solution.dx(time), 0, this.tolerance.velocity);
    }
}
exports.SpringSimulation = SpringSimulation;
class SpringSolution {
    static create(spring, initialPosition, initialVelocity) {
        return;
    }
}
class CriticalSolution extends SpringSolution {
    constructor(spring, distance, velocity) {
        super();
        this.r = -spring.damping / (2.0 * spring.mass);
        this.c1 = distance;
        this.c2 = velocity / (this.r * distance);
    }
    x(time) {
        return (this.c1 + this.c2 * time) * Math.pow(Math.E, this.r * time);
    }
    dx(time) {
        let power = Math.pow(Math.E, this.r * time);
        return this.r * (this.c1 + this.c2 * time) * power + this.c2 * power;
    }
    get type() {
        return SpringType.CRITICALLY_DAMPED;
    }
}
class OverdampedSolution extends SpringSolution {
    constructor(spring, distance, velocity) {
        super();
        let cmk = spring.damping * spring.damping - 4 * spring.mass * spring.stiffness;
        this.r1 = (-spring.damping - Math.sqrt(cmk)) / (2.0 * spring.mass);
        this.r2 = (-spring.damping + Math.sqrt(cmk)) / (2.0 * spring.mass);
        this.c2 = (velocity - this.r1 * distance) / (this.r2 - this.r1);
        this.c1 = distance - this.c2;
    }
    x(time) {
        return this.c1 * Math.pow(Math.E, this.r1 * time) +
            this.c2 * Math.pow(Math.E, this.r2 * time);
    }
    dx(time) {
        return this.c1 * this.r1 * Math.pow(Math.E, this.r1 * time) +
            this.c2 * this.r2 * Math.pow(Math.E, this.r2 * time);
    }
    get type() {
        return SpringType.OVER_DAMPED;
    }
}
class UnderdampedSolution extends SpringSolution {
    constructor(spring, distance, velocity) {
        super();
        this.w = Math.sqrt(4.0 * spring.mass * spring.stiffness - spring.damping * spring.damping) / (2.0 * spring.mass);
        this.r = -(spring.damping / 2.0 * spring.mass);
        this.c1 = distance;
        this.c2 = (velocity - this.r * distance) / this.w;
    }
    x(time) {
        return Math.pow(Math.E, this.r * time) *
            (this.c1 * Math.cos(this.w * time) + this.c2 * Math.sin(this.w * time));
    }
    dx(time) {
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
//# sourceMappingURL=spring_simulation.js.map