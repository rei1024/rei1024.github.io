// @ts-check

import { Action } from "./Action.js";

export class BRegAction extends Action {
    /**
     * 
     * @param {"INC" | "TDEC" | "READ" | "SET"} op 
     * @param {number} regNumber 
     */
    constructor(op, regNumber) {
        super();
        this.op = op;
        this.regNumber = regNumber;
    }

    /**
     * @override
     * @returns {number[]}
     */
    extractBinaryRegisterNumbers() {
        return [this.regNumber]
    }

    /**
     * @override
     */
    pretty() {
        return `${this.op} B${this.regNumber}`;
    }

    /**
     * @param {string} str
     * @returns {BRegAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/);
        if (array.length !== 2) {
            return undefined;
        }
        const [ op, reg ] = array;
        if (op === undefined || reg === undefined) { return undefined; }
        if (op === "INC" || op === "TDEC" || op === "READ" || op === "SET") {
            if (reg.startsWith("B")) {
                const str = reg.slice(1);
                if (/^[0-9]+$/.test(str)) {
                    return new BRegAction(op, parseInt(str, 10));
                }
            }
        }
        return undefined;
    }
}
