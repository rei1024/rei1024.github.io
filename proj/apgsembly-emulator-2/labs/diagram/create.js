import { Program } from "../../src/exports.js";

/**
 *
 * @param {string} apgsemblySource
 * @returns {string} graph definition
 */
export function create(apgsemblySource) {
    const program = Program.parse(apgsemblySource);
    if (typeof program === 'string') {
        throw Error(program);
    }

    /** @type {Edge[]} */
    const data = [];
    for (const command of program.commands) {
        data.push({
            from: command.state,
            to: command.nextState,
            note: command.input === '*' ? null : command.input
        });
    }
    return createGraphDefinition(data);
}

// https://github.com/mermaid-js/mermaid/blob/9ac3992fd2e9b679d79b9e798c0918253d42f608/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L566
/**
 *
 * @param {string} char
 */
function isSimpleChar(char) {
    if ('A' <= char && char <= 'Z') {
        return true;
    }
    if ('a' <= char && char <= 'z') {
        return true;
    }
    if ('0' <= char && char <= '9') {
        return true;
    }
    switch (char) {
        case "_":
        case ":":
        case ",":
        case ".":
        case "+":
        case "-":
        case "=":
        case "*":
        case "&":
            return true;
    }

    try {
        // Unicode character property
        if (char.match(/\p{L}/u)) {
            return true;
        }
    } catch (error) {
        // nop
    }

    return false;
}

/**
 *
 * @param {string} str
 */
function encodeKey(str) {
    return [...str].map(c => {
        if (isSimpleChar(c)) {
            return c;
        } else {
            return "__" + c.charCodeAt(0).toString(16);
        }
    }).join("");
}

/**
 * @typedef {{ from: string; to: string; note?: string | undefined | null }} Edge
 */

/**
 * @param {Edge[]} data
 * @returns {string}
 */
function createGraphDefinition(data) {
    return `graph TB\n` + data.map(item => {
        const from = `${encodeKey(item.from)}["${item.from}"]`;
        const to = `${encodeKey(item.to)}["${item.to}"]`;
        const note = item.note ? `|"${item.note}"|` : '';
        return `${from}-->${note}${to}`;
    }).join('\n');
}
