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
     *   commands: Command[];
     *   componentsHeader: ComponentsHeader | undefined;
     *   registersHeader: RegistersHeader | undefined;
     *   programLines: ProgramLines
     * }} param0
     */
    constructor({
        commands,
        componentsHeader,
        registersHeader,
        programLines,
    }) {
        /**
         * @readonly
         */
        this.commands = commands;

        /**
         * @readonly
         */
        this.componentsHeader = componentsHeader;

        /** @readonly */
        this.registersHeader = registersHeader;

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
        /** @type {undefined | RegistersHeader} */
        let registersHeader = undefined;
        /** @type {undefined | ComponentsHeader} */
        let componentsHeader = undefined;
        for (const programLine of programLines.getArray()) {
            if (programLine instanceof Command) {
                commands.push(programLine);
            } else if (programLine instanceof ComponentsHeader) {
                if (componentsHeader !== undefined) {
                    return `Multiple ${ComponentsHeader.key}`;
                }
                componentsHeader = programLine;
            } else if (programLine instanceof RegistersHeader) {
                if (registersHeader !== undefined) {
                    return `Multiple ${RegistersHeader.key}`;
                }
                registersHeader = programLine;
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

        return new Program({
            commands: commands,
            registersHeader: registersHeader,
            componentsHeader: componentsHeader,
            programLines: programLines
        });
    }

    /**
     * @returns {Program}
     */
    reconstructProgramLines() {
        return new Program({
            commands: this.commands,
            componentsHeader: this.componentsHeader,
            registersHeader: this.registersHeader,
            programLines: new ProgramLines(this.commands.slice())
        });
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
        if (this.commands.length >= 1 && this.programLines.getArray().length === 0) {
            // 合成された場合
            let str = "";
            if (this.componentsHeader !== undefined) {
                str += this.componentsHeader.pretty() + "\n";
            }
            if (this.registersHeader !== undefined) {
                str += this.registersHeader.pretty() + "\n";
            }
            str += this.commands.map(command => command.pretty()).join('\n');

            return str.trim();
        } else {
            return this.programLines.pretty();
        }
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
