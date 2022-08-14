// @ts-check

import { Command, ComponentsHeader, RegistersHeader } from "./Command.js";
import { Action } from "./actions/Action.js";
import { ProgramLines } from "./ProgramLines.js";
import { validateAll } from "./validate.js";

/**
 * APGsembly program
 */
export class Program {
    /**
     *
     * @param {{
     *   programLines: ProgramLines
     * }} param0
     * @throw Error
     */
    constructor({
        programLines,
    }) {
        /**
         * @readonly
         * @type {Command[]}
         */
        this.commands = programLines.getArray().flatMap(x => {
            if (x instanceof Command) {
                return [x];
            } else {
                return [];
            }
        });

        /**
         * @readonly
         * @type {ComponentsHeader | undefined}
         */
        this.componentsHeader = undefined;
        for (const x of programLines.getArray()) {
            if (x instanceof ComponentsHeader) {
                if (this.componentsHeader !== undefined) {
                    throw Error(`Multiple ${ComponentsHeader.key}`);
                }
                this.componentsHeader = x;
            }
        }

        /**
         * @readonly
         * @type {RegistersHeader | undefined}
         */
        this.registersHeader = undefined;

        for (const x of programLines.getArray()) {
            if (x instanceof RegistersHeader) {
                if (this.registersHeader !== undefined) {
                    throw new Error(`Multiple ${RegistersHeader.key}`);
                }
                this.registersHeader = x;
            }
        }

        /** @readonly */
        this.programLines = programLines;
    }

    /**
     * プログラムまたはエラーメッセージ
     * Program or error message
     * @param {string} str
     * @returns {Program | string}
     */
    static parse(str) {
        const programLines = ProgramLines.parse(str);
        if (typeof programLines === 'string') {
            return programLines;
        }

        /** @type {Command[]} */
        const commands = [];

        for (const programLine of programLines.getArray()) {
            if (programLine instanceof Command) {
                commands.push(programLine);
            }
        }

        // validation
        if (commands.length === 0) {
            return 'Program is empty';
        }

        const errorOrUndefined = validateAll(commands);
        if (typeof errorOrUndefined === 'string') {
            return errorOrUndefined;
        }

        try {
            return new Program({
                programLines: programLines
            });
        } catch (error) {
            // @ts-expect-error TODO
            return error.message;
        }
    }

    /**
     * @private
     * @returns {Action[]}
     */
    _actions() {
        return this.commands.flatMap(command => command.actions);
    }

    /**
     * @returns {number[]}
     */
    extractUnaryRegisterNumbers() {
        return sortNub(this._actions().flatMap(a => a.extractUnaryRegisterNumbers()));
    }

    /**
     * @returns {number[]}
     */
    extractBinaryRegisterNumbers() {
        return sortNub(this._actions().flatMap(a => a.extractBinaryRegisterNumbers()));
    }

    /**
     * @returns {number[]}
     */
    extractLegacyTRegisterNumbers() {
        return sortNub(this._actions().flatMap(a => a.extractLegacyTRegisterNumbers()));
    }

    /**
     * 文字列化する
     * @returns {string}
     */
    pretty() {
        return this.programLines.pretty();
    }
}

/**
 * 要素を一意にしてソートする
 * @param {number[]} array
 * @returns {number[]}
 */
function sortNub(array) {
    return [...new Set(array)].sort((a, b) => a - b);
}
