// @ts-check

// @ts-ignore
import * as Comlink from "https://unpkg.com/comlink@4.3.1/dist/esm/comlink.mjs";
import { Machine } from "../../src/Machine.js";

export const App = {
    /**
     * @private
     * @type {undefined | Machine}
     */
    _machine: undefined,
    /**
     *
     * @param {string} src
     */
    initialize(src) {
        this._machine = Machine.fromString(src);
    },
    /**
     *
     * @param {number} n
     * @returns
     */
    run(n) {
        if (this._machine === undefined) {
            return;
        }
        const machine = this._machine;
        machine.exec(n, false, -1, -1);
    },
    getOutput() {
        return this._machine?.actionExecutor.output.getString();
    },
    getSteps() {
        return this._machine?.stepCount;
    }
};

Comlink.expose(App);
