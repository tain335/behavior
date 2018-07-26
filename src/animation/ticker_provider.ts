export class TickerProvider {

    private _onTick: any;

    private _startTime: any;

    private _scheduleId: number;

    isActive: boolean = true;

    static createTicker(onTick: any): TickerProvider {
        return new TickerProvider(onTick);
    }

    constructor(onTick: any) {
        this._onTick = onTick;
    }

    _tick(timestamp: number) {
        if(!this._startTime) {
            this._startTime = timestamp;
        }
        this._onTick(timestamp - this._startTime);
        if(this.isActive) {
            this._scheduleTick();
        }
    }

    _scheduleTick() {
        this._scheduleId = requestAnimationFrame(this._tick.bind(this));
    }

    start() {
        this.isActive = true;
        this._scheduleTick();
    }

    stop() {
        this._startTime = null;
        if(this._scheduleId) {
            cancelAnimationFrame(this._scheduleId);
            this.isActive = false;
        }
    }

}