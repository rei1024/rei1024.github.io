// @ts-check

/**
 * 流量調節
 */
export class Valve extends EventTarget {
    #fractionStep = 0;
    #prevTime = -1;
    /**
     * 作成時は非活性状態
     * @param {(value: number) => void} handler
     * @param {{ frequency: number, signal?: AbortSignal }} param0
     */
    constructor(handler, { frequency, signal }) {
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
         * requestAnimationFrameは0を返さない
         * https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames
         * @private
         * @type {number}
         */
        this._id = 0;

        const raf = requestAnimationFrame;

        /**
         * @param {number} time
         */
        const update = (time) => {
            if (this._enabled && this.#prevTime !== -1) {
                const diff = time - this.#prevTime;
                const prevFractionStep = this.#fractionStep;
                const nextFractionStep = prevFractionStep +
                    (diff / 1000) * this._frequency;
                const value = Math.floor(nextFractionStep) -
                    Math.floor(prevFractionStep);
                this.#fractionStep = nextFractionStep;
                handler(value);
            }

            this.#prevTime = time;
            this._id = raf(update);
        };

        this._id = raf(update);

        signal?.addEventListener("abort", () => {
            this.abort();
        });
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
        this.#fractionStep = 0;
    }
}
