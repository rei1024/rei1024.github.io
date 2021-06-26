// @ts-check

import { Action } from "./Action.js";

/**
 * @typedef {"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "."} Digit
 */


const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];

export class OutputAction extends Action {
    /**
     * 
     * @param {Digit} digit 
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
        if (digits.includes(digit)) {
            // @ts-ignore
            return new OutputAction(digit);
        }

        return undefined;
    }
}
