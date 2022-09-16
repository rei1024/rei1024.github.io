// @ts-check

// @ts-ignore
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
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
        for (let i = 0; i < n; i++) {
            const res = this._machine?.execCommand();
            if (res === -1) {
                return;
            }
        }
    },
    getOutput() {
        return this._machine?.actionExecutor.output.getString();
    }
};

Comlink.expose(App);
