"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("./utils");
class Curve {
    get flipped() {
        return new FlippedCurve(this);
    }
}
exports.Curve = Curve;
class FlippedCurve extends Curve {
    constructor(curve) {
        super();
        this.curve = curve;
    }
    transform(t) {
        return 1.0 - this.curve.transform(1.0 - t);
    }
}
class Linear extends Curve {
    transform(t) {
        return t;
    }
}
class SawTooth extends Curve {
    constructor(count) {
        super();
        this.count = count;
    }
    transform(t) {
        if (t == 1.0)
            return 1.0;
        t *= this.count;
        return t - Math.ceil(t);
    }
}
class Interval extends Curve {
    constructor(begin, end, curve) {
        super();
        this.begin = begin;
        this.end = end;
        this.curve = curve;
    }
    transform(t) {
        if (t == 0.0 || t == 1.0) {
            return t;
        }
        t = utils.clamp((t - this.begin) / (this.end - this.begin), 0.0, 1.0);
        if (t == 0.0 || t == 1.0) {
            return t;
        }
        return this.curve.transform(t);
    }
}
class Threshold extends Curve {
    constructor(threshold) {
        super();
        this.threshold = threshold;
    }
    transform(t) {
        if (t == 0.0 || t == 1.0) {
            return t;
        }
        return t < this.threshold ? 0.0 : 1.0;
    }
}
class Cubic extends Curve {
    constructor(a, b, c, d) {
        super();
        this._cubicErrorBound = 0.001;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
    _evaluateCubic(a, b, m) {
        return 3 * a * (1 - m) * (1 - m) * m +
            3 * b * (1 - m) * m * m + m * m * m;
    }
    transform(t) {
        let start = 0.0;
        let end = 1.0;
        while (true) {
            let midpoint = (start + end) / 2;
            let estimate = this._evaluateCubic(this.a, this.c, midpoint);
            if (Math.abs(t - estimate) < this._cubicErrorBound) {
                return this._evaluateCubic(this.b, this.d, midpoint);
            }
            if (estimate < t) {
                start = midpoint;
            }
            else {
                end = midpoint;
            }
        }
    }
}
class DecelerateCurve extends Curve {
    transform(t) {
        t = 1.0 - t;
        return 1.0 - t * t;
    }
}
function _bounce(t) {
    if (t < 1.0 / 2.75) {
        return 7.5625 * t * t;
    }
    else if (t < 2 / 2.75) {
        t -= 1.5 / 2.75;
        return 7.5625 * t * t + 0.75;
    }
    else if (t < 2.5 / 2.75) {
        t -= 2.25 / 2.75;
        return 7.5625 * t * t + 0.9375;
    }
    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
}
class BounceInCurve extends Curve {
    transform(t) {
        return 1.0 - _bounce(1.0 - t);
    }
}
class BounceOutCurve extends Curve {
    transform(t) {
        return _bounce(t);
    }
}
class BounceInOutCurve extends Curve {
    transform(t) {
        if (t < 0.5) {
            return (1.0 - _bounce(1.0 - t)) * 0.5;
        }
        else {
            return _bounce(t * 2.0 - 1.0) * 0.5 + 0.5;
        }
    }
}
class ElasticInCurve extends Curve {
    constructor(period = 0.4) {
        super();
        this.period = period;
    }
    transform(t) {
        let s = this.period / 4.0;
        t = t - 1.0;
        return -Math.pow(2.0, 10.0 * t) * Math.sin((t - s) * (Math.PI * 2.0) / this.period);
    }
}
class ElasticOutCurve extends Curve {
    constructor(period = 0.4) {
        super();
        this.period = period;
    }
    transform(t) {
        let s = this.period / 4.0;
        return Math.pow(2.0, -10 * t) * Math.sin((t - s) * (Math.PI * 2.0) / this.period) + 1.0;
    }
}
class ElasticInOutCurve extends Curve {
    constructor(period = 0.4) {
        super();
        this.period = period;
    }
    transform(t) {
        let s = this.period / 4.0;
        t = 2.0 * t - 1.0;
        if (t < 0.0) {
            return -0.5 * Math.pow(2.0, 10.0 * t) * Math.sin((t - s) * (Math.PI * 2.0) / this.period);
        }
        else {
            return Math.pow(2.0, -10.0 * t) * Math.sin((t - s) * (Math.PI * 2.0) / this.period) * 0.5 + 1.0;
        }
    }
}
class Curves {
}
Curves.linear = new Linear();
Curves.decelerate = new DecelerateCurve();
Curves.ease = new Cubic(0.25, 0.1, 0.25, 1.0);
Curves.easeIn = new Cubic(0.42, 0.0, 1.0, 1.0);
Curves.easeOut = new Cubic(0.0, 0.0, 0.58, 1.0);
Curves.easeInOut = new Cubic(0.42, 0.0, 0.58, 1.0);
Curves.fastOutSlowIn = new Cubic(0.4, 0.0, 0.2, 1.0);
Curves.bounceIn = new BounceInCurve();
Curves.bounceOut = new BounceOutCurve();
Curves.bounceInOut = new BounceInOutCurve();
Curves.elasticIn = new ElasticInCurve();
Curves.elasticOut = new ElasticOutCurve();
Curves.elasticInOut = new ElasticInOutCurve();
exports.Curves = Curves;
//# sourceMappingURL=curves.js.map