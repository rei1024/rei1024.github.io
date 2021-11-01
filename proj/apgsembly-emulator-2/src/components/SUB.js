// @ts-check

import { SubAction, SUB_A1, SUB_B0, SUB_B1 } from "../actions/SubAction.js";

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
     *
     * @param {SubAction} act
     */
    action(act) {
        switch (act.op) {
            // A1  176960
            // B0 1902824
            // B1  172184
            case SUB_B0: return this.b0();
            case SUB_A1: return this.a1();
            case SUB_B1: return this.b1();
            default: throw Error('SUB: action error');
        }
    }

    /**
     *
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
        const subLookupA1 =
            [
                3, 2, -1, -1, 7, 6, -1, -1, 11, 10, -1, -1, 15, 14, -1, -1,
                19, 18, -1, -1, 23, 22, -1, -1, 27, 26, -1, -1, 31, 30, -1, -1
            ];
        const x = subLookupA1[this.value] ?? this.error();
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
        const subLookupB0 =
            [
                0, 0, 0, 0, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 17, 17,
                17, 17, 0, 0, 17, 17, 17, 17, 0, 0, 17, 17, 17, 17, 17, 17
            ];
        this.value = subLookupB0[this.value] ?? this.error();
        // @ts-ignore
        return t;
    }

    /**
     * `SUB B1`
     * @returns {0 | 1}
     */
    b1() {
        const t = 1 - this.value % 2;
        const subLookupB1 =
            [
                17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 0, 0, 0, 0,
                17, 17, 17, 17, 17, 17, 0, 0, 17, 17, 17, 17, 0, 0, 17, 17
            ];
        this.value = subLookupB1[this.value] ?? this.error();
        // @ts-ignore
        return t;
    }

    /**
     *
     * @returns {string}
     */
    toString() {
        return this.value.toString(2).padStart(5, '0');
    }

    /**
     *
     * @returns {string}
     */
    toStringDetail() {
        const str = this.toString();
        return str.slice(0, 3) + " stopper" + str.slice(3, 4) +
                " bit" + str.slice(4);
    }

    /**
     * @private
     * @returns {never}
     */
    error() {
        throw Error('SUB: internal error');
    }
}
