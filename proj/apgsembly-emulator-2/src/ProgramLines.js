// @ts-check

import { Command, Comment, ComponentsHeader, EmptyLine, ProgramLine, RegistersHeader } from "./Command.js";

/**
 * プログラムの行の配列
 */
export class ProgramLines {
    /**
     * 
     * @param {ProgramLine[]} array 
     */
    constructor(array) {
        /**
         * @private
         */
        this.array = array;
    }

    /**
     * 
     * @returns {ProgramLine[]}
     */
    getArray() {
        return this.array;
    }

    /**
     * @returns {string}
     */
    pretty() {
        return this.getArray().map(line => line.pretty()).join('\n');
    }

    /**
     * stringはエラーメッセージ
     * string is an error
     * @param {string} str 
     * @returns {ProgramLines | string}
     */
    static parse(str) {
        const lines = str.split(/\r\n|\n|\r/);
        /** @type {ProgramLine[]} */
        const array = [];
        for (const line of lines) {
            const res = Command.parse(line);
            if (typeof res === 'string') {
                // エラーメッセージ
                return res;
            } else if (res instanceof Command) {
                array.push(res);
            } else if (res instanceof Comment) {
                array.push(res);
            } else if (res instanceof RegistersHeader) {
                array.push(res);
            } else if (res instanceof ComponentsHeader) {
                array.push(res);
            } else if (res instanceof EmptyLine) {
                array.push(res);
            } else {
                throw Error('ProgramLines.parse: internal error ' + line);
            }
        }

        return new ProgramLines(array);
    }
}
