// @ts-check

import { ADD_A1, ADD_B0, ADD_B1 } from "../action_consts/Add_consts.js";
import { Action } from "./Action.js";

const ADD_A1_STRING = "A1";
const ADD_B0_STRING = "B0";
const ADD_B1_STRING = "B1";

const ADD_STRING = "ADD";

/**
 * @typedef {ADD_A1 | ADD_B0 | ADD_B1} AddOp
 */

/**
 * @typedef {ADD_A1_STRING | ADD_B0_STRING | ADD_B1_STRING} AddOpString
 */

/**
 * @param {AddOp} op
 * @returns {AddOpString}
 */
function prettyOp(op) {
    switch (op) {
        case ADD_A1:
            return ADD_A1_STRING;
        case ADD_B0:
            return ADD_B0_STRING;
        case ADD_B1:
            return ADD_B1_STRING;
    }
}

/**
 * @param {AddOpString} op
 * @returns {AddOp}
 */
function parseOp(op) {
    switch (op) {
        case ADD_A1_STRING:
            return ADD_A1;
        case ADD_B0_STRING:
            return ADD_B0;
        case ADD_B1_STRING:
            return ADD_B1;
    }
}

/**
 * Action for `ADD`
 */
export class AddAction extends Action {
    /**
     * @param {AddOp} op
     */
    constructor(op) {
        super();

        /**
         * @type {AddOp}
         * @readonly
         */
        this.op = op;
    }

    /**
     * @override
     */
    pretty() {
        return `${ADD_STRING} ${prettyOp(this.op)}`;
    }

    /**
     * 文字列から変換する
     * @param {string} str
     * @returns {AddAction | undefined}
     */
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [add, reg] = array;
        if (add !== ADD_STRING) {
            return undefined;
        }
        if (
            reg === ADD_A1_STRING || reg === ADD_B0_STRING ||
            reg === ADD_B1_STRING
        ) {
            return new AddAction(parseOp(reg));
        }
        return undefined;
    }

    /**
     * @override
     */
    doesReturnValue() {
        switch (this.op) {
            case ADD_A1:
                return false;
            case ADD_B0:
                return true;
            case ADD_B1:
                return true;
        }
    }

    /**
     * @override
     * @param {Action} action
     * @returns {boolean}
     */
    isSameComponent(action) {
        return action instanceof AddAction;
    }
}
