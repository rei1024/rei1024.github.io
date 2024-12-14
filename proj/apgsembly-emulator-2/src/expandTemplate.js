// @ts-check

import { Command, Include, Insert } from "./Command.js";
import { internalError } from "./internalError.js";
import { ProgramLines } from "./ProgramLines.js";

/**
 *
 * @param {string} templateLine
 * @param {{
    defaultReplacements: {
        needle: string;
        replacement: string;
    }[];
    lines: string[];
}} template
 * @param {{
        needle: string;
        replacement: string;
    }[]} insertReplacements
 * @returns {string}
 */
function replaceTemplate(templateLine, template, insertReplacements) {
    let replacedStr = templateLine;
    for (const reps of insertReplacements) {
        replacedStr = replacedStr.replaceAll(
            reps.needle,
            reps.replacement,
        );
    }
    for (const reps of template.defaultReplacements) {
        replacedStr = replacedStr.replaceAll(
            reps.needle,
            reps.replacement,
        );
    }
    return replacedStr;
}

/**
 * @param {ProgramLines} programLines
 * @param {{ name: string; programLines: ProgramLines }[]} libraries
 * @returns {Command[]}
 */
export function expandTemplate(programLines, libraries) {
    /**
     * @type {Command[]}
     */
    const commands = [];

    const templates = new Map(programLines.getTemplates().entries());

    const lines = programLines.getArray().slice().reverse();

    /**
     * @param {ProgramLines} newLines
     */
    function addLines(newLines) {
        const addArray = newLines.getArray();
        for (let i = addArray.length - 1; i >= 0; i--) {
            lines.push(addArray[i] ?? internalError());
        }
        for (
            const [newTemplateName, newTemplate] of newLines
                .getTemplates()
        ) {
            if (templates.get(newTemplateName) != null) {
                throw new Error(
                    `#DEFINE duplicate template name "${newTemplateName}"`,
                );
            }
            templates.set(newTemplateName, newTemplate);
        }
    }

    while (lines.length >= 1) {
        const line = lines.pop();
        if (line instanceof Command) {
            commands.push(line);
        } else if (line instanceof Include) {
            const file = libraries.find((x) => x.name === line.filename);
            if (file == null) {
                throw new Error(
                    `#INCLUDE file not found: "${line.filename}". Add a library file.`,
                );
            }
            addLines(file.programLines);
        } else if (line instanceof Insert) {
            const template = templates.get(line.templateName);
            if (template == null) {
                throw new Error(`Undefined template: "${line.templateName}"`);
            }
            const replacedSource = template.lines.map((templateLine) =>
                replaceTemplate(templateLine, template, line.replacements)
            ).join("\n");
            const newProgramLines = ProgramLines.parse(replacedSource);
            if (typeof newProgramLines === "string") {
                throw new Error(newProgramLines);
            }
            addLines(newProgramLines);
        }
    }

    return commands;
}
