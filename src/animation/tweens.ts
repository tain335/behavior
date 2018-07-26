import { Tween } from './tween';

export class NumberTween extends Tween<number> {

    constructor(begin: number, end: number) {
        super(begin, end);
    }

    lerp(t: number): number {
        return this.begin + (this.end - this.begin) * t;
    }

}