// @ts-check

export class Frequency {
    /**
     *
     * @param {() => boolean} isOn
     * @param {() => number} getFrequency
     * @param {(_: number) => void} run
     */
    constructor(isOn, getFrequency, run) {
        /**
         * @private
         */
        this.isOn = isOn;

        /**
         * @private
         */
        this.getFrequency = getFrequency;

        /**
         * @private
         */
        this.run = run;

        /**
         * @private
         */
        this.prevTime = 0;

        /**
         * @private
         */
        this.fractionStep = 0;

        /**
         * @private
         */
        this.isStarted = false;
    }

    reset() {
        this.fractionStep = 0;
    }

    /**
     * @throws {Error} if it is already started
     */
    start() {
        if (this.isStarted) {
            throw Error('already started');
        }

        this.isStarted = true;

        /**
         *
         * @param {number} time
         */
        const update = time => {
            if (this.isOn()) {
                const diff = time - this.prevTime;
                const frequency = this.getFrequency();
                const prevFractionStep = this.fractionStep;
                this.fractionStep += (diff / 1000) * frequency;
                this.run(Math.floor(this.fractionStep) - Math.floor(prevFractionStep));
            }
            this.prevTime = time;
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }
}
