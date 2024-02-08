// @ts-check

/**
 * 流量調節
 */
export class Valve {
    #fractionStep = 0;
    #prevTime = -1;
    #enabled = false;
    /**
     * frequency of update
     * 周波数[Hz]
     */
    #frequency = 0;
    /**
     * requestAnimationFrameは0を返さない
     * https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames
     */
    #id = 0;
    /**
     * 作成時は非活性状態
     * @param {(value: number) => void} handler
     * @param {{ frequency: number, signal?: AbortSignal }} param0
     */
    constructor(handler, { frequency, signal }) {
        this.#frequency = frequency;
        const raf = requestAnimationFrame;

        /**
         * @param {number} time
         */
        const update = (time) => {
            if (this.#enabled && this.#prevTime !== -1) {
                const diff = time - this.#prevTime;
                const prevFractionStep = this.#fractionStep;
                const nextFractionStep = prevFractionStep +
                    (diff / 1000) * this.#frequency;
                const value = Math.floor(nextFractionStep) -
                    Math.floor(prevFractionStep);
                this.#fractionStep = nextFractionStep;
                handler(value);
            }

            this.#prevTime = time;
            this.#id = raf(update);
        };

        this.#id = raf(update);

        signal?.addEventListener("abort", () => {
            this.abort();
        });
    }

    abort() {
        if (this.#id !== 0) {
            cancelAnimationFrame(this.#id);
        }
    }

    /**
     * @returns {number}
     */
    get frequency() {
        return this.#frequency;
    }

    /**
     * @param {number} frequency
     */
    set frequency(frequency) {
        this.#frequency = frequency;
    }

    get disabled() {
        return !this.#enabled;
    }

    /**
     * @param {boolean} value
     */
    set disabled(value) {
        this.#enabled = !value;
    }

    reset() {
        this.#fractionStep = 0;
    }
}
