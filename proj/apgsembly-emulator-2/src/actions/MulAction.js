// @ts-check

import { Action } from "./Action.js";

export const MUL_0 = "0";
export const MUL_1 = "1";

/**
 * Action for `MUL`
 */
export class MulAction extends Action {
    /**
     * 
     * @param {"0" | "1"} op 
     */
    constructor(op) {
        super();
        /**
         * @readonly
         */
        this.op = op;
    }

    /**
     * @override
     */
    pretty() {
        return `MUL ${this.op}`;
    }

    /**
     * 
     * @param {string} str 
     * @returns {MulAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/);
        if (array.length !== 2) {
            return undefined;
        }
        const [ mul, op ] = array;
        if (mul !== "MUL") {
            return undefined;
        }
        if (op === "0" || op === "1") {
            return new MulAction(op);
        }
        return undefined;
    }
}
