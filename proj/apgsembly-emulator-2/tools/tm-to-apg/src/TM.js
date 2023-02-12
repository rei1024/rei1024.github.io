// @ts-check

import { Line } from "./Line.js";

export class TM {
    /**
     * @param {ReadonlyArray<Line>} lines
     */
    constructor(lines) {
        /**
         * @type {ReadonlyArray<Line>}
         * @readonly
         */
        this.lines = lines;
    }

    /**
     * @param {string} str
     * @returns {TM | Error}
     */
    static parse(str) {
        const array = str.split(/\r\n|\n|\r/u);

        /**
         * @type {Line[]}
         */
        const lines = [];

        for (const lineStr of array) {
            const line = Line.parse(lineStr);
            if (line instanceof Error) {
                return line;
            } else if (line instanceof Line) {
                lines.push(line);
            }
        }

        return new TM(lines);
    }

    /**
     * @returns {string[]}
     */
    getSymbols() {
        /**
         * @type {Set<string>}
         */
        const symbols = new Set();

        for (const line of this.lines) {
            const currentSymbol = line.currentSymbol;
            if (currentSymbol !== undefined) {
                symbols.add(currentSymbol);
            }
            const newSymbol = line.newSymbol;
            if (newSymbol !== undefined) {
                symbols.add(newSymbol);
            }
        }
        return [...symbols];
    }

    /**
     * @returns {string[]}
     */
    getStates() {
        /**
         * @type {Set<string>}
         */
        const states = new Set();

        for (const line of this.lines) {
            const currentState = line.currentState;
            if (currentState !== undefined) {
                states.add(currentState);
            }
        }
        for (const line of this.lines) {
            const newState = line.newState;
            if (newState !== undefined) {
                states.add(newState);
            }
        }
        return [...states];
    }
}
