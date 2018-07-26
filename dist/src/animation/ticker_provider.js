"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TickerProvider {
    constructor(onTick) {
        this.isActive = true;
        this._onTick = onTick;
    }
    static createTicker(onTick) {
        return new TickerProvider(onTick);
    }
    _tick(timestamp) {
        if (!this._startTime) {
            this._startTime = timestamp;
        }
        this._onTick(timestamp - this._startTime);
        if (this.isActive) {
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
        if (this._scheduleId) {
            cancelAnimationFrame(this._scheduleId);
            this.isActive = false;
        }
    }
}
exports.TickerProvider = TickerProvider;
//# sourceMappingURL=ticker_provider.js.map