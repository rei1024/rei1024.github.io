// @ts-check
/**
 * @typedef {"l" | "r" | "*"} Direction
 */

/**
 * @param {string} str
 * @returns {Direction | undefined}
 */
export function parseDirection(str) {
    switch (str) {
        case "l":
            return str;
        case "L":
            return "l";
        case "r":
            return str;
        case "R":
            return "r";
        case "*":
            return str;
        default:
            return undefined;
    }
}

/**
 * <current symbol> or <current state>
 */
export const WILDCARD = "*";

/**
 * <new symbol> or <new state>
 */
export const NO_CHANGE = "*";

export const BLANK_SYMBOL = "_";

/**
 * @returns {never}
 */
function internalError() {
    throw Error("internal error");
}

export class Line {
    /**
     * @param {{
     *  currentState: string | undefined; // undefined for wildcard
     *  currentSymbol: string | undefined; // undefined for wildcard
     *  newSymbol: string | undefined // undefined for no change
     *  direction: Direction
     *  newState: string | undefined // undefined for no change
     *  breakpoint?: boolean | undefined // default is false
     * }} param0
     */
    constructor(
        {
            currentState,
            currentSymbol,
            newSymbol,
            direction,
            newState,
            breakpoint,
        },
    ) {
        /**
         * @type {string | undefined}
         * @readonly
         */
        this.currentState = currentState;

        /**
         * @type {string | undefined}
         * @readonly
         */
        this.currentSymbol = currentSymbol;

        /**
         * @type {string | undefined}
         * @readonly
         */
        this.newSymbol = newSymbol;

        /**
         * @type {Direction}
         * @readonly
         */
        this.direction = direction;

        /**
         * @type {string | undefined}
         * @readonly
         */
        this.newState = newState;

        /**
         * @type {boolean}
         * @readonly
         */
        this.breakpoint = breakpoint ?? false;
    }

    /**
     * @param {string | undefined} currentState
     * @param {string | undefined} currentSymbol
     * @param {string | undefined} newSymbol
     * @param {Direction} direction
     * @param {string | undefined} newState
     * @param {boolean | undefined} breakpoint
     * @returns {Line}
     */
    static make(
        currentState,
        currentSymbol,
        newSymbol,
        direction,
        newState,
        breakpoint = undefined,
    ) {
        return new Line({
            currentState,
            currentSymbol,
            newSymbol,
            direction,
            newState,
            breakpoint,
        });
    }

    /**
     * @param {string} str
     * @returns {Line | Error | undefined}
     */
    static parse(str) {
        const withoutComment = str.includes(";")
            ? str.slice(0, str.indexOf(";"))
            : str;
        const trimmed = withoutComment.trim();

        const array = trimmed.split(/\s+/u).filter((x) => x !== "");

        if (array.length === 0) {
            return undefined;
        }

        if (array.length < 5) {
            return Error(
                `must have 5 components but it has ${array.length} at "${str}".`,
            );
        }

        /**
         * @type {(string | undefined)[]}
         */
        let [
            currentState,
            currentSymbol,
            newSymbol,
            // eslint-disable-next-line prefer-const
            dirStr,
            newState,
            // eslint-disable-next-line prefer-const
            breakpoint,
        ] = array;

        if (dirStr === undefined) {
            internalError();
        }

        const direction = parseDirection(dirStr);

        if (direction === undefined) {
            return Error(`direction should be 'l', 'r' or '*' at "${str}".`);
        }

        if (currentState === WILDCARD) {
            currentState = undefined;
        }

        if (currentSymbol === WILDCARD) {
            currentSymbol = undefined;
        }

        if (newSymbol === NO_CHANGE) {
            newSymbol = undefined;
        }

        if (newState === NO_CHANGE) {
            newState = undefined;
        }

        let breakpointBoolean = undefined;
        if (breakpoint !== undefined) {
            if (breakpoint === "!") {
                breakpointBoolean = true;
            } else {
                return Error(
                    `breakpoint is "!" but it is "${breakpoint}" at "${str}".`,
                );
            }
        }

        return new Line({
            currentState,
            currentSymbol,
            newSymbol,
            direction,
            newState,
            breakpoint: breakpointBoolean,
        });
    }

    /**
     * @returns {string}
     */
    pretty() {
        return `${this.currentState ?? WILDCARD} ${
            this.currentSymbol ?? WILDCARD
        } ${this.newSymbol ?? NO_CHANGE} ${this.direction} ${
            this.newState ?? NO_CHANGE
        }`;
    }
}

/**
 * @param {string} state
 * @returns {boolean}
 */
export function isHaltState(state) {
    return state.toLowerCase().startsWith("halt");
}
