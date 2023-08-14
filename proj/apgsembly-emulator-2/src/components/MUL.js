// @ts-check

import { MUL_0, MUL_1 } from "../action_consts/Mul_consts.js";
import { MulAction } from "../actions/MulAction.js";

/**
 * `MUL`
 */
export class MUL {
    constructor() {
        /**
         * 0 ~ 31
         * @private
         */
        this.value = 0;
    }

    /**
     * @param {MulAction} act
     * @returns {0 | 1}
     */
    action(act) {
        switch (act.op) {
            // MUL0 200740
            // MUL1  21110
            case MUL_0:
                return this.mul0();
            case MUL_1:
                return this.mul1();
            default:
                throw Error("MUL: action");
        }
    }

    /**
     * @returns {number}
     */
    getValue() {
        return this.value;
    }

    /**
     * @returns {0 | 1}
     */
    mul0() {
        const value = this.value;
        const r = value % 2;
        this.value = value >> 1;
        // @ts-ignore
        return r;
    }

    /**
     * @returns {0 | 1}
     */
    mul1() {
        const value = this.value;
        const r = value % 2;
        if (value <= 21) {
            // (x / 2) + 5
            // (x + 10) / 2
            this.value = (value >> 1) + 5;
        } else {
            this.value = (value - 22) >> 1;
        }
        // @ts-ignore
        return r;
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.value.toString(2).padStart(5, "0");
    }
}
