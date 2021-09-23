// @ts-check

/**
 * @typedef {number} State
 */

/**
 * @typedef {number} Color
 */

export const NORTH = "N";
export const EAST = "E";
export const WEST = "W";
export const SOUTH = "S";
export const HALT = "";

/**
 * @type {Dir[]}
 */
export const allDirs = [NORTH, EAST, WEST, SOUTH, HALT];

/**
 * @typedef {NORTH | EAST | WEST | SOUTH | HALT} Dir
 */

/**
 *
 * @param {string} x
 * @returns {Dir | undefined}
 */
export function parseDir(x) {
    // @ts-ignore
    if (allDirs.includes(x)) {
        // @ts-ignore
        return x;
    }
    return undefined;
}

export class Next {
    /**
     *
     * @param {Color} nextColor
     * @param {Dir} nextDir
     * @param {State} nextState
     */
    constructor(nextColor, nextDir, nextState) {
        this.nextColor = nextColor;
        /**
         * @type {Dir}
         */
        this.nextOp = nextDir;
        this.nextState = nextState;
    }

    /**
     *
     * @param {number} x
     * @param {string} y
     * @param {number} z
     * @returns {Next | undefined}
     */
    static fromNumbers(x, y, z) {
        const nextOp = parseDir(y);
        if (nextOp === undefined) {
            return undefined;
        }
        return new Next(x, nextOp, z);
    }

    toJSON() {
        return {
            nextColor: this.nextColor,
            nextOp: this.nextOp,
            nextState: this.nextState
        };
    }
}

export class AbsTurmites {
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
     * @returns {AbsTurmites}
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

                // @ts-ignore
                const next = Next.fromNumbers(...nextObj);
                if (next === undefined) {
                    console.log(nextObj, array);
                    throw error;
                }
                return next;
            });
            return array3;
        });

        return new AbsTurmites(array2);
    }

    /**
     *
     * @param {string} str
     * @returns {AbsTurmites}
     */
    static fromObjectString(str) {
        try {
            const obj = JSON.parse(str.replace(/\{/ug, '[').replace(/\}/ug, ']').replace(/'/ug, '"'));
            if (Array.isArray(obj)) {
                return AbsTurmites.fromObject(obj);
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
                return `{${next.nextColor},'${next.nextOp}',${next.nextState}}`;
            }).join(',') + "}";
        });

        return `{${middle.join(',')}}`;
    }
}
