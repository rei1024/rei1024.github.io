// @ts-check

import { URegAction } from "../actions/URegAction.js";

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
            case "INC": return this.inc();
            case "TDEC": return this.tdec();
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
     * @returns {void}
     */
    inc() {
        this.value += 1;
    }

    /**
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
