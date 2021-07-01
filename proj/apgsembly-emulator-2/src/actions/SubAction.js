// @ts-check

import { Action } from "./Action.js";

/**
 * Action for `SUB`
 */
export class SubAction extends Action {
    /**
     * 
     * @param {"A1" | "B0" | "B1"} regName 
     */
    constructor(regName) {
        super();
        /**
         * @readonly
         */
        this.regName = regName;
    }

    /**
     * @override
     */
    pretty() {
        return `SUB ${this.regName}`;
    }

    /**
     * 
     * @param {string} str 
     * @returns {SubAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/);
        if (array.length !== 2) {
            return undefined;
        }
        const [ sub, reg ] = array;
        if (sub !== "SUB") {
            return undefined;
        }
        if (reg === "A1" || reg === "B0" || reg === "B1") {
            return new SubAction(reg);
        }
        return undefined;
    }
}
