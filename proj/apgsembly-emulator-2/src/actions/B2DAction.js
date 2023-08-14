// @ts-check

import {
    B2D_B2D,
    B2D_B2DX,
    B2D_B2DY,
    B2D_INC,
    B2D_READ,
    B2D_SET,
    B2D_TDEC,
} from "../action_consts/B2D_consts.js";
import { Action } from "./Action.js";

/**
 * @typedef {B2D_INC_STRING | B2D_TDEC_STRING |
 *          B2D_READ_STRING | B2D_SET_STRING} B2DOpString
 */

/**
 * @typedef {B2D_B2DX_STRING | B2D_B2DY_STRING | B2D_B2D_STRING} B2DAxisString
 */

const B2D_INC_STRING = "INC";
const B2D_TDEC_STRING = "TDEC";
const B2D_READ_STRING = "READ";
const B2D_SET_STRING = "SET";
const B2D_B2DX_STRING = "B2DX";
const B2D_B2DY_STRING = "B2DY";
const B2D_B2D_STRING = "B2D";

const B2D_LEGACY_TDEC_STRING = "DEC";
const B2D_LEGACY_B2DX_STRING = "SQX";
const B2D_LEGACY_B2DY_STRING = "SQY";
const B2D_LEGACY_B2D_STRING = "SQ";

/**
 * @typedef {import("../action_consts/B2D_consts.js").B2DOp} B2DOp
 */

/**
 * @typedef {import("../action_consts/B2D_consts.js").B2DAxis} B2DAxis
 */

/**
 * @param {B2DOpString} op
 * @returns {B2DOp}
 */
function parseOp(op) {
    switch (op) {
        case B2D_INC_STRING:
            return B2D_INC;
        case B2D_TDEC_STRING:
            return B2D_TDEC;
        case B2D_READ_STRING:
            return B2D_READ;
        case B2D_SET_STRING:
            return B2D_SET;
    }
}

/**
 * @param {B2DOp} op
 * @returns {B2DOpString}
 */
function prettyOp(op) {
    switch (op) {
        case B2D_INC:
            return B2D_INC_STRING;
        case B2D_TDEC:
            return B2D_TDEC_STRING;
        case B2D_READ:
            return B2D_READ_STRING;
        case B2D_SET:
            return B2D_SET_STRING;
    }
}
/**
 * @param {B2DAxisString} op
 * @returns {B2DAxis}
 */
function parseAxis(op) {
    switch (op) {
        case B2D_B2DX_STRING:
            return B2D_B2DX;
        case B2D_B2DY_STRING:
            return B2D_B2DY;
        case B2D_B2D_STRING:
            return B2D_B2D;
    }
}

/**
 * @param {B2DAxis} op
 * @returns {B2DAxisString}
 */
function prettyAxis(op) {
    switch (op) {
        case B2D_B2DX:
            return B2D_B2DX_STRING;
        case B2D_B2DY:
            return B2D_B2DY_STRING;
        case B2D_B2D:
            return B2D_B2D_STRING;
    }
}

/**
 * Action for `B2D`
 */
export class B2DAction extends Action {
    /**
     * @param {B2DOp} op
     * @param {B2DAxis} axis
     */
    constructor(op, axis) {
        super();

        /**
         * @type {B2DOp}
         * @readonly
         */
        this.op = op;

        /**
         * @type {B2DAxis}
         * @readonly
         */
        this.axis = axis;
    }

    /**
     * @override
     */
    pretty() {
        return `${prettyOp(this.op)} ${prettyAxis(this.axis)}`;
    }

    /**
     * @param {string} str
     */
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [op, axis] = array;
        if (op === undefined || axis === undefined) {
            return undefined;
        }
        if (op === B2D_INC_STRING || op === B2D_TDEC_STRING) {
            if (axis === B2D_B2DX_STRING || axis === B2D_B2DY_STRING) {
                return new B2DAction(parseOp(op), parseAxis(axis));
            }
        } else if (op === B2D_READ_STRING || op === B2D_SET_STRING) {
            if (axis === B2D_B2D_STRING) {
                return new B2DAction(parseOp(op), parseAxis(axis));
            }
        }
        // APGsembly 1.0
        switch (op) {
            case B2D_INC_STRING: {
                switch (axis) {
                    case B2D_LEGACY_B2DX_STRING:
                        return new B2DAction(B2D_INC, B2D_B2DX);
                    case B2D_LEGACY_B2DY_STRING:
                        return new B2DAction(B2D_INC, B2D_B2DY);
                    default:
                        return undefined;
                }
            }
            case B2D_LEGACY_TDEC_STRING: {
                switch (axis) {
                    case B2D_LEGACY_B2DX_STRING:
                        return new B2DAction(B2D_TDEC, B2D_B2DX);
                    case B2D_LEGACY_B2DY_STRING:
                        return new B2DAction(B2D_TDEC, B2D_B2DY);
                    default:
                        return undefined;
                }
            }
            case B2D_READ_STRING: {
                switch (axis) {
                    case B2D_LEGACY_B2D_STRING:
                        return new B2DAction(B2D_READ, B2D_B2D);
                    default:
                        return undefined;
                }
            }
            case B2D_SET_STRING: {
                switch (axis) {
                    case B2D_LEGACY_B2D_STRING:
                        return new B2DAction(B2D_SET, B2D_B2D);
                    default:
                        return undefined;
                }
            }
        }
        return undefined;
    }

    /**
     * @override
     */
    doesReturnValue() {
        switch (this.op) {
            case B2D_INC:
                return false;
            case B2D_TDEC:
                return true;
            case B2D_READ:
                return true;
            case B2D_SET:
                return false;
        }
    }

    /**
     * @override
     * @param {Action} action
     * @returns {boolean}
     */
    isSameComponent(action) {
        if (action instanceof B2DAction) {
            const thisAxis = this.axis;
            const otherAxis = action.axis;
            if (thisAxis === B2D_B2DX && otherAxis === B2D_B2DY) {
                return false;
            } else if (thisAxis === B2D_B2DY && otherAxis === B2D_B2DX) {
                return false;
            }
            return true;
        }
        return false;
    }
}
