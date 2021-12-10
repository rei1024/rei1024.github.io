// @ts-check

import { Program } from "../src/Program.js";

/**
 *
 * @param {string} input
 * @returns {string | Error}
 */
export function transpile(input) {
    const program = Program.parse(input);
    if (program instanceof Program) {
        return program.pretty();
    } else {
        return new Error(program);
    }
}
