// @ts-check

import {
    BRegAction,
    B_INC,
    B_TDEC,
    B_SET,
    B_READ
} from "../actions/BRegAction.js";

/**
 * バイナリの文字列を0と1の配列に変換する
 * @param {string} str '01011101'
 * @returns {(0 | 1)[]}
 * @throws
 */
function parseBits(str) {
    return [...str].map(c => {
        if (c === '0') {
            return 0;
        } else if (c === '1') {
            return 1;
        } else {
            throw Error(`Invalid #REGISTERS: "${str}"`);
        }
    });
}

const hasBigInt = typeof BigInt !== 'undefined';

/**
 * Bn: Binary Register
 */
export class BReg {
    constructor() {
        this.pointer = 0;
        /**
         * @private
         * @type {(0 | 1)[]}
         */
        this.bits = [0];
    }

    /**
     *
     * @param {BRegAction} act
     * @returns {0 | 1 | void}
     */
    action(act) {
        switch (act.op) {
            case B_INC: return this.inc();
            case B_READ: return this.read();
            case B_TDEC: return this.tdec();
            case B_SET: return this.set();
            default: throw Error('BReg action: ' + act.op);
        }
    }

    /**
     * @returns {(0 | 1)[]}
     */
    getBits() {
        return this.bits;
    }

    /**
     *
     * @param {(0 | 1)[]} bits
     */
    setBits(bits) {
        this.bits = bits;
    }

    /**
     * `INC Bn`
     * @returns {void}
     */
    inc() {
        this.pointer += 1;
        this.extend();
    }

    /**
     * `TDEC Bn`
     * @returns {0 | 1}
     */
    tdec() {
        if (this.pointer === 0) {
            return 0;
        } else {
            this.pointer -= 1;
            return 1;
        }
    }

    /**
     * `READ Bn`
     * @returns {0 | 1}
     */
    read() {
        const pointer = this.pointer;
        const bits = this.bits;
        if (pointer < bits.length) {
            const value = bits[pointer];
            bits[pointer] = 0;
            return value ?? this.error();
        } else {
            return 0;
        }
    }

    /**
     * `SET Bn`
     * @returns {void}
     */
    set() {
        const bits = this.bits;
        const pointer = this.pointer;
        if (pointer >= bits.length) {
            this.extend();
        }
        const value = bits[pointer];
        if (value === 1) {
            throw Error(
                'The bit of binary register is already 1: bits = ' +
                bits.join('') + " pointer = " + pointer
            );
        }
        bits[pointer] = 1;
    }

    /**
     * ポインターの範囲までメモリを広げる
     */
    extend() {
        const pointer = this.pointer;
        const len = this.bits.length;
        if (pointer >= len) {
            if (pointer === len) {
                this.bits.push(0);
            } else {
                /**
                 * @type {0[]}
                 */
                const rest = Array(pointer - len + 1).fill(0);
                this.bits.push(...rest);
            }
        }
    }

    /**
     * @private
     * @returns {never}
     */
    error() {
        throw Error('error');
    }

    /**
     *
     * @returns {string}
     */
    toBinaryString() {
        return this.getBits().slice().reverse().join("");
    }

    /**
     * 十進数
     * @returns {string} "123"
     */
    toDecimalString() {
        if (hasBigInt) {
            return BigInt("0b" + this.toBinaryString()).toString();
        } else {
            return Number("0b" + this.toBinaryString()).toString();
        }
    }

    /**
     * prefixとsuffixがsliceされていることは保証する
     * @returns {{
        prefix: (0 | 1)[];
        head: 0 | 1;
        suffix: (0 | 1)[];
    }}
     */
    toObject() {
        this.extend();
        return {
            prefix: this.bits.slice(0, this.pointer),
            head: this.bits[this.pointer] ?? this.error(),
            suffix: this.bits.slice(this.pointer + 1),
        };
    }

    /**
     *
     * @param {string} key
     * @param {unknown} value
     */
    setByRegistersInit(key, value) {
        const debugStr = `"${key}": ${JSON.stringify(value)}`;
        // 数字の場合の処理は数字をバイナリにして配置する
        if (typeof value === 'number') {
            this.setBits(parseBits(value.toString(2)).reverse());
            this.extend();
        } else if (!Array.isArray(value)) {
            throw Error(`Invalid #REGISTERS ${debugStr}`);
        } else if (value.length !== 2) {
            throw Error(`Invalid #REGISTERS ${debugStr}`);
        } else {
            /** @type {unknown} */
            const value0 = value[0];
            /** @type {unknown} */
            const value1 = value[1];
            if (typeof value0 !== 'number' || typeof value1 !== 'string') {
                throw Error(`Invalid #REGISTERS ${debugStr}`);
            } else {
                this.pointer = value0;
                this.setBits(parseBits(value1));
                this.extend();
            }
        }
    }
}
