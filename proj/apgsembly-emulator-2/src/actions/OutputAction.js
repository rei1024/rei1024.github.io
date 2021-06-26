// @ts-check

import { Action } from "./Action.js";

export class OutputAction extends Action {
    /**
     * 
     * @param {string} digit 
     */
    constructor(digit) {
        super();
        this.digit = digit;
    }

    /**
     * @override
     * @returns {string}
     */
    pretty() {
        return `OUTPUT ${this.digit}`;
    }

    /**
     * 
     * @param {string} str 
     * @returns {OutputAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/);
        if (array.length !== 2) {
            return undefined;
        }
        const [ output, digit ] = array;
        if (output !== "OUTPUT") {
            return undefined;
        }
        if (digit === undefined) {
            return undefined;
        }
        return new OutputAction(digit);
    }
}
