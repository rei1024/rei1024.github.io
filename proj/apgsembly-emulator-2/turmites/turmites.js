// @ts-check

/**
 * @typedef {number} State
 */

/**
 * @typedef {number} Color
 */

/*
    UP
LEFT  RIGHT
   DOWN
*/

export const UP = "UP";
export const DOWN = "DOWN";
export const LEFT = "LEFT";
export const RIGHT = "RIGHT";

/**
 * @type {Dir[]}
 */
export const allDirs = [UP, DOWN, LEFT, RIGHT];

/**
 * @typedef {UP | DOWN | LEFT | RIGHT} Dir
 */

export const NoTurnOp = 1;
export const RightTurnOp = 2;
export const UTurnOp = 4;
export const LeftTurnOp = 8;

/**
 * @typedef {NoTurnOp | RightTurnOp | UTurnOp | LeftTurnOp} Op
 */

/**
 *
 * @param {number} x
 * @returns {Op | undefined}
 */
export function getOp(x) {
    const all = [NoTurnOp, RightTurnOp, UTurnOp, LeftTurnOp];
    if (all.includes(x)) {
        // @ts-ignore
        return x;
    }
    return undefined;
}

/**
 *
 * @param {Op} op
 * @param {Dir} dir
 * @returns {Dir}
 */
export function actionOp(op, dir) {
    switch (op) {
        case NoTurnOp: return dir;
        case RightTurnOp: {
            switch (dir) {
                case UP: return RIGHT;
                case RIGHT: return DOWN;
                case DOWN: return LEFT;
                case LEFT: return UP;
            }
            break;
        }
        case UTurnOp: {
            switch (dir) {
                case UP: return DOWN;
                case RIGHT: return LEFT;
                case DOWN: return UP;
                case LEFT: return RIGHT;
            }
            break;
        }
        case LeftTurnOp: {
            switch (dir) {
                case UP: return LEFT;
                case RIGHT: return UP;
                case DOWN: return RIGHT;
                case LEFT: return DOWN;
            }
        }
    }
}

export class Next {
    /**
     *
     * @param {Color} nextColor
     * @param {Op} nextOp
     * @param {State} nextState
     */
    constructor(nextColor, nextOp, nextState) {
        this.nextColor = nextColor;
        /**
         * @type {Op}
         */
        this.nextOp = nextOp;
        this.nextState = nextState;
    }

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Next | undefined}
     */
    static fromNumbers(x, y, z) {
        const nextOp = getOp(y);
        if (nextOp === undefined) {
            return undefined;
        }
        return new Next(x, nextOp, z);
    }

    /**
     * @param {string} str
     * @returns {Next | undefined}
     */
    static fromString(str) {
        if (str.length !== 3) {
            return undefined;
        }
        const nextColor = parseInt(str[0], 10);
        const nextOpNum = parseInt(str[0], 10);
        const nextState = parseInt(str[0], 10);
        return Next.fromNumbers(nextColor, nextOpNum, nextState);
    }

    toJSON() {
        return {
            nextColor: this.nextColor,
            nextOp: this.nextOp,
            nextState: this.nextState
        };
    }
}

export class Turmites {
    /**
     *
     * @param {Next[][]} array
     */
    constructor(array) {
        this.array = array;
    }

    static fromString() {

    }

    /**
     *
     * @param {unknown[]} array
     * @returns {Turmites}
     */
    static fromObject(array) {
        const error = Error('failed to parse');

        /**
         * @type {unknown[]}
         */
        const content = array;

        /**
         * @type {Next[][]}
         */
        const array2 = content.map(v => {
            if (!Array.isArray(v)) {
                throw error;
            }

            /**
             * @type {Next[]}
             */
            const array3 = v.map((nextObj) => {
                if (!Array.isArray(nextObj)) {
                    throw error;
                }
                if (nextObj.length !== 3) {
                    throw error;
                }
                if (!nextObj.every(x => typeof x === 'number')) {
                    throw error;
                }
                // @ts-ignore
                return Next.fromNumbers(...nextObj);
            });
            return array3;
        });

        return new Turmites(array2);
    }

    /**
     *
     * @param {string} str "{{{1,2,0},{0,4,1}},{{1,2,1},{0,1,0}}}"
     * @returns {Turmites}
     */
    static fromObjectString(str) {
        try {
            const obj = JSON.parse(str.replaceAll('{', '[').replaceAll('}', ']'));
            if (Array.isArray(obj)) {
                return Turmites.fromObject(obj);
            } else {
                throw Error('failed to parse');
            }
        } catch (e) {
            throw Error(`failed to parse "${str}"`);
        }
    }

    toString() {
        /**
         * @type {string[]}
         */
        const middle = this.array.map((array) => {
            return "{" + array.map((next) => {
                return `{${next.nextColor},${next.nextOp},${next.nextState}}`;
            }).join(',') + "}";
        });
        return "{" + middle.join(',') + "}";
    }
}
