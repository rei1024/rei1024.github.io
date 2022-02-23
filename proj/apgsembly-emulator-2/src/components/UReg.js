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
            // INC  12414041
            // TDEC 12437599
            case U_TDEC: {
                if (this.value === 0) {
                    return 0;
                } else {
                    this.value--;
                    return 1;
                }
            }
            case U_INC: {
                this.value++;
            }
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
        this.action(new URegAction(U_INC, 0)); // regNumberは仮
    }

    /**
     * `TDEC Un`
     * @returns {0 | 1}
     */
    tdec() {
        const res = this.action(new URegAction(U_TDEC, 0)); // regNumberは仮
        if (res === undefined) {
            throw Error('internal error');
        }
        return res;
    }

    /**
     *
     * @param {string} key
     * @param {unknown} value
     */
    setByRegistersInit(key, value) {
        if (typeof value !== "number") {
            const debugStr = `"${key}": ${JSON.stringify(value)}`;
            throw Error(`Invalid #REGISTERS ${debugStr}`);
        }
        if (value < 0 || !Number.isInteger(value)) {
            const debugStr = `"${key}": ${JSON.stringify(value)}`;
            throw Error(`Invalid #REGISTERS ${debugStr}`);
        }
        this.setValue(value);
    }
}
