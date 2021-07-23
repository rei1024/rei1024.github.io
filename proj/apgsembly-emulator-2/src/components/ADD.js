// @ts-check

import { AddAction, ADD_A1, ADD_B0, ADD_B1 } from "../actions/AddAction.js";

export const addLookupA1 = [5, 4, 7, 6, 1, 0, 3, 2, 13, 12, 15, 14, 9, 8, 11, 10];
export const addLookupB0 = [0, 0, 0, 0, 0, 0, 9, 9, 0, 0, 9, 9, 9, 9, 9, 9];
export const addLookupB1 = [0, 0, 0, 0, 9, 9, 0, 0, 9, 9, 0, 0, 9, 9, 9, 9];

/**
 * ADD
 */
export class ADD {
    constructor() {
        /**
         * 0 ~ 15
         * @type {number}
         * @private
         */
        this.value = 0;
    }

    /**
     * 
     * @param {AddAction} act 
     */
    action(act) {
        switch (act.op) {
            case ADD_A1: return this.a1();
            case ADD_B0: return this.b0();
            case ADD_B1: return this.b1();
            default: throw Error('ADD action: internal');
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
     * `ADD A1`
     * @returns {void}
     */
    a1() {
        this.value = addLookupA1[this.value] ?? this.error();
        return undefined;
    }

    /**
     * `ADD B0`
     * @returns {0 | 1}
     */
    b0() {
        const t = this.value % 2;
        this.value = addLookupB0[this.value] ?? this.error();
        // @ts-ignore
        return t;
    }

    /**
     * `ADD B1`
     * @returns {0 | 1}
     */
    b1() {
        const t = 1 - this.value % 2;
        this.value = addLookupB1[this.value] ?? this.error();
        // @ts-ignore
        return t;
    }

    /**
     * @private
     * @returns {never}
     */
    error() {
        throw Error('ADD: internal');
    }

    /**
     * 
     * @returns {string}
     */
    toString() {
        return this.value.toString(2).padStart(4, '0');
    }

    /**
     * 
     * @returns {string}
     */
    toStringDetail() {
        const str = this.toString();
        return str.slice(0, 3) + " bit" + str.slice(3);
    }
}
