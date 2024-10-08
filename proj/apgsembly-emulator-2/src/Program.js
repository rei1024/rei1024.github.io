// @ts-check

import { Command, ComponentsHeader, RegistersHeader } from "./Command.js";
import { Action } from "./actions/Action.js";
import { BRegAction } from "./actions/BRegAction.js";
import { LegacyTRegAction } from "./actions/LegacyTRegAction.js";
import { URegAction } from "./actions/URegAction.js";
import { ProgramLines } from "./ProgramLines.js";
import { validateAll } from "./validate.js";

/**
 * APGsembly program
 */
export class Program {
    /**
     * @param {ProgramLines} programLines
     * @throw Error
     */
    constructor(programLines) {
        const programLinesArray = programLines.getArray();
        /**
         * @readonly
         * @type {ReadonlyArray<Command>}
         */
        this.commands = programLinesArray.flatMap((x) => {
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
        for (const x of programLinesArray) {
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

        for (const x of programLinesArray) {
            if (x instanceof RegistersHeader) {
                if (this.registersHeader !== undefined) {
                    throw Error(`Multiple ${RegistersHeader.key}`);
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
     * @param {{ noValidate?: boolean }} param1
     * @returns {Program | string}
     */
    static parse(str, { noValidate } = {}) {
        const programLines = ProgramLines.parse(str);
        if (typeof programLines === "string") {
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
        if (!noValidate) {
            if (commands.length === 0) {
                return "Program is empty";
            }

            const errorOrUndefined = validateAll(commands);
            if (typeof errorOrUndefined === "string") {
                return errorOrUndefined;
            }
        }

        try {
            return new Program(programLines);
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            } else {
                return "Unknown error is occurred.";
            }
        }
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
