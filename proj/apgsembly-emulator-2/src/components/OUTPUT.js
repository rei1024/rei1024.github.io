// @ts-check

import { OutputAction } from "../actions/OutputAction.js";

/**
 * @typedef {"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "."} Digit
 */

export class OUTPUT {
    constructor() {
        /**
         * @private
         */
        this.string = "";
    }

    /**
     * 
     * @param {OutputAction} act 
     * @returns {void}
     */
    action(act) {
        this.output(act.digit);
        return undefined;
    }

    /**
     * 
     * @returns {string}
     */
    getString() {
        return this.string;
    }

    /**
     * 
     * @param {Digit} x 
     */
    output(x) {
        this.string += x;
    }
}
