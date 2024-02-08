// @ts-check

import { SUB_A1, SUB_B0, SUB_B1 } from "../action_consts/Sub_consts.js";
import { Action } from "./Action.js";

const SUB_A1_STRING = "A1";
const SUB_B0_STRING = "B0";
const SUB_B1_STRING = "B1";

const SUB_STRING = "SUB";

/**
 * @typedef {SUB_A1 | SUB_B0 | SUB_B1} SubOp
 */

/**
 * @typedef {SUB_A1_STRING | SUB_B0_STRING | SUB_B1_STRING} SubOpString
 */

/**
 * @param {SubOp} op
 * @returns {SubOpString}
 */
const prettyOp = (op) => {
    switch (op) {
        case SUB_A1:
            return SUB_A1_STRING;
        case SUB_B0:
            return SUB_B0_STRING;
        case SUB_B1:
            return SUB_B1_STRING;
    }
};

/**
 * @param {SubOpString} op
 * @returns {SubOp}
 */
const parseOp = (op) => {
    switch (op) {
        case SUB_A1_STRING:
            return SUB_A1;
        case SUB_B0_STRING:
            return SUB_B0;
        case SUB_B1_STRING:
            return SUB_B1;
    }
};

/**
 * Action for `SUB`
 */
export class SubAction extends Action {
    /**
     * @param {SubOp} op
     */
    constructor(op) {
        super();

        /**
         * @type {SubOp}
         * @readonly
         */
        this.op = op;
    }

    /**
     * @override
     */
    pretty() {
        return `${SUB_STRING} ${prettyOp(this.op)}`;
    }

    /**
     * @param {string} str
     * @returns {SubAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }

        const [sub, reg] = array;
        if (sub !== SUB_STRING) {
            return undefined;
        }

        if (
            reg === SUB_A1_STRING || reg === SUB_B0_STRING ||
            reg === SUB_B1_STRING
        ) {
            return new SubAction(parseOp(reg));
        }

        return undefined;
    }

    /**
     * @returns @override
     */
    doesReturnValue() {
        switch (this.op) {
            case SUB_A1:
                return false;
            case SUB_B0:
                return true;
            case SUB_B1:
                return true;
        }
    }

    /**
     * @override
     * @param {Action} action
     * @returns {boolean}
     */
    isSameComponent(action) {
        return action instanceof SubAction;
    }
}
