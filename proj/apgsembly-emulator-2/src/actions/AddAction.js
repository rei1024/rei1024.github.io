// @ts-check

import { Action } from "./Action.js";

/**
 * Action for `ADD`
 */
export class AddAction extends Action {
    /**
     * 
     * @param {"A1" | "B0" | "B1"} regName 
     */
    constructor(regName) {
        super();
        this.regName = regName;
    }

    /**
     * @override
     */
    pretty() {
        return `ADD ${this.regName}`;
    }

    /**
     * 
     * @param {string} str 
     * @returns {AddAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/);
        if (array.length !== 2) {
            return undefined;
        }
        const [ add, reg ] = array;
        if (add !== "ADD") {
            return undefined;
        }
        if (reg === "A1" || reg === "B0" || reg === "B1") {
            return new AddAction(reg);
        }
        return undefined;
    }
}
