// @ts-check

import { Action } from "./Action.js";

/**
 * @type {string}
 */
const HALT_OUT_STRING = `HALT_OUT`;

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
        return HALT_OUT_STRING;
    }

    /**
     *
     * @param {string} str
     * @returns {HaltOutAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 1) {
            return undefined;
        }
        const [haltOut] = array;
        if (haltOut !== HALT_OUT_STRING) {
            return undefined;
        }
        return new HaltOutAction();
    }

    /**
     * 実際には値はどちらでも良い
     * @override
     */
    doesReturnValue() {
        return false;
    }

    /**
     *
     * @override
     * @param {Action} action
     * @returns {boolean}
     */
    isSameComponent(action) {
        return action instanceof HaltOutAction;
    }
}
