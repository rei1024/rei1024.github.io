// @ts-check

import { OutputAction } from "../actions/OutputAction.js";

/**
 * `OUTPUT x`
 */
export class OUTPUT {
    constructor() {
        /**
         * @private
         */
        this.string = "";
    }

    /**
     * @param {OutputAction} act
     * @returns {void}
     */
    action(act) {
        this.output(act.digit);
        return undefined;
    }

    /**
     * @returns {string}
     */
    getString() {
        return this.string;
    }

    /**
     * @param {string} x
     */
    output(x) {
        this.string += x;
    }
}
