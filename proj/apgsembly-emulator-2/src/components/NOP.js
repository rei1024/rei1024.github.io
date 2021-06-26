
// @ts-check
import { NopAction } from "../actions/NopAction.js";

/**
 * `NOP`
 */
export class NOP {
    constructor() {

    }

    /**
     * 
     * @param {NopAction} _act 
     * @returns {0}
     */
    action(_act) {
        return 0;
    }

    /**
     * 
     * @returns {0}
     */
    nop() {
        return 0;
    }
}
