// @ts-check

/// <reference types="./monaco" />

// https://microsoft.github.io/monaco-editor/api/modules/monaco.languages.html#registerCompletionItemProvider

import {
    completionParser,
    emptyArgFuncs,
    numArgFuncs,
    strArgFuncs,
} from "../integration.js";

const SNIPPET = monaco.languages.CompletionItemKind.Snippet;
const INSERT_AS_SNIPPET =
    monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
const FUNC_KIND = monaco.languages.CompletionItemKind.Function;

// 再利用しない
const fixedSuggestions = () => [
    {
        label: "REGISTERS",
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: "REGISTERS",
        documentation: "#REGISTERS",
        detail: "#REGISTERS",
    },
    {
        label: "COMPONENTS",
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: "COMPONENTS",
        documentation: "#COMPONENTS",
        detail: "#COMPONENTS",
    },
    {
        label: "if_z",
        kind: SNIPPET,
        insertText: ["if_z (${1:condition}) {", "\t$0", "}"].join("\n"),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "if_z statement",
        detail: "if_z statement",
    },
    {
        label: "if_nz",
        kind: SNIPPET,
        insertText: ["if_nz (${1:condition}) {", "\t$0", "}"].join(
            "\n",
        ),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "if_nz statement",
        detail: "if_nz statement",
    },
    {
        label: "else",
        kind: SNIPPET,
        insertText: ["else {", "\t$0", "}"].join("\n"),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "else statement",
        detail: "else statement",
    },
    {
        label: "else",
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: "else",
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "else keyword",
        detail: "else keyword",
    },
    {
        label: "while_z",
        kind: SNIPPET,
        insertText: ["while_z (${1:condition}) {", "\t$0", "}"].join(
            "\n",
        ),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "while_z statement",
        detail: "while_z statement",
    },
    {
        label: "while_nz",
        kind: SNIPPET,
        insertText: ["while_nz (${1:condition}) {", "\t$0", "}"].join(
            "\n",
        ),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "while_nz statement",
        detail: "while_nz statement",
    },
    {
        label: "loop",
        kind: SNIPPET,
        insertText: ["loop {", "\t$0", "}"].join("\n"),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "loop statement",
        detail: "loop statement",
    },
    {
        label: "macro",
        kind: SNIPPET,
        insertText: ["macro $1!($2) {", "\t$0", "}"].join("\n"),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "macro definition",
        detail: "macro definition",
    },
    {
        label: "repeat",
        kind: SNIPPET,
        insertText: ["repeat(${1:number}, ${0:expression})"].join("\n"),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "repeat expression",
        detail: "repeat expression",
    },
    {
        label: "break",
        kind: SNIPPET,
        insertText: ["break()"].join("\n"),
        insertTextRules: INSERT_AS_SNIPPET,
        documentation: "break expression",
        detail: "break expression",
    },
];

/**
 * @param {{name: string, args: string[]}[]} decls
 * @returns {unknown[]}
 */
function generateSuggestion(decls) {
    return decls.map((decl) => {
        const pretty = `macro ${decl.name}(${decl.args.join(", ")})`;
        const formattedArgs = decl.args.map((x, i) =>
            "${" + (i + 1) + ":" + x + "}"
        ).join(", ");
        const text = `${decl.name}(${formattedArgs})`;
        return {
            label: decl.name,
            kind: FUNC_KIND,
            insertText: text,
            insertTextRules: INSERT_AS_SNIPPET,
            documentation: pretty,
            detail: pretty,
        };
    });
}

export const completionItemProvider = {
    /**
     * @param {any} model
     * @param {any} position
     * @param {any} context
     * @param {any} token
     * @returns
     */
    provideCompletionItems: (model, position, context, token) => {
        /** @type {string} */
        const str = model.getValue();

        /**
         * @type {any[]}
         */
        let suggestions = [];

        suggestions = suggestions.concat(
            generateSuggestion(completionParser(str)),
        );

        suggestions = suggestions.concat(fixedSuggestions());

        for (const name of emptyArgFuncs.keys()) {
            suggestions.push({
                label: name,
                kind: FUNC_KIND,
                insertText: `${name}()`,
                insertTextRules: INSERT_AS_SNIPPET,
                documentation: `${name} expression`,
            });
        }

        for (const name of numArgFuncs.keys()) {
            suggestions.push({
                label: name,
                kind: FUNC_KIND,
                insertText: `${name}($0)`,
                insertTextRules: INSERT_AS_SNIPPET,
                documentation: `${name} expression`,
            });
        }

        for (const name of strArgFuncs.keys()) {
            suggestions.push({
                label: name,
                kind: FUNC_KIND,
                insertText: `${name}("$0")`,
                insertTextRules: INSERT_AS_SNIPPET,
                documentation: `${name} expression`,
            });
        }

        return { suggestions: suggestions };
    },
};
