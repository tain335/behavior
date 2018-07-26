"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tween_1 = require("./tween");
class NumberTween extends tween_1.Tween {
    constructor(begin, end) {
        super(begin, end);
    }
    lerp(t) {
        return this.begin + (this.end - this.begin) * t;
    }
}
exports.NumberTween = NumberTween;
//# sourceMappingURL=tweens.js.map