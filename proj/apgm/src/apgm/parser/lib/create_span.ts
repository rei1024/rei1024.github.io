import { bnb } from "../../../deps.ts";
import { APGMSourceSpan } from "../../ast/core.ts";

export function createSpan(
    start: bnb.SourceLocation,
    word: string,
): APGMSourceSpan {
    const len = word.length;
    return {
        start: start,
        end: {
            index: start.index + len - 1,
            line: start.line,
            column: start.column + len,
        },
    };
}
