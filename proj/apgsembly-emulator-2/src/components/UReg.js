// @ts-check

import { URegAction, U_INC, U_TDEC } from "../actions/URegAction.js";

/**
 * Un: Sliding Block Register
 */
export class UReg {
    constructor() {
        /**
         * @private
         */
        this.value = 0;
    }

    /**
     * 
     * @param {URegAction} act 
     * @returns {0 | 1 | void}
     */
    action(act) {
        switch (act.op) {
            case U_INC: return this.inc();
            case U_TDEC: return this.tdec();
        }
    }

    /**
     * @returns {number}
     */
    getValue() {
        return this.value;
    }

    /**
     * 
     * @param {number} v 
     */
    setValue(v) {
        this.value = v;
    }

    /**
     * `INC Un`
     * @returns {void}
     */
    inc() {
        this.value += 1;
    }

    /**
     * `TDEC Un`
     * @returns {0 | 1}
     */
    tdec() {
        if (this.value === 0) {
            return 0;
        } else {
            this.value -= 1;
            return 1;
        }
    }
}
