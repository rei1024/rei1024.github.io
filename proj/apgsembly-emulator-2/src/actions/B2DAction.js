// @ts-check

import { Action } from "./Action.js";

/**
 * Action for `B2D`
 */
export class B2DAction extends Action {
    /**
     * 
     * @param {"INC" | "TDEC" | "READ" | "SET"} op 
     * @param {"B2DX" | "B2DY" | "B2D"} axis
     */
    constructor(op, axis) {
        super();
        /**
         * @readonly
         */
        this.op = op;
        /**
         * @readonly
         */
        this.axis = axis;
    }

    /**
     * @override
     */
    pretty() {
        return `${this.op} ${this.axis}`;
    }

    /**
     * 
     * @param {string} str 
     */
    static parse(str) {
        const array = str.trim().split(/\s+/);
        if (array.length !== 2) {
            return undefined;
        }
        let [ op, axis ] = array;
        if (op === undefined || axis === undefined) { return undefined; }
        if (op === "INC" || op === "TDEC") {
            if (axis === "B2DX" || axis === "B2DY") {
                return new B2DAction(op, axis);
            }
        } else if (op === "READ" || op === "SET") {
            if (axis === "B2D") {
                return new B2DAction(op, axis);
            }
        }
        // APGsembly 1.0
        if (op === "INC" || op === "DEC") {
            if (op === "DEC") {
                // rename
                op = "TDEC";
            }
            if (axis === "SQX") {
                // @ts-ignore
                return new B2DAction(op, "B2DX");
            } else if (axis === "SQY") {
                // @ts-ignore
                return new B2DAction(op, "B2DY");
            }
        } else if (op === "READ" || op === "SET") {
            if (axis === "SQ") {
                return new B2DAction(op, "B2D");
            }
        }
        return undefined;
    }
}
