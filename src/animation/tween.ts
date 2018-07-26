import _Animation from './animation';
import { AlwaysStoppedAnimation } from './animations';

export abstract class Animatable<T> {
    abstract evaluate(animation: _Animation<number>): T;

    animate(parent :_Animation<number>) {
        return new _AnimatedEvaluation<T>(parent, this);
    }

    chain(parent: Animatable<number>): Animatable<T> {
        return new _ChainedEvaluation<T>(parent, this);
    }
}

class _AnimatedEvaluation<T> extends _Animation<T> {

    parent: _Animation<number>;

    evaluatable: Animatable<T>;

    constructor(parent: _Animation<number>, evaluatable: Animatable<T>) {
        super();
        this.parent = parent;
        this.evaluatable = evaluatable;
    }

    get value(): T {
        return this.evaluatable.evaluate(this.parent);
    }

    addEventListener(listener: any): void {
        this.parent.addListener(listener);
    }

    removeListener(listener: any): void {
        this.parent.removeListener(listener);
    }

    addStatusListener(listener: any): void {
        this.parent.removeStatusListener(listener);
    }

    removeStatusListener(listener: any): void {
        this.parent.removeStatusListener(listener);
    }

}

class _ChainedEvaluation<T> extends Animatable<T> {

    parent: Animatable<number>;

    evaluatable: Animatable<T>;


    constructor(parent: Animatable<number>, evaluatable: Animatable<T>) {
        super();
        this.parent = parent;
        this.evaluatable = evaluatable;
    }

    evaluate(animation: _Animation<number>): T {
        let value = this.parent.evaluate(animation);;
        return this.evaluatable.evaluate(new AlwaysStoppedAnimation(value));
    }

}

export abstract class Tween<T> extends Animatable<T> {

    begin: T;
    
    end: T;

    constructor(begin: T, end: T) {
        super();
        this.begin = begin;
        this.end = end;
    }

    abstract lerp(t: number): T;

    evaluate(animation: _Animation<number>): T {
        let t = animation.value;
        if(t == 0) {
            return this.begin;
        }
        if(t == 1.0) {
            return this.end;
        }
        return this.lerp(t);
    }
}

export abstract class ReverseTween<T> extends Tween<T> {

    parent: Tween<T>;

    constructor(parent: Tween<T>) {
        super(parent.begin, parent.end);
    }

    lerp(t: number): T {
        return this.parent.lerp(1.0 - t);
    }
}

