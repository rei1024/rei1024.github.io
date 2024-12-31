// https://microsoft.github.io/monaco-editor/docs.html#interfaces/languages.Hover.html

import { parseMain } from "../integration.js";

/**
 * @typedef {{ contents: { value: string }[]; range?: any }} Hover
 */

let prevStr;
let cache;

/**
 * @param {string} str
 */
function cachedParse(str) {
    if (str === prevStr) {
        return cache;
    } else {
        cache = parseMain(str);
        prevStr = str;
        return cache;
    }
}

export const hoverProvider = {
    /**
     * @param {{ getValue(): string }} model
     * @param {{ lineNumber: number; column: number }} position
     * @param {*} token
     * @returns {Hover | undefined}
     */
    provideHover(model, position, token) {
        const str = model.getValue();
        const main = cachedParse(str);

        let result = undefined;
        function update(x) {
            const span = x.getSpan();
            if (span == null) {
                return x;
            }
            if (
                position.lineNumber === span.start.line &&
                position.lineNumber === span.end.line &&
                span.start.column <= position.column &&
                position.column <= span.end.column
            ) {
                result = main.describeFunc(x) ?? undefined;
            }
            return x;
        }
        main.seqExpr.transform((x) => {
            update(x);
            return x;
        });

        main.macros.forEach((m) => {
            m.body.transform((x) => {
                update(x);
                return x;
            });
        });

        if (result !== undefined) {
            return {
                contents: [{ value: result }],
            };
        }
        return undefined;
    },
};
