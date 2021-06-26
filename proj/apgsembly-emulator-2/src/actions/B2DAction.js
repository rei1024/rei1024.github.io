// @ts-check

import { Action } from "./Action.js";

export class B2DAction extends Action {
    /**
     * 
     * @param {"INC" | "TDEC" | "READ" | "SET"} op 
     * @param {"B2DX" | "B2DY" | "B2D"} axis
     */
    constructor(op, axis) {
        super();
        this.op = op;
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
        const [ op, axis ] = array;
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
        return undefined;
    }
}
