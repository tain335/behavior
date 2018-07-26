import Simulation from "./simulation";
import * as util from './utils';

class ClampedSimulation extends Simulation {

    private simulation: Simulation;

    private xMin: number;

    private xMax: number;

    private dxMin: number;

    private dxMax: number;

    constructor(simulation: Simulation, opts: {
        xMin: number, 
        xMax: number,
        dxMin: number,
        dxMax: number
    } = {xMin: Infinity, xMax: Infinity, dxMin: Infinity, dxMax: Infinity}) {
        super();
        this.simulation = simulation;
        this.xMin = opts.xMin;
        this.xMax = opts.xMax;
        this.dxMin = opts.dxMin;
        this.dxMax = opts.dxMax;
    }

    x(time: number): number {
        return util.clamp(this.simulation.x(time), this.xMin, this.xMax);
    }

    dx(time: number): number {
        return util.clamp(this.simulation.dx(time), this.dxMin, this.dxMax);
    }

    isDone(time: number): boolean {
        return this.simulation.isDone(time);
    }

}