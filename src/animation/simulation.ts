import { Tolerance } from './tolerance';

export default abstract class Simulation {
    tolerance: Tolerance;

    abstract x(time: number): number;

    abstract dx(time: number): number;

    abstract isDone(time: number): boolean;
    
    constructor(tolerance?: Tolerance) {
        if(!tolerance) {
            this.tolerance = new Tolerance();
        }
    }
}