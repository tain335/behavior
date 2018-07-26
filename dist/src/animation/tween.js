"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const animation_1 = require("./animation");
const animations_1 = require("./animations");
class Animatable {
    animate(parent) {
        return new _AnimatedEvaluation(parent, this);
    }
    chain(parent) {
        return new _ChainedEvaluation(parent, this);
    }
}
exports.Animatable = Animatable;
class _AnimatedEvaluation extends animation_1.default {
    constructor(parent, evaluatable) {
        super();
        this.parent = parent;
        this.evaluatable = evaluatable;
    }
    get value() {
        return this.evaluatable.evaluate(this.parent);
    }
    addEventListener(listener) {
        this.parent.addListener(listener);
    }
    removeListener(listener) {
        this.parent.removeListener(listener);
    }
    addStatusListener(listener) {
        this.parent.removeStatusListener(listener);
    }
    removeStatusListener(listener) {
        this.parent.removeStatusListener(listener);
    }
}
class _ChainedEvaluation extends Animatable {
    constructor(parent, evaluatable) {
        super();
        this.parent = parent;
        this.evaluatable = evaluatable;
    }
    evaluate(animation) {
        let value = this.parent.evaluate(animation);
        ;
        return this.evaluatable.evaluate(new animations_1.AlwaysStoppedAnimation(value));
    }
}
class Tween extends Animatable {
    constructor(begin, end) {
        super();
        this.begin = begin;
        this.end = end;
    }
    evaluate(animation) {
        let t = animation.value;
        if (t == 0) {
            return this.begin;
        }
        if (t == 1.0) {
            return this.end;
        }
        return this.lerp(t);
    }
}
exports.Tween = Tween;
class ReverseTween extends Tween {
    constructor(parent) {
        super(parent.begin, parent.end);
    }
    lerp(t) {
        return this.parent.lerp(1.0 - t);
    }
}
exports.ReverseTween = ReverseTween;
//# sourceMappingURL=tween.js.map