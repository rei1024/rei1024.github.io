// @ts-check

import { URegAction } from "../actions/URegAction.js";
import { internalError } from "../actions/Action.js";
import { U_INC, U_TDEC } from "../action_consts/UReg_consts.js";

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
     * @param {URegAction} act
     * @param {number} n
     * @returns {0 | 1 | void}
     */
    actionN(act, n) {
        switch (act.op) {
            case U_TDEC: {
                this.value -= n;
                break;
            }
            case U_INC: {
                this.value += n;
                break;
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
            internalError();
        }
        return res;
    }

    /**
     * @param {string} key
     * @param {unknown} value
     */
    setByRegistersInit(key, value) {
        if (
            typeof value !== "number" || value < 0 || !Number.isInteger(value)
        ) {
            initError(key, value);
        }
        this.setValue(value);
    }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {never}
 */
function initError(key, value) {
    const debugStr = `"${key}": ${JSON.stringify(value)}`;
    throw Error(`Invalid #REGISTERS ${debugStr}`);
}
