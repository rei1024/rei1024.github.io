// @ts-check

// https://microsoft.github.io/monaco-editor/docs.html#functions/languages.setLanguageConfiguration.html

export const languageConfiguration = {
    folding: {
        markers: {
            start: new RegExp("{"),
            end: new RegExp("}"),
        },
    },
    comments: {
        // lineComment: '//',
        blockComment: ["/*", "*/"],
    },
    brackets: [
        ["{", "}"],
        // ['[', ']'],
        ["(", ")"],
    ],
    autoClosingPairs: [
        // { open: '[', close: ']' },
        { open: "{", close: "}" },
        { open: "(", close: ")" },
        { open: '"', close: '"', notIn: ["string"] },
    ],
    surroundingPairs: [
        { open: "{", close: "}" },
        // { open: '[', close: ']' },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        // { open: "'", close: "'" }
    ],
    // completionの区切りに使用される
    wordPattern: /[^#\s\(\){};]+/g, // "/(-?\d.\d\w)|([^`~!@#%^&*()-=+[{]}\|;:'",.<>/?\s]+)/g"
};
