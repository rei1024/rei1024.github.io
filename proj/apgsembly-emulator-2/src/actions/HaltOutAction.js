// @ts-check

import { Action } from "./Action.js";

/**
 * @type {string}
 */
const HALT_OUT_STRING = `HALT_OUT`;

/**
 * @type {string}
 */
const HALT_STRING = `HALT`;

/**
 * `HALT_OUT` action
 */
export class HaltOutAction extends Action {
    /**
     * @param {boolean} output
     */
    constructor(output = true) {
        super();
        this.output = output;
    }

    /**
     * @override
     * @returns {string}
     */
    pretty() {
        return this.output ? HALT_OUT_STRING : HALT_STRING;
    }

    /**
     * @param {string} str
     * @returns {HaltOutAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 1) {
            return undefined;
        }
        const [haltOut] = array;
        if (haltOut === HALT_OUT_STRING) {
            return new HaltOutAction(true);
        }
        if (haltOut === HALT_STRING) {
            return new HaltOutAction(false);
        }
        return undefined;
    }

    /**
     * 実際には値はどちらでも良い
     * @override
     */
    doesReturnValue() {
        return false;
    }

    /**
     * @override
     * @param {Action} action
     * @returns {boolean}
     */
    isSameComponent(action) {
        return action instanceof HaltOutAction;
    }
}
