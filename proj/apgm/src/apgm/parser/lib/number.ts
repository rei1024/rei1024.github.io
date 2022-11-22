import { bnb } from "../../../deps.ts";

interface NumberResult {
    raw: string;
    value: number;
}

export const decimalNaturalParser: bnb.Parser<NumberResult> = bnb.match(
    /[0-9]+/,
).desc(["number"]).map(
    (x) => {
        return {
            raw: x,
            value: parseInt(x, 10),
        };
    },
);

export const hexadecimalNaturalParser: bnb.Parser<NumberResult> = bnb.match(
    /0x[a-fA-F0-9]+/,
).desc([
    "hexadecimal number",
]).map((x) => {
    return {
        raw: x,
        value: parseInt(x, 16),
    };
});

export const naturalNumberParser: bnb.Parser<NumberResult> =
    hexadecimalNaturalParser
        .or(decimalNaturalParser).desc(["number"]);
