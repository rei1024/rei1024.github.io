// @ts-check

import { Action } from "./Action.js";

/**
 * `NOP` action
 */
export class NopAction extends Action {
    constructor() {
        super();
    }

    /**
     * @override
     * @returns {string}
     */
    pretty() {
        return `NOP`;
    }

    /**
     *
     * @param {string} str
     * @returns {NopAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 1) {
            return undefined;
        }
        const [nop] = array;
        if (nop !== "NOP") {
            return undefined;
        }
        return new NopAction();
    }

    /**
     *
     * @returns @override
     */
    doesReturnValue() {
        return true;
    }

    /**
     *
     * @override
     * @param {Action} action
     * @returns {boolean}
     */
    isSameComponent(action) {
        return action instanceof NopAction;
    }
}
