// @ts-check

// @ts-ignore
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";

const App = {
    /**
     * @type {undefined | Machine}
     */
    _machine: undefined,
    /**
     *
     * @param {string} src
     */
    initialize(src) {
        const program = Program.parse(src);
        if (typeof program === 'string') {
            console.error(program);
        } else {
            this._machine = new Machine(program);
        }
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
