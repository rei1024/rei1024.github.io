// @ts-check

import { Action } from "./Action.js";

export const U_INC = "INC";
export const U_TDEC = "TDEC";

/**
 * Action for `Un`
 */
export class URegAction extends Action {
    /**
     * 
     * @param {"INC" | "TDEC"} op 
     * @param {number} regNumber
     */
    constructor(op, regNumber) {
        super();
        /**
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
    extractUnaryRegisterNumbers() {
        return [this.regNumber];
    }

    /**
     * @override
     */
    pretty() {
        return `${this.op} U${this.regNumber}`;
    }

    /**
     * 
     * @param {string} str
     * @returns {URegAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/);
        if (array.length !== 2) {
            return undefined;
        }
        const [ op, reg ] = array;
        if (op === undefined || reg === undefined) { return undefined; }
        if (op === "INC" || op === "TDEC") {
            // R for APGsembly 1.0
            if (reg.startsWith("U") || reg.startsWith('R')) {
                const str = reg.slice(1);
                if (/^[0-9]+$/.test(str)) {
                    return new URegAction(op, parseInt(str, 10));
                }
            }
        }
        return undefined;
    }
}
