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
     * 作成時は非活性状態
     * @param {{ frequency: number, signal?: AbortSignal }} param0
     */
    constructor({ frequency, signal }) {
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
         * requestAnimationFrameは0を返さない
         * https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames
         * @private
         * @type {number}
         */
        this._id = 0;

        const raf = requestAnimationFrame;

        /**
         *
         * @param {number} time
         */
        const update = time => {
            if (this._enabled && this._prevTime !== -1) {
                const diff = time - this._prevTime;
                const prevFractionStep = this._fractionStep;
                const nextFractionStep = prevFractionStep + (diff / 1000) * this._frequency;
                const value = Math.floor(nextFractionStep) - Math.floor(prevFractionStep);
                this._fractionStep = nextFractionStep;
                this.dispatchEvent(new CVEEvent(value));
            }

            this._prevTime = time;
            this._id = raf(update);
        };

        this._id = raf(update);

        if (signal !== undefined) {
            signal.addEventListener('abort', () => {
                this.abort();
            });
        }
    }

    abort() {
        if (this._id !== 0) {
            cancelAnimationFrame(this._id);
        }
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
     * @param {boolean} value
     */
    set disabled(value) {
        this._enabled = !value;
    }

    reset() {
        this._fractionStep = 0;
    }
}
