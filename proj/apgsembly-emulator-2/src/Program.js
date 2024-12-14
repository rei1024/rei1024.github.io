// @ts-check

import { Command, ComponentsHeader, RegistersHeader } from "./Command.js";
import { Action } from "./actions/Action.js";
import { BRegAction } from "./actions/BRegAction.js";
import { LegacyTRegAction } from "./actions/LegacyTRegAction.js";
import { URegAction } from "./actions/URegAction.js";
import { ProgramLines } from "./ProgramLines.js";
import { validateAll } from "./validate.js";
import { expandTemplate } from "./expandTemplate.js";

/**
 * APGsembly program
 */
export class Program {
    /**
     * @param {ReadonlyArray<Command>} commands
     * @param {ComponentsHeader[]} componentsHeaders
     * @param {RegistersHeader[]} registersHeaders
     * @throw Error
     */
    constructor(commands, componentsHeaders, registersHeaders) {
        /**
         * @readonly
         * @type {ReadonlyArray<Command>}
         */
        this.commands = commands;

        /**
         * @readonly
         * @type {ComponentsHeader[]}
         */
        this.componentsHeader = componentsHeaders;

        /**
         * @readonly
         * @type {RegistersHeader[]}
         */
        this.registersHeader = registersHeaders;
    }

    /**
     * プログラムまたはエラーメッセージ
     * Program or error message
     * @param {string} str
     * @param {{ noValidate?: boolean, libraryFiles?: { name: string; content: string }[] }} param1
     * @returns {Program | string}
     */
    static parse(str, { noValidate, libraryFiles } = {}) {
        const programLines = ProgramLines.parse(str);
        if (typeof programLines === "string") {
            return programLines;
        }

        /** @type {{ name: string; programLines: ProgramLines }[]} */
        const libraries = [];
        for (const libraryFile of libraryFiles ?? []) {
            const libraryProgramLines = ProgramLines.parse(libraryFile.content);
            if (typeof libraryProgramLines === "string") {
                return libraryProgramLines;
            }
            libraries.push({
                name: libraryFile.name,
                programLines: libraryProgramLines,
            });
        }

        /** @type {Command[]} */
        const commands = expandTemplate(programLines, libraries);
        // validation
        if (!noValidate) {
            if (commands.length === 0) {
                return "Program is empty";
            }

            const errorOrUndefined = validateAll(commands);
            if (typeof errorOrUndefined === "string") {
                return errorOrUndefined;
            }
        }

        return new Program(
            commands,
            programLines.getArray().flatMap((x) => {
                return x instanceof ComponentsHeader ? [x] : [];
            }),
            programLines.getArray().flatMap((x) => {
                return x instanceof RegistersHeader ? [x] : [];
            }),
        );
    }
}

/**
 * 要素を一意にしてソートする
 * @param {number[]} array
 * @returns {number[]}
 */
const sortNub = (array) => {
    return [...new Set(array)].sort((a, b) => a - b);
};

/**
 * プログラムから使用されているレジスタ番号を抽出
 * @param {Program} program
 * @returns {{ unary: number[], binary: number[], legacyT: number[] }}
 */
export const extractRegisterNumbers = (program) => {
    /** @type {readonly Action[]} */
    const actions = program.commands.flatMap((command) => command.actions);

    /**
     * @template {Action & { regNumber: number }} T
     * @param {new (...args: any[]) => T} klass
     * @returns {number[]}
     */
    const getNumbers = (klass) => {
        return sortNub(actions.flatMap(
            (action) => action instanceof klass ? [action.regNumber] : [],
        ));
    };

    return {
        unary: getNumbers(URegAction),
        binary: getNumbers(BRegAction),
        legacyT: getNumbers(LegacyTRegAction),
    };
};
