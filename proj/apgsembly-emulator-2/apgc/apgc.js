// @ts-check

import { Command, ProgramLines, Program } from "./apgc_deps.js";

import { APGCCompiler } from "./compiler/apgc_compiler.js";
import { apgcProgramParser } from "./parser/apgc_parser.js";
import { APGCProgram } from "./types/apgc_types.js";
import { validate } from "./validator/apgc_validator.js";

// string (APGC)
// ↓ parser
// APGCProgram
// ↓ compiler
// Program (APGsembly)
// ↓ pretty
// string (APGsembly)

/**
 * 構文解析
 * @param {string} string 
 * @returns {APGCProgram}
 * @throws
 */
export function parser(string) {
    return apgcProgramParser(string);
}

/**
 * コンパイル
 * @param {APGCProgram} program 
 * @returns {Program}
 * @throws
 */
export function compiler(program) {
    /** @type {Command[]} */
    const commands = new APGCCompiler(program).compile();
    return new Program({
        commands: commands,
        componentsHeader: undefined,
        registersHeader: undefined,
        programLines: new ProgramLines([])
    }).reconstructProgramLines();
}

/**
 * APGCからAPGsemblyへ変換する
 * @param {string} str APGC
 * @returns {string} APGsembly
 * @throws
 */
export function main(str) {
    const apgcProgram = parser(str);
    validate(apgcProgram);

    return apgcProgram.headers.map(x => x + "\n").join("") + compiler(apgcProgram).pretty();
}

/**
 * 
 * @param {string} str APGC
 * @returns {string} APGsembly
 */
export function mainWithComment(str) {
    const header = `\n# State    Input    Next state    Actions\n# ---------------------------------------\n`;
    return "# Generated from APGC \n" + str.trim().split('\n').map(x => "# " + x).join('\n') + "\n" + header + main(str);
}
