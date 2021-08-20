// @ts-check

import { Action } from "./actions/Action.js";
import { parseAction } from "./actions/parse.js";

/**
 * 初期状態
 */
export const INITIAL_STATE = "INITIAL";

/**
 * @abstract
 */
export class ProgramLine {
    /**
     * @returns {string}
     */
    pretty() {
        return `unimplemented`;
    }
}

/**
 * `#COMPONENTS`
 */
export class ComponentsHeader extends ProgramLine {
    /**
     *
     * @param {string} content
     */
    constructor(content) {
        super();

        /**
         * @readonly
         */
        this.content = content;
    }

    /**
     * @returns {string}
     */
    static get key() {
        return "#COMPONENTS";
    }

    /**
     *
     * @returns {string}
     * @override
     */
    pretty() {
        return ComponentsHeader.key + " " + this.content;
    }
}

/**
 * `#REGISTERS`
 */
export class RegistersHeader extends ProgramLine {
    /**
     *
     * @param {string} content
     */
    constructor(content) {
        super();

        /**
         * @readonly
         */
        this.content = content;
    }

    /**
     * @returns {string}
     */
    static get key() {
        return "#REGISTERS";
    }

    /**
     * @override
     * @returns {string}
     */
    pretty() {
        return RegistersHeader.key + " " + this.content;
    }
}

/**
 * コメント
 */
export class Comment extends ProgramLine {
    /**
     *
     * @param {string} str
     */
    constructor(str) {
        super();

        /**
         * @readonly
         * @private
         */
        this.str = str;
    }

    /**
     * シャープを含む
     * @returns {string}
     */
    getString() {
        return this.str;
    }

    /**
     * @override
     */
    pretty() {
        return this.getString();
    }
}

/**
 * 空行
 */
export class EmptyLine extends ProgramLine {
    constructor() {
        super();
    }

    /**
     * @override
     */
    pretty() {
        return "";
    }
}

/**
 *
 * @param {string} inputStr
 * @returns {"Z" | "NZ" | "ZZ" | "*" | undefined}
 */
function parseInput(inputStr) {
    switch (inputStr) {
        case "Z": return inputStr;
        case "NZ": return inputStr;
        case "ZZ": return inputStr;
        case "*": return inputStr;
        default: return undefined;
    }
}

/**
 * A line of program
 */
export class Command extends ProgramLine {
    /**
     *
     * @param {{
     *    state: string;
     *    input: "Z" | "NZ" | "ZZ" | "*";
     *    nextState: string;
     *    actions: Action[]
     * }} param0
     */
    constructor({ state, input, nextState, actions }) {
        super();

        /**
         * @readonly
         */
        this.state = state;

        /**
         * @readonly
         */
        this.input = input;

        /**
         * @readonly
         */
        this.nextState = nextState;

        /**
         * @readonly
         */
        this.actions = actions;
    }

    /**
     * CommandまたはCommentまたは空行またはエラーメッセージ
     * @param {string} str
     * @returns {Command | RegistersHeader | ComponentsHeader | Comment | EmptyLine | string}
     */
    static parse(str) {
        if (typeof str !== 'string') {
            throw TypeError('str is not a string');
        }
        const trimmedStr = str.trim();
        if (trimmedStr === "") {
            return new EmptyLine();
        }
        if (trimmedStr.startsWith("#")) {
            // ヘッダーをパースする
            if (trimmedStr.startsWith(ComponentsHeader.key)) {
                return new ComponentsHeader(trimmedStr.slice(ComponentsHeader.key.length).trim());
            } else if (trimmedStr.startsWith(RegistersHeader.key)) {
                return new RegistersHeader(trimmedStr.slice(RegistersHeader.key.length).trim());
            }
            return new Comment(str);
        }
        const array = trimmedStr.split(/\s*;\s*/u);
        if (array.length < 4) {
            return `Invalid command "${str}"`;
        }
        if (array.length > 4) {
            if (array[4] === "") {
                return `Extraneous semicolon "${str}"`;
            }
            return `Invalid command "${str}"`;
        }
        // arrayの長さは4
        const state = array[0] ?? this.error();
        const inputStr = array[1] ?? this.error();
        const nextState = array[2] ?? this.error();
        const actionsStr = array[3] ?? this.error();
        const actionStrs = actionsStr.trim().split(/\s*,\s*/u);

        /** @type {Action[]} */
        const actions = [];
        for (const actionsStr of actionStrs) {
            const result = parseAction(actionsStr);
            if (result === undefined) {
                return `Unknown action "${actionsStr}" at "${str}"`;
            }
            actions.push(result);
        }

        const input = parseInput(inputStr);
        if (input === undefined) {
            return `Unknown input "${inputStr}" at "${str}"`;
        }

        return new Command({
            state: state,
            input: input,
            nextState: nextState,
            actions: actions
        });
    }

    /**
     * @private
     * @returns {never}
     */
    static error() {
        throw Error('internal error');
    }

    /**
     * 文字列化する
     * @override
     * @returns {string}
     */
    pretty() {
        return `${this.state}; ${this.input}; ${this.nextState}; ${this.actions.map(a => a.pretty()).join(", ")}`;
    }
}
