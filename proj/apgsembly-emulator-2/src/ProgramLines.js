// @ts-check

import { ProgramLine, parseProgramLine } from "./Command.js";

/**
 * プログラムの行の配列
 */
export class ProgramLines {
    /**
     *
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
     *
     * @returns {ReadonlyArray<ProgramLine>}
     */
    getArray() {
        return this.array;
    }

    /**
     * @returns {string}
     */
    pretty() {
        return this.array.map(line => line.pretty()).join('\n');
    }

    /**
     * 1行をパース
     * stringはエラーメッセージ
     * string is an error
     * @param {string} str
     * @returns {ProgramLines | string}
     */
    static parse(str) {
        const lines = str.split(/\r\n|\n|\r/u);

        const programLineWithErrorArray = lines.map((line, index) => parseProgramLine(line, index + 1));

        const errors = programLineWithErrorArray
            .flatMap(x => typeof x === 'string' ? [x] : []);

        if (errors.length > 0) {
            return errors.join('\n');
        }

        const programLines = programLineWithErrorArray
            .flatMap(x => typeof x !== 'string' ? [x] : []);

        return new ProgramLines(programLines);
    }
}
