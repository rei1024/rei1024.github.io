// @ts-check

import {
    LegacyTRegAction,
    T_DEC,
    T_INC,
    T_READ,
    T_RESET,
    T_SET,
} from "../actions/LegacyTRegAction.js";
import { internalError } from "../actions/Action.js";

export class LegacyTReg {
    constructor() {
        /**
         * @private
         */
        this.pointer = 0;

        /**
         * @private
         * @type {(0 | 1 | -1)[]}
         */
        this.bits = [0];
    }

    /**
     * @param {LegacyTRegAction} act
     * @returns {0 | 1 | void}
     */
    action(act) {
        switch (act.op) {
            case T_INC:
                return this.inc();
            case T_READ:
                return this.read();
            case T_DEC:
                return this.dec();
            case T_SET:
                return this.set();
            case T_RESET:
                return this.reset();
            default:
                internalError();
        }
    }

    getPointer() {
        return this.pointer;
    }

    getBits() {
        return this.bits;
    }

    /**
     * `INC`
     * @returns {0 | 1}
     */
    inc() {
        if (this.pointer === this.bits.length - 1) {
            this.bits.push(0);
            this.pointer++;
            return 0;
        } else {
            this.pointer++;
            return 1;
        }
    }

    /**
     * `DEC`
     * もしヘッドが一番左にあればZを返す。
     * そうでなければヘッドを戻してNZを返す。
     */
    dec() {
        if (this.pointer === 0) {
            return 0;
        } else {
            this.pointer--;
            return 1;
        }
    }

    /**
     * `READ`
     * 現在のヘッドの位置の値が0のときその値を消去してZを返す。
     * 1のときの値を消去してNZを返す。
     * そうでなければエラー
     * @returns {0 | 1}
     */
    read() {
        const pointer = this.pointer;
        const bit = this.bits[pointer];
        if (bit === 0) {
            this.bits[pointer] = -1;
            return 0;
        } else if (bit === 1) {
            this.bits[pointer] = -1;
            return 1;
        } else if (bit === -1) {
            throw Error("Error: reading empty space of T register");
        } else {
            internalError();
        }
    }

    /**
     * `SET`
     * @returns {void}
     */
    set() {
        if (this.bits[this.pointer] === -1) {
            this.bits[this.pointer] = 1;
        } else {
            throw Error("Error: SET to nonempty bit");
        }
    }

    /**
     * `RESET`
     * @returns {void}
     */
    reset() {
        if (this.bits[this.pointer] === -1) {
            this.bits[this.pointer] = 0;
        } else {
            throw Error("Error: RESET to nonempty bit");
        }
    }
}
