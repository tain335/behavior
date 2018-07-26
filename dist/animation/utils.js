"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function clamp(value, min, max) {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}
exports.clamp = clamp;
function nearEqual(a, b, epsilon) {
    return (a > (b - epsilon)) && (a < (b + epsilon)) || a == b;
}
exports.nearEqual = nearEqual;
//# sourceMappingURL=utils.js.map