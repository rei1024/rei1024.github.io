// @ts-check

import { AddAction, ADD_A1, ADD_B0, ADD_B1 } from "../actions/AddAction.js";

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
     * @returns {0 | 1 | undefined}
     */
    action(act) {
        switch (act.op) {
            // A1 479061
            // B1 535537
            // B0 4135003
            case ADD_B0: {
                const value = this.value;
                const t = value % 2;
                this.value = [
                    0b0000, 0b0000, 0b0000, 0b0000, 0b0000, 0b0000, 0b1001, 0b1001,
                    0b0000, 0b0000, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001
                ][value] ?? this.error();
                // @ts-ignore
                return t;
            }
            case ADD_B1: {
                const value = this.value;
                const t = 1 - value % 2;
                this.value = [
                    0b0000, 0b0000, 0b0000, 0b0000, 0b1001, 0b1001, 0b0000, 0b0000,
                    0b1001, 0b1001, 0b0000, 0b0000, 0b1001, 0b1001, 0b1001, 0b1001
                ][value] ?? this.error();
                // @ts-ignore
                return t;
            }
            case ADD_A1: {
                this.value = [
                    0b0101, 0b0100, 0b0111, 0b0110, 0b0001, 0b0000, 0b0011, 0b0010,
                    0b1101, 0b1100, 0b1111, 0b1110, 0b1001, 0b1000, 0b1011, 0b1010
                ][this.value] ?? this.error();
                return undefined;
            }
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
     * @returns {undefined}
     */
    a1() {
        this.action(new AddAction(ADD_A1));
        return undefined;
    }

    /**
     * `ADD B0`
     * @returns {0 | 1}
     */
    b0() {
        const t = this.action(new AddAction(ADD_B0));
        if (t === undefined) {
            this.error();
        }
        return t;
    }

    /**
     * `ADD B1`
     * @returns {0 | 1}
     */
    b1() {
        const t = this.action(new AddAction(ADD_B1));
        if (t === undefined) {
            this.error();
        }
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
        return `${str.slice(0, 3)} bit${str.slice(3)}`;
    }
}
