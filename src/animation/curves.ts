import * as utils from './utils';

export abstract class Curve {
    // 0.0 <= t <= 1.0
    //must map t=0.0 to 0.0 and t=1.0 to 1.0
    abstract transform(t: number): number;

    /// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_bounce_in.png)
    /// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_flipped.png)
    get flipped(): Curve {
        return new FlippedCurve(this);
    }
}

class FlippedCurve extends Curve {

    curve: Curve;

    constructor(curve: Curve) {
        super();
        this.curve = curve;
    }

    transform(t: number): number {
        return 1.0 - this.curve.transform(1.0 - t);
    }

}


class Linear extends Curve {
    transform(t: number): number {
        return t;
    }
}

/// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_sawtooth.png)
class SawTooth extends Curve {

    count: number;

    constructor(count: number) {
        super();
        this.count = count;
    }

    transform(t: number): number {
        if(t == 1.0) return 1.0;
        t *= this.count;
        return t - Math.ceil(t);
    }

}

/// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_interval.png)
class Interval extends Curve {

    begin: number;

    end: number;

    curve: Curve;

    constructor(begin: number, end: number, curve: Curve) {
        super();
        this.begin = begin;
        this.end = end;
        this.curve = curve;
    }

    transform(t: number): number {
        if(t == 0.0 || t == 1.0) {
            return t;
        }

        t = utils.clamp((t - this.begin) / (this.end - this.begin), 0.0, 1.0);
        if(t == 0.0 || t == 1.0) {
            return t;
        }
        return this.curve.transform(t);
    }

}

/// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_threshold.png)
class Threshold extends Curve {

    threshold: number;

    constructor(threshold: number) {
        super();
        this.threshold = threshold;
    }


    transform(t: number): number {
        if(t == 0.0 || t == 1.0) {
            return t;
        }
        return t < this.threshold ? 0.0 : 1.0;
    }

}

/// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_ease.png)
/// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_ease_in.png)
/// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_ease_out.png)
/// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_ease_in_out.png)
class Cubic extends Curve {

    a: number;

    b: number;

    c: number;

    d: number;

    _cubicErrorBound = 0.001;

    constructor(a: number, b: number, c: number, d: number) {
        super();
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    _evaluateCubic(a: number, b: number, m: number) {
        return 3 * a * (1 - m) * (1 - m) * m + 
            3 * b * (1 - m) * m * m + m * m * m;
    }

    transform(t: number): number {
        let start = 0.0;
        let end = 1.0;
        while(true) {
            let midpoint = (start + end) / 2;
            let estimate = this._evaluateCubic(this.a, this.c, midpoint);
            if(Math.abs(t - estimate) < this._cubicErrorBound) {
                return this._evaluateCubic(this.b, this.d, midpoint);
            }
            if(estimate < t) {
                start = midpoint;
            } else {
                end = midpoint;
            }
        }
    }

}


class DecelerateCurve extends Curve {
    // Intended to match the behavior of:
    // https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/view/animation/DecelerateInterpolator.java
    // ...as of December 2016.
    transform(t: number): number {
        t = 1.0 - t;
        return 1.0 - t * t;
    }

}

function _bounce(t: number) {
    if (t < 1.0 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    }
    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
}


class BounceInCurve extends Curve {

    transform(t: number): number {
        return 1.0 - _bounce(1.0 - t);
    }

}

class BounceOutCurve extends Curve {

    transform(t: number): number {
        return _bounce(t);
    }

}


class BounceInOutCurve extends Curve {

    transform(t: number): number {
        if (t < 0.5) {
            return (1.0 - _bounce(1.0 - t)) * 0.5;
        } else {
            return _bounce(t * 2.0 - 1.0) * 0.5 + 0.5;
        }
    }
}

/// ![](https://flutter.github.io/assets-for-api-docs/assets/animation/curve_elastic_in.png)
class ElasticInCurve extends Curve {

    period: number;

    constructor(period = 0.4) {
        super();
        this.period = period;
    }

    transform(t: number) {
        let s = this.period / 4.0;
        t = t - 1.0
        return -Math.pow(2.0, 10.0 * t) * Math.sin((t - s) * (Math.PI * 2.0) / this.period);
    }
}

class ElasticOutCurve extends Curve {

    period: number;

    constructor(period = 0.4) {
        super();
        this.period = period;
    }

    transform(t: number) {
        let s = this.period / 4.0;
        return Math.pow(2.0, -10 * t) * Math.sin((t - s) * (Math.PI * 2.0) / this.period) + 1.0;
    }

}

class ElasticInOutCurve extends Curve {
    
    period: number;

    constructor(period = 0.4) {
        super();
        this.period = period;
    }

    transform(t: number) {
        let s = this.period / 4.0;
        t = 2.0 * t - 1.0;
        if (t < 0.0) {
            return -0.5 * Math.pow(2.0, 10.0 * t) * Math.sin((t - s) * (Math.PI * 2.0) / this.period);
        } else {
            return Math.pow(2.0, -10.0 * t) * Math.sin((t - s) * (Math.PI * 2.0) / this.period) * 0.5 + 1.0;
        }
    }

}

export class Curves {

    static linear = new Linear();

    static decelerate = new DecelerateCurve();

    static ease = new Cubic(0.25, 0.1, 0.25, 1.0);

    static easeIn = new Cubic(0.42, 0.0, 1.0, 1.0);

    static easeOut = new Cubic(0.0, 0.0, 0.58, 1.0);

    static easeInOut = new Cubic(0.42, 0.0, 0.58, 1.0);

    static fastOutSlowIn = new Cubic(0.4, 0.0, 0.2, 1.0);

    static bounceIn = new BounceInCurve();

    static bounceOut = new BounceOutCurve();

    static bounceInOut = new BounceInOutCurve();

    static elasticIn = new ElasticInCurve();

    static elasticOut = new ElasticOutCurve();

    static elasticInOut = new ElasticInOutCurve();
}