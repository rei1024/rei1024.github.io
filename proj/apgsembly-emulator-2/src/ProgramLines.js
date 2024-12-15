// @ts-check

import {
    Command,
    Define,
    Enddef,
    parseProgramLine,
    ProgramLine,
} from "./Command.js";
import { internalError } from "./internalError.js";

/**
 * プログラムの行の配列
 */
export class ProgramLines {
    /**
     * @param {ReadonlyArray<ProgramLine>} array
     * @param {ReadonlyMap<string, { defaultReplacements: { needle: string; replacement: string }[]; lines: string[] }>} templates
     */
    constructor(array, templates = new Map()) {
        /**
         * @private
         * @readonly
         */
        this.templates = templates;
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
     * @returns {ReadonlyMap<string, { defaultReplacements: { needle: string; replacement: string }[]; lines: string[] }>}
     */
    getTemplates() {
        return this.templates;
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

        /**
         * @type {string[]}
         */
        const errors = [];
        /**
         * @type {ProgramLine[]}
         */
        const programLines = [];

        /**
         * @type {Map<string, { defaultReplacements: { needle: string; replacement: string }[]; lines: string[] }>}
         */
        const templates = new Map();

        /** @type {string | null} */
        let activeTemplateName = null;
        for (const [index, lineStr] of lines.entries()) {
            if (activeTemplateName != null) {
                if (lineStr.trimStart().startsWith(Enddef.key)) {
                    const line = parseProgramLine(lineStr);
                    if (line instanceof Enddef) {
                        activeTemplateName = null;
                        continue;
                    }
                }
                const template = templates.get(activeTemplateName);
                if (template == null) {
                    internalError();
                }
                template.lines.push(lineStr);
                continue;
            }
            const line = parseProgramLine(lineStr, index + 1);
            if (line instanceof Define) {
                if (activeTemplateName != null) {
                    // TODO: line number
                    return `#DEFINE needs #ENDDEF ${line.pretty()}`;
                }
                activeTemplateName = line.name;
                if (templates.get(activeTemplateName) != null) {
                    return `#DEFINE duplicate template name ${line.pretty()}`;
                }
                templates.set(activeTemplateName, {
                    defaultReplacements: line.defaultReplacements,
                    lines: [],
                });
            } else if (line instanceof Enddef) {
                return `#ENDDEF needs #DEFINE ${line.pretty()}`;
            } else if (line instanceof ProgramLine) {
                programLines.push(line);
            } else if (typeof line === "string") {
                errors.push(line);
            } else {
                internalError();
            }
        }

        if (activeTemplateName != null) {
            errors.push(`#DEFINE needs #ENDDEF. "${activeTemplateName}"`)
        }

        if (errors.length > 0) {
            return errors.join("\n");
        }

        return new ProgramLines(programLines, templates);
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
