export class Tolerance {

    distance: number;

    time: number;

    velocity: number;

    constructor(distance = 1e-3, velocity = 1e-3, time = 1e-3) {
        this.distance = distance;
        this.time = time;
        this.velocity = velocity;
    }

    static defaultTolerance: Tolerance = new Tolerance();
}