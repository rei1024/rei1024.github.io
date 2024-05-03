import { bnb } from "../../../deps.ts";
import { APGMSourceLocation, ErrorWithSpan } from "../../ast/mod.ts";

export function createErrorLines(
    source: string,
    start: APGMSourceLocation,
    end?: APGMSourceLocation,
): string[] {
    const lines = source.split(/\r?\n/);
    const above = lines[start.line - 2];
    const errorLine = lines[start.line - 1];

    const below = lines[start.line];
    const arrowLine = " ".repeat(Math.max(0, start.column - 1)) +
        "^".repeat(
            end === undefined ? 1 : Math.max(1, end.column - start.column),
        );

    const aboveLines = above === undefined ? [] : [above];
    const belowLines = below === undefined ? [] : [below];

    const prefix = " | ";

    const errorLineIndexStr = start.line.toString();
    const errorLineIndexStrPadding = " ".repeat(errorLineIndexStr.length);

    const errorLines = [
        ...aboveLines.map((x) => errorLineIndexStrPadding + prefix + x),
        errorLineIndexStr + prefix + errorLine,
        errorLineIndexStrPadding + prefix + arrowLine,
        ...belowLines.map((x) => errorLineIndexStrPadding + prefix + x),
    ];

    return errorLines;
}

// number is not allowed: 3 at line 2 column 5
//   | macro f!() {
// 2 |     3;
//   |     ^
//   | }
export function prettyError(fail: bnb.ParseFail, source: string): string {
    const errorLines = createErrorLines(source, fail.location);
    return [
        `Error: Parse error at line ${fail.location.line} column ${fail.location.column}:`,
        `  expected ${fail.expected.join(", ")}`,
        ``,
        ...errorLines,
    ].join("\n");
}

/**
 * @param parser
 * @param source source string
 * @returns parsed value
 * @throws ErrorWithSpan
 */
export function parsePretty<A>(parser: bnb.Parser<A>, source: string): A {
    const res = parser.parse(source);
    if (res.type === "ParseOK") {
        return res.value;
    }

    throw new ErrorWithSpan(prettyError(res, source), {
        start: res.location,
        end: res.location,
    });
}
