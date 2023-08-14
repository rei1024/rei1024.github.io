// @ts-check

import { SubAction } from "../actions/SubAction.js";
import { internalError } from "../actions/Action.js";
import { SUB_A1, SUB_B0, SUB_B1 } from "../action_consts/Sub_consts.js";

/**
 * `SUB`
 */
export class SUB {
    constructor() {
        /**
         * 0 ~ 31
         * @private
         */
        this.value = 0;
    }

    /**
     * @param {SubAction} act
     */
    action(act) {
        switch (act.op) {
            // A1  176960
            // B0 1902824
            // B1  172184
            case SUB_B0:
                return this.b0();
            case SUB_A1:
                return this.a1();
            case SUB_B1:
                return this.b1();
            default:
                internalError();
        }
    }

    /**
     * @returns {number}
     */
    getValue() {
        return this.value;
    }

    /**
     * `SUB A1`
     * @returns {void}
     */
    a1() {
        /**
         * `-1` is `"FAILURE"`
         */
        // deno-fmt-ignore
        const subLookupA1 =
            [
                3, 2, -1, -1, 7, 6, -1, -1, 11, 10, -1, -1, 15, 14, -1, -1,
                19, 18, -1, -1, 23, 22, -1, -1, 27, 26, -1, -1, 31, 30, -1, -1
            ];
        const x = subLookupA1[this.value] ?? internalError();
        if (x === -1) {
            throw Error("SUB error: A1");
        }
        this.value = x;
    }

    /**
     * `SUB B0`
     * @returns {0 | 1}
     */
    b0() {
        const t = this.value % 2;
        // deno-fmt-ignore
        const subLookupB0 =
            [
                0, 0, 0, 0, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 17, 17,
                17, 17, 0, 0, 17, 17, 17, 17, 0, 0, 17, 17, 17, 17, 17, 17
            ];
        this.value = subLookupB0[this.value] ?? internalError();
        // @ts-ignore
        return t;
    }

    /**
     * `SUB B1`
     * @returns {0 | 1}
     */
    b1() {
        const t = 1 - this.value % 2;
        // deno-fmt-ignore
        const subLookupB1 =
            [
                17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 0, 0, 0, 0,
                17, 17, 17, 17, 17, 17, 0, 0, 17, 17, 17, 17, 0, 0, 17, 17
            ];
        this.value = subLookupB1[this.value] ?? internalError();
        // @ts-ignore
        return t;
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.value.toString(2).padStart(5, "0");
    }

    /**
     * @returns {string}
     */
    toStringDetail() {
        const str = this.toString();
        return str.slice(0, 3) + " stopper" + str.slice(3, 4) +
            " bit" + str.slice(4);
    }
}
