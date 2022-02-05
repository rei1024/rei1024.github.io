import { bnb } from "../../deps.ts";

// parse error at line 8 column 9: expected comment, ,, )

export function prettyError(fail: bnb.ParseFail, source: string): string {
    const lines = source.split(/\n|\r\n/);
    const above = lines[fail.location.line - 2];
    const errorLine = lines[fail.location.line - 1];
    const below = lines[fail.location.line];
    const arrowLine = " ".repeat(Math.max(0, fail.location.column - 1)) + "^";

    const errorLines = [
        ...(above === undefined ? [] : [above]),
        errorLine,
        arrowLine,
        ...(below === undefined ? [] : [below]),
    ].map((x) => "| " + x);

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
 * @throws Error
 */
export function parsePretty<A>(parser: bnb.Parser<A>, source: string): A {
    const res = parser.parse(source);
    if (res.type === "ParseOK") {
        return res.value;
    }

    throw Error(prettyError(res, source));
}
