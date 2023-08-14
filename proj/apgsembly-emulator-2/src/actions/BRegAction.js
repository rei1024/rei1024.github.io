// @ts-check

import { B_INC, B_READ, B_SET, B_TDEC } from "../action_consts/BReg_consts.js";
import { Action } from "./Action.js";

const B_INC_STRING = "INC";
const B_TDEC_STRING = "TDEC";
const B_READ_STRING = "READ";
const B_SET_STRING = "SET";

const B_STRING = "B";

/**
 * @typedef {B_INC | B_TDEC | B_READ | B_SET} BOp
 */

/**
 * @typedef {B_INC_STRING | B_TDEC_STRING |
 *          B_READ_STRING | B_SET_STRING} BOpString
 */

/**
 * @param {BOp} op
 * @returns {BOpString}
 */
function prettyOp(op) {
    switch (op) {
        case B_INC:
            return B_INC_STRING;
        case B_TDEC:
            return B_TDEC_STRING;
        case B_READ:
            return B_READ_STRING;
        case B_SET:
            return B_SET_STRING;
    }
}

/**
 * @param {BOpString} op
 * @returns {BOp}
 */
function parseOp(op) {
    switch (op) {
        case B_INC_STRING:
            return B_INC;
        case B_TDEC_STRING:
            return B_TDEC;
        case B_READ_STRING:
            return B_READ;
        case B_SET_STRING:
            return B_SET;
    }
}

/**
 * Action for `Bn`
 */
export class BRegAction extends Action {
    /**
     * @param {BOp} op
     * @param {number} regNumber
     */
    constructor(op, regNumber) {
        super();

        /**
         * @type {BOp}
         * @readonly
         */
        this.op = op;

        /**
         * @readonly
         */
        this.regNumber = regNumber;

        /**
         * @type {import('../components/BReg.js').BReg | undefined}
         */
        this.registerCache = undefined;
    }

    /**
     * @override
     */
    pretty() {
        return `${prettyOp(this.op)} ${B_STRING}${this.regNumber}`;
    }

    /**
     * @param {string} str
     * @returns {BRegAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [op, reg] = array;
        if (op === undefined || reg === undefined) {
            return undefined;
        }
        if (
            op === B_INC_STRING || op === B_TDEC_STRING ||
            op === B_READ_STRING || op === B_SET_STRING
        ) {
            if (reg.startsWith(B_STRING)) {
                const str = reg.slice(1);
                if (/^[0-9]+$/u.test(str)) {
                    return new BRegAction(parseOp(op), parseInt(str, 10));
                }
            }
        }
        return undefined;
    }

    /**
     * @override
     */
    doesReturnValue() {
        switch (this.op) {
            case B_INC:
                return false;
            case B_TDEC:
                return true;
            case B_READ:
                return true;
            case B_SET:
                return false;
        }
    }

    /**
     * @override
     * @param {Action} action
     * @returns {boolean}
     */
    isSameComponent(action) {
        if (action instanceof BRegAction) {
            return this.regNumber === action.regNumber;
        } else {
            return false;
        }
    }
}
