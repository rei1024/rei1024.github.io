// @ts-check

import { Command, ComponentsHeader, RegistersHeader } from "./Command.js";
import { Action } from "./actions/Action.js";
import { BRegAction } from "./actions/BRegAction.js";
import { LegacyTRegAction } from "./actions/LegacyTRegAction.js";
import { URegAction } from "./actions/URegAction.js";
import { ProgramLines } from "./ProgramLines.js";
import { validateAll } from "./validate.js";
import { expandTemplate } from "./expandTemplate.js";
import { AddAction } from "./actions/AddAction.js";
import { MulAction } from "./actions/MulAction.js";
import { SubAction } from "./actions/SubAction.js";
import { B2DAction } from "./actions/B2DAction.js";
import { OutputAction } from "./actions/OutputAction.js";

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
 * @typedef {{
 * unary: number[],
 * binary: number[],
 * legacyT: number[],
 * hasAdd: boolean,
 * hasSub: boolean,
 * hasMul: boolean,
 * hasB2D: boolean,
 * hasOutput: boolean, }} AnalyzeProgramResult
 */

/**
 * プログラムから使用されているレジスタ番号を抽出
 * @param {Program} program
 * @returns {AnalyzeProgramResult}
 */
export const analyzeProgram = (program) => {
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

    let hasAdd = false;
    let hasSub = false;
    let hasMul = false;
    let hasB2D = false;
    let hasOutput = false;

    for (const action of actions) {
        if (action instanceof AddAction) {
            hasAdd = true;
        } else if (action instanceof SubAction) {
            hasSub = true;
        } else if (action instanceof MulAction) {
            hasMul = true;
        } else if (action instanceof B2DAction) {
            hasB2D = true;
        } else if (action instanceof OutputAction) {
            hasOutput = true;
        }
    }

    return {
        unary: getNumbers(URegAction),
        binary: getNumbers(BRegAction),
        legacyT: getNumbers(LegacyTRegAction),
        hasAdd,
        hasSub,
        hasMul,
        hasB2D,
        hasOutput,
    };
};
