// @ts-check

import { Action } from "./Action.js";

/**
 * `HALT_OUT` action
 */
export class HaltOutAction extends Action {
    constructor() {
        super();
    }

    /**
     * @override
     * @returns {string}
     */
    pretty() {
        return `HALT_OUT`;
    }

    /**
     * 
     * @param {string} str 
     * @returns {HaltOutAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/);
        if (array.length !== 1) {
            return undefined;
        }
        const [ haltOut ] = array;
        if (haltOut !== "HALT_OUT") {
            return undefined;
        }
        return new HaltOutAction();
    }
}
