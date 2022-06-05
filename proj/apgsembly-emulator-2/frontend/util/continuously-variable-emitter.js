// @ts-check

export class CVEEvent extends Event {
    /**
     * @param {number} value
     */
    constructor(value) {
        super("emit");

        /**
         * integer
         */
        this.value = value;
    }
}

/**
 * 連続可変エミッター
 */
export class CVE extends EventTarget {
    /**
     * @param {{ frequency: number }} param0
     */
    constructor({ frequency }) {
        super();

        /**
         * frequency of update
         * 周波数[Hz]
         * @private
         */
        this._frequency = frequency;

        /**
         * @private
         */
        this._enabled = false;

        /**
         * @private
         */
        this._fractionStep = 0;

        /**
         * @private
         */
        this._prevTime = -1;

        /**
         *
         * @param {number} time
         */
        const update = time => {
            if (this._enabled && this._prevTime !== -1) {
                const diff = time - this._prevTime;
                const prevFractionStep = this._fractionStep;
                this._fractionStep += (diff / 1000) * this._frequency;
                const value = Math.floor(this._fractionStep) - Math.floor(prevFractionStep);
                this.dispatchEvent(new CVEEvent(value));
            }

            this._prevTime = time;
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    /**
     * @returns {number}
     */
    get frequency() {
        return this._frequency;
    }

    /**
     * @param {number} frequency
     */
    set frequency(frequency) {
        this._frequency = frequency;
    }

    get disabled() {
        return !this._enabled;
    }

    /**
     * default is disabled
     * @param {boolean} value
     */
    set disabled(value) {
        this._enabled = !value;
    }

    enable() {
        this._enabled = true;
    }

    disable() {
        this._enabled = false;
    }

    reset() {
        this._fractionStep = 0;
    }
}
