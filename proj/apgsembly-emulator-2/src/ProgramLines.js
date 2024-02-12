// @ts-check

import { Command, parseProgramLine, ProgramLine } from "./Command.js";

/**
 * プログラムの行の配列
 */
export class ProgramLines {
    /**
     * @param {ReadonlyArray<ProgramLine>} array
     */
    constructor(array) {
        /**
         * @private
         * @readonly
         */
        this.array = array;
    }

    /**
     * @returns {ReadonlyArray<ProgramLine>}
     */
    getArray() {
        return this.array;
    }

    /**
     * @returns {string}
     */
    pretty() {
        return this.array.map((line) => line.pretty()).join("\n");
    }

    /**
     * Parse a source code
     * @param {string} str
     * @returns {ProgramLines | string} string is an error
     */
    static parse(str) {
        const lines = str.split(/\r\n|\n|\r/u);

        const programLineWithErrorArray = lines.map((line, index) =>
            parseProgramLine(line, index + 1)
        );

        const errors = programLineWithErrorArray
            .flatMap((x) => typeof x === "string" ? [x] : []);

        if (errors.length > 0) {
            return errors.join("\n");
        }

        const programLines = programLineWithErrorArray
            .flatMap((x) => typeof x !== "string" ? [x] : []);

        return new ProgramLines(programLines);
    }
}

/**
 * @param {ProgramLines} programLines
 */
export function format(programLines) {
    const lines = programLines.getArray();
    const commands = lines.flatMap((line) =>
        line instanceof Command ? [line] : []
    );
    const maxStateName = commands.reduce(
        (acc, x) => Math.max(acc, x.state.length),
        0,
    );
    const maxNextStateName = commands.reduce(
        (acc, x) => Math.max(acc, x.nextState.length),
        0,
    );

    return lines.map((line) => {
        if (line instanceof Command) {
            const spaceState = maxStateName - line.state.length;
            const inputSpace = 2 - line.input.length;
            const nextStateSpace = maxNextStateName - line.nextState.length;
            return `${line.state}; ${" ".repeat(spaceState)}${line.input}; ${
                " ".repeat(inputSpace)
            }${line.nextState}; ${" ".repeat(nextStateSpace)}${
                line.actions.map((a) => a.pretty()).join(", ")
            }`;
        } else {
            return line.pretty();
        }
    }).join("\n");
}
