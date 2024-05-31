// @ts-check

export const monarchTokensProvider = {
    keywords: [
        "if_z",
        "if_nz",
        "else",
        "while_z",
        "while_nz",
        "loop",
        "macro",
        "#REGISTERS",
        "#COMPONENTS",
        // "break",
        // "repeat"
    ],
    // symbols: /[\#\!\%\&\*\+\-\.\/\:\;\<\=\>\@\^\|_\?]+/,
    tokenizer: {
        root: [
            // header
            [
                /#?[a-zA-Z][a-zA-Z0-9_]*!?|_[a-zA-Z0-9_]+/,
                {
                    cases: {
                        // '@typeKeywords': 'keyword.type',
                        "@keywords": "keyword",
                        // '@supportConstants': 'keyword',
                        // '@supportMacros': 'keyword',
                        // '@constants': 'keyword',
                        "@default": "identifier",
                    },
                },
            ],
            // Designator
            // [/\$/, 'identifier'],
            // Lifetime annotations
            // [/'[a-zA-Z_][a-zA-Z0-9_]*(?=[^\'])/, 'identifier'],
            // Strings
            [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
            { include: "@numbers" },
            // Whitespace + comments
            { include: "@whitespace" },
            // [
            // 	/@delimiters/,
            // 	{
            // 		cases: {
            // 			'@keywords': 'keyword',
            // 			'@default': 'delimiter'
            // 		}
            // 	}
            // ],

            // [/[{}()\[\]<>]/, "@brackets"],
            [/[{}()]/, "@brackets"],
            // [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, "white"],
            [/\/\*/, "comment", "@comment"],
            // [/\/\/.*$/, 'comment']
        ],

        comment: [
            [/[^\/*]+/, "comment"],
            [/\/\*/, "comment", "@push"],
            ["\\*/", "comment", "@pop"],
            [/[\/*]/, "comment"],
        ],

        string: [
            [/[^\\"]+/, "string"],
            // [/@escapes/, 'string.escape'],
            // [/\\./, 'string.escape.invalid'],
            [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
        ],

        numbers: [
            //Octal
            // [/(0o[0-7_]+)(@intSuffixes)?/, { token: 'number' }],
            //Binary
            // [/(0b[0-1_]+)(@intSuffixes)?/, { token: 'number' }],
            //Exponent
            // [/[\d][\d_]*(\.[\d][\d_]*)?[eE][+-][\d_]+(@floatSuffixes)?/, { token: 'number' }],
            //Float
            // [/\b(\d\.?[\d_]*)(@floatSuffixes)?\b/, { token: 'number' }],
            //Hexadecimal
            [/(0x[\da-fA-F]+)/, { token: "number" }],
            //Integer
            [/[\d][\d]*/, { token: "number" }],
        ],
    },
};
