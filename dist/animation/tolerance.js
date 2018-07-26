"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tolerance {
    constructor(distance = 1e-3, velocity = 1e-3, time = 1e-3) {
        this.distance = distance;
        this.time = time;
        this.velocity = velocity;
    }
}
Tolerance.defaultTolerance = new Tolerance();
exports.Tolerance = Tolerance;
//# sourceMappingURL=tolerance.js.map