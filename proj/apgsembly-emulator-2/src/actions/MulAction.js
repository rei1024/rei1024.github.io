// @ts-check

import { Action } from "./Action.js";

export const MUL_0 = 0;
export const MUL_1 = 1;

const MUL_0_STRING = "0";
const MUL_1_STRING = "1";

/**
 * @typedef {MUL_0 | MUL_1} MulOp
 */

/**
 * @typedef {MUL_0_STRING | MUL_1_STRING} MulOpString
 */

/**
 * 
 * @param {MulOpString} op
 * @returns {MulOp}
 */
function parseOp(op) {
    switch (op) {
        case MUL_0_STRING: return MUL_0;
        case MUL_1_STRING: return MUL_1;
    }
}

/**
 * 
 * @param {MulOp} op
 * @returns {MulOpString}
 */
 function prettyOp(op) {
    switch (op) {
        case MUL_0: return MUL_0_STRING;
        case MUL_1: return MUL_1_STRING;
    }
}

/**
 * Action for `MUL`
 */
export class MulAction extends Action {
    /**
     * 
     * @param {MulOp} op 
     */
    constructor(op) {
        super();
        /**
         * @type {MulOp}
         * @readonly
         */
        this.op = op;
    }

    /**
     * @override
     */
    pretty() {
        return `MUL ${prettyOp(this.op)}`;
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
        if (op === MUL_0_STRING || op === MUL_1_STRING) {
            return new MulAction(parseOp(op));
        }
        return undefined;
    }

    /**
     * @override
     */
    doesReturnValue() {
        return true;
    }
}
