// @ts-check

// https://microsoft.github.io/monaco-editor/api/modules/monaco.languages.html#registerCompletionItemProvider

import { emptyArgFuncs, numArgFuncs, strArgFuncs } from "../integraion.js";

export const completionItemProvider = {
    provideCompletionItems: (model, position, context, token) => {
        /** @type {string} */
        const str = model.getValue();
        const matches = [...str.matchAll(/macro\s+(.*!)\s*\(.*\)/g)];

        /**
         * @type {string[]}
         */
        const funcNames = matches.flatMap((x) => {
            const name = x[1];
            if (typeof name === "string") {
                return [name];
            } else {
                return [];
            }
        });

        /**
         * @type {any[]}
         */
        let suggestions = [];
        for (const funcName of funcNames) {
            // TODO: 引数の数に応じて生成
            suggestions.push({
                label: funcName,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: `${funcName}`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: `${funcName} expression`,
            });
        }

        const fixedSuggestions = [
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
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["if_z (${1:condition}) {", "\t$0", "}"].join("\n"),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "if_z statement",
                detail: "if_z statement",
            },
            {
                label: "if_nz",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["if_nz (${1:condition}) {", "\t$0", "}"].join(
                    "\n",
                ),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "if_nz statement",
                detail: "if_nz statement",
            },
            {
                label: "else",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["else {", "\t$0", "}"].join("\n"),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "else statement",
                detail: "else statement",
            },
            {
                label: "else",
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: "else",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "else keyword",
                detail: "else keyword",
            },
            {
                label: "while_z",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["while_z (${1:condition}) {", "\t$0", "}"].join(
                    "\n",
                ),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "while_z statement",
                detail: "while_z statement",
            },
            {
                label: "while_nz",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["while_nz (${1:condition}) {", "\t$0", "}"].join(
                    "\n",
                ),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "while_nz statement",
                detail: "while_nz statement",
            },
            {
                label: "loop",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["loop {", "\t$0", "}"].join("\n"),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "loop statement",
                detail: "loop statement",
            },
            {
                label: "macro",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["macro $1!($2) {", "\t$0", "}"].join("\n"),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "macro definition",
                detail: "macro definition",
            },
            {
                label: "repeat",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["repeat(${1:number}, ${0:expression})"].join("\n"),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "repeat expression",
                detail: "repeat expression",
            },
            {
                label: "break",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["break()"].join("\n"),
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: "break expression",
                detail: "break expression",
            },
        ];

        suggestions = suggestions.concat(fixedSuggestions);

        for (const name of emptyArgFuncs.keys()) {
            suggestions.push({
                label: name,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: `${name}()`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: `${name} expression`,
            });
        }

        for (const name of numArgFuncs.keys()) {
            suggestions.push({
                label: name,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: `${name}($0)`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: `${name} expression`,
            });
        }

        for (const name of strArgFuncs.keys()) {
            suggestions.push({
                label: name,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: `${name}("$0")`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: `${name} expression`,
            });
        }

        return { suggestions: suggestions };
    },
};
