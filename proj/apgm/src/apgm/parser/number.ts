import { bnb } from "../../deps.ts";

export const decimalNaturalParser = bnb.match(/[0-9]+/).desc(["number"]).map(
    (x) => parseInt(x, 10),
);

export const hexadecimalNaturalParser = bnb.match(/0x[0-9]+/).desc([
    "hexadecimal number",
]).map((x) => parseInt(x, 16));

export const naturalNumberParser: bnb.Parser<number> = hexadecimalNaturalParser
    .or(decimalNaturalParser).desc(["number"]);
