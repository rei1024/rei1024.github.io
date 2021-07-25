// @ts-check

import {
    B2DAction,
    B2D_INC,
    B2D_TDEC,
    B2D_SET,
    B2D_READ,
    B2D_B2D,
    B2D_B2DX,
    B2D_B2DY,
} from "../actions/B2DAction.js";

/**
 * B2D
 */
export class B2D {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x = 0, y = 0) {
        if (x < 0 || y < 0) {
            throw RangeError('B2D constructor: negative');
        }
        this.x = x;
        this.y = x;

        /**
         * @private
         */
        this.maxX = x;

        /**
         * @private
         */
        this.maxY = y;

        /**
         * @private
         * @type {(0 | 1)[][]}
         */
        this.array = Array(this.maxY + 1).fill(0).map(_ => {
            return Array(this.maxX + 1).fill(0);
        });
    }

    /**
     * @returns {(0 | 1)[][]}
     */
    getArray() {
        return this.array;
    }

    /**
     * 
     * @returns {number}
     */
    getMaxX() {
        return this.maxX;
    }

    /**
     * 
     * @returns {number}
     */
    getMaxY() {
        return this.maxY;
    }

    /**
     * 
     * @param {B2DAction} act 
     * @returns {0 | 1 | void}
     */
    action(act) {
        switch (act.op) {
            case B2D_INC: {
                switch (act.axis) {
                    case B2D_B2DX: return this.incB2DX();
                    case B2D_B2DY: return this.incB2DY();
                    case B2D_B2D: throw Error('B2D: internal');
                }
                break;
            }
            case B2D_TDEC: {
                switch (act.axis) {
                    case B2D_B2DX: return this.tdecB2DX();
                    case B2D_B2DY: return this.tdecB2DY();
                    case B2D_B2D: throw Error('B2D: internal');
                }
                break;
            }
            case B2D_READ: {
                switch (act.axis) {
                    case B2D_B2D: return this.read();
                    default: throw Error('B2D: internal');
                }
                break;
            }
            case B2D_SET: {
                switch (act.axis) {
                    case B2D_B2D: return this.set();
                    default: throw Error('B2D: internal');
                }
                break;
            }
            default: throw Error('B2D: internal');
        }
    }

    /**
     * `INC B2DX`
     * @returns {void}
     */
    incB2DX() {
        this.x += 1;
        if (this.maxX < this.x) {
            this.array.forEach(a => {
                a.push(0);
            });
            this.maxX = this.x;
        }
    }

    /**
     * `INC B2DY`
     * @returns {void}
     */
    incB2DY() {
        this.y += 1;
        if (this.maxY < this.y) {
            this.array.push(Array(this.maxX + 1).fill(0));
            this.maxY = this.y;
        }
    }

    /**
     * `TDEC B2DX`
     * @returns {0 | 1}
     */
    tdecB2DX() {
        if (this.x === 0) {
            return 0;
        } else {
            this.x -= 1;
            return 1;
        }
    }

    /**
     * `TDEC B2DY`
     * @returns {0 | 1}
     */
    tdecB2DY() {
        if (this.y === 0) {
            return 0;
        } else {
            this.y -= 1;
            return 1;
        }
    }

    /**
     * `READ B2D`
     * @returns {0 | 1}
     */
    read() {
        const arrayY = this.array[this.y];
        if (arrayY === undefined) {
            throw Error('B2D: internal error');
        }
        const value = arrayY[this.x];
        if (value === undefined) {
            throw Error('B2D: internal error');
        }
        arrayY[this.x] = 0;
        return value;
    }

    /**
     * `SET B2D`
     * @returns {void}
     */
    set() {
        const arrayY = this.array[this.y];
        if (arrayY === undefined) {
            throw Error('B2D: internal error');
        }
        if (arrayY[this.x] === 1) {
            throw Error('B2D SET: Tried to set when it was already 1');
        }
        arrayY[this.x] = 1;   
    }

    /**
     * 
     * @returns {string}
     */
    toString() {
        return this.array.map(a => a.join("")).join("\n");
    }
}
