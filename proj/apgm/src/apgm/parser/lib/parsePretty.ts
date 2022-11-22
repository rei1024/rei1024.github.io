import { bnb } from "../../../deps.ts";
import { APGMSourceLocation, ErrorWithSpan } from "../../ast/mod.ts";

// parse error at line 8 column 9: expected comment, ,, )

export function createErrorLines(
    location: APGMSourceLocation,
    source: string,
): string[] {
    const lines = source.split(/\n|\r\n/);
    const above = lines[location.line - 2];
    const errorLine = lines[location.line - 1];
    const below = lines[location.line];
    const arrowLine = " ".repeat(Math.max(0, location.column - 1)) + "^";

    const aboveLines = [
        ...(above === undefined ? [] : [above]),
        errorLine,
    ];

    const belowLines = [
        ...(below === undefined ? [] : [below]),
    ];

    const prefix = "| ";

    const errorLines = [
        ...aboveLines.map((x) => prefix + x),
        " ".repeat(prefix.length) + arrowLine,
        ...belowLines.map((x) => prefix + x),
    ];

    return errorLines;
}

export function prettyError(fail: bnb.ParseFail, source: string): string {
    const errorLines = createErrorLines(fail.location, source);
    return [
        `parse error at line ${fail.location.line} column ${fail.location.column}:`,
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
