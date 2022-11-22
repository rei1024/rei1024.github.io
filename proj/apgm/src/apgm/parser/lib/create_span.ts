import { bnb } from "../../../deps.ts";
import { APGMSourceSpan } from "../../ast/core.ts";

export function createSpan(
    start: bnb.SourceLocation,
    word: string,
): APGMSourceSpan {
    return {
        start: start,
        end: {
            index: start.index + word.length - 1,
            line: start.line,
            column: start.column + word.length,
        },
    };
}
