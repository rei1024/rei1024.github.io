// @ts-check

import { Command, ComponentsHeader, RegistersHeader } from "./Command.js";
import { ProgramLines } from "./ProgramLines.js";
import {
    validateActionReturnOnce,
    validateNoDuplicatedAction,
    validateNoSameComponent,
    validateNextStateIsNotINITIAL,
    validateZAndNZ
} from "./validate.js";

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
                    return 'Multiple #COMPONENTS';
                }
                componentsHeader = programLine;
            } else if (programLine instanceof RegistersHeader) {
                if (registersHeader !== undefined) {
                    return 'Multiple #REGISTER';
                }
                registersHeader = programLine;
            }
        }

        // validation
        if (commands.length === 0) {
            return 'Program is empty';
        }
        const duplicateError = validateNoDuplicatedAction(commands);
        if (typeof duplicateError === 'string') {
            return duplicateError;
        }
        const returnOnceError = validateActionReturnOnce(commands);
        if (typeof returnOnceError === 'string') {
            return returnOnceError;
        }
        const noSameComponentError = validateNoSameComponent(commands);
        if (typeof noSameComponentError === 'string') {
            return noSameComponentError;
        }

        const nextStateIsNotInitialError = validateNextStateIsNotINITIAL(commands);
        if (typeof nextStateIsNotInitialError === 'string') {
            return nextStateIsNotInitialError;
        }

        const zAndNZError = validateZAndNZ(commands);
        if (typeof zAndNZError === 'string') {
            return zAndNZError;
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
     * @returns {number[]}
     */
    extractUnaryRegisterNumbers() {
        const array = this.commands.flatMap(command => command.actions)
            .flatMap(action => action.extractUnaryRegisterNumbers());
        return sortNub(array);
    }

    /**
     * @returns {number[]}
     */
    extractBinaryRegisterNumbers() {
        const array = this.commands.flatMap(command => command.actions)
            .flatMap(action => action.extractBinaryRegisterNumbers());
        return sortNub(array);
    }

    /**
     * @returns {number[]}
     */
    extractLegacyTRegisterNumbers() {
        const array = this.commands.flatMap(command => command.actions)
            .flatMap(action => action.extractLegacyTRegisterNumbers());
        return sortNub(array);
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
