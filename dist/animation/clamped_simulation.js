"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simulation_1 = require("./simulation");
const util = require("./utils");
class ClampedSimulation extends simulation_1.default {
    constructor(simulation, opts = { xMin: Infinity, xMax: Infinity, dxMin: Infinity, dxMax: Infinity }) {
        super();
        this.simulation = simulation;
        this.xMin = opts.xMin;
        this.xMax = opts.xMax;
        this.dxMin = opts.dxMin;
        this.dxMax = opts.dxMax;
    }
    x(time) {
        return util.clamp(this.simulation.x(time), this.xMin, this.xMax);
    }
    dx(time) {
        return util.clamp(this.simulation.dx(time), this.dxMin, this.dxMax);
    }
    isDone(time) {
        return this.simulation.isDone(time);
    }
}
//# sourceMappingURL=clamped_simulation.js.map