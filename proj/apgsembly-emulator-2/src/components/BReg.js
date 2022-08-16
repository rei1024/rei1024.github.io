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
        // invariant: this.pointer < this.bits.length
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
        // if (this.pointer >= this.bits.length) {
        //     throw Error('failed');
        // }
        switch (act.op) {
            // INC  3207502
            // TDEC 3217502
            // READ 3175344
            // SET   406844
            case B_TDEC: {
                if (this.pointer === 0) {
                    return 0;
                } else {
                    this.pointer--;
                    return 1;
                }
            }
            case B_INC: {
                this.pointer++;
                // using invariant
                if (this.pointer === this.bits.length) {
                    this.bits.push(0);
                }
                break;
            }
            case B_READ: {
                const pointer = this.pointer;
                const bits = this.bits;
                if (pointer < bits.length) {
                    const value = bits[pointer] ?? this.error();
                    bits[pointer] = 0;
                    return value;
                } else {
                    return 0;
                }
            }
            case B_SET: {
                const bits = this.bits;
                const pointer = this.pointer;
                if (pointer >= bits.length) {
                    this.extend();
                }
                const value = bits[pointer];
                if (value === 1) {
                    throw Error(
                        'The bit of binary register is already 1: bits = ' +
                        bits.join('') + ", pointer = " + pointer
                    );
                }
                bits[pointer] = 1;
                break;
            }
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
        const value = this.action(new BRegAction(B_INC, 0)); // regNumberは仮
        if (value !== undefined) {
            throw Error('internal error');
        }
        return value;
    }

    /**
     * `TDEC Bn`
     * @returns {0 | 1}
     */
    tdec() {
        const value = this.action(new BRegAction(B_TDEC, 0)); // regNumberは仮
        if (value === undefined) {
            throw Error('internal error');
        }
        return value;
    }

    /**
     * `READ Bn`
     * @returns {0 | 1}
     */
    read() {
        const value = this.action(new BRegAction(B_READ, 0)); // regNumberは仮
        if (value === undefined) {
            throw Error('internal error');
        }
        return value;
    }

    /**
     * `SET Bn`
     * @returns {void}
     */
    set() {
        const value = this.action(new BRegAction(B_SET, 0)); // regNumberは仮
        if (value !== undefined) {
            throw Error('internal error');
        }
        return value;
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
                const rest = Array(pointer - len + 1).fill(0).map(() => 0);
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
     * @param {number} [base] default is 10
     * @private
     */
    toString(base = 10) {
        const binString = "0b" + this.toBinaryString();
        if (hasBigInt) {
            return BigInt(binString).toString(base);
        } else {
            return Number(binString).toString(base);
        }
    }

    /**
     * 十進数
     * @returns {string} "123"
     */
    toDecimalString() {
        return this.toString();
    }

    /**
     * 16進数
     * @returns {string} "FF"
     */
    toHexString() {
        return this.toString(16);
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
        // 数字の場合の処理は数字をバイナリにして配置する TODO 必要か確認
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
            } else if (value0 < 0 || !Number.isInteger(value0)) {
                throw Error(`Invalid #REGISTERS ${debugStr}`);
            } else {
                this.pointer = value0;
                this.setBits(parseBits(value1));
                this.extend();
            }
        }
    }
}
