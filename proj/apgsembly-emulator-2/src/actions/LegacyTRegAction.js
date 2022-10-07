// @ts-check

import { Action } from "./Action.js";

export const T_INC = 0;
export const T_DEC = 1;
export const T_READ = 2;
export const T_SET = 3;
export const T_RESET = 4;

const T_INC_STRING = "INC";
const T_DEC_STRING = "DEC";
const T_READ_STRING = "READ";
const T_SET_STRING = "SET";
const T_RESET_STRING = "RESET";

/**
 * @typedef {T_INC | T_DEC | T_READ | T_SET | T_RESET} TOp
 */

/**
 * @typedef {T_INC_STRING | T_DEC_STRING |
 *          T_READ_STRING | T_SET_STRING | T_RESET_STRING} TOpString
 */

/**
 *
 * @param {TOp} op
 * @returns {TOpString}
 */
function prettyOp(op) {
    switch (op) {
        case T_INC: return T_INC_STRING;
        case T_DEC: return T_DEC_STRING;
        case T_READ: return T_READ_STRING;
        case T_SET: return T_SET_STRING;
        case T_RESET: return T_RESET_STRING;
    }
}

/**
 *
 * @param {TOpString} op
 * @returns {TOp}
 */
function parseOp(op) {
    switch (op) {
        case T_INC_STRING: return T_INC;
        case T_DEC_STRING: return T_DEC;
        case T_READ_STRING: return T_READ;
        case T_SET_STRING: return T_SET;
        case T_RESET_STRING: return T_RESET;
    }
}

/**
 * Action for `Tn`
 */
export class LegacyTRegAction extends Action {
    /**
     *
     * @param {TOp} op
     * @param {number} regNumber
     */
    constructor(op, regNumber) {
        super();

        /**
         * @type {TOp}
         * @readonly
         */
        this.op = op;

        /**
         * @readonly
         */
        this.regNumber = regNumber;
    }

    /**
     * @override
     * @returns {number[]}
     */
    extractLegacyTRegisterNumbers() {
        return [this.regNumber];
    }

    /**
     * @override
     */
    pretty() {
        return `${prettyOp(this.op)} T${this.regNumber}`;
    }

    /**
     * @param {string} str
     * @returns {LegacyTRegAction | undefined}
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
        if (op === T_INC_STRING || op === T_DEC_STRING ||
            op === T_READ_STRING || op === T_SET_STRING || op === T_RESET_STRING) {
            if (reg.startsWith("T")) {
                const str = reg.slice(1);
                if (/^[0-9]+$/u.test(str)) {
                    return new LegacyTRegAction(parseOp(op), parseInt(str, 10));
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
            case T_INC: return true;
            case T_DEC: return true;
            case T_READ: return true;
            case T_SET: return false;
            case T_RESET: return false;
        }
    }

    /**
     *
     * @override
     * @param {Action} action
     * @returns {boolean}
     */
    isSameComponent(action) {
        if (action instanceof LegacyTRegAction) {
            return this.regNumber === action.regNumber;
        } else {
            return false;
        }
    }
}
