export function clamp(value: number, min: number, max: number): number {
    if(value < min) {
        return min;
    }
    if(value > max) {
        return max;
    }
    return value;
}

export function nearEqual(a: number, b: number, epsilon: number) {
    return (a > (b - epsilon)) && (a < (b + epsilon)) || a == b;
}