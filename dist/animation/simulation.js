"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tolerance_1 = require("./tolerance");
class Simulation {
    constructor(tolerance) {
        if (!tolerance) {
            this.tolerance = new tolerance_1.Tolerance();
        }
    }
}
exports.default = Simulation;
//# sourceMappingURL=simulation.js.map