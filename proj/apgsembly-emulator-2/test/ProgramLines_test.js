// @ts-check

/* eslint-disable camelcase */
import { ProgramLines } from "../src/ProgramLines.js";
import { assertEquals, test } from "./deps.js";
import { program9_1, program9_2 } from "./Program_test.js";
import { piCalculator } from "./pi_calculator.js";

/**
 * @param {string} str
 */
function parsePrettyTest(str) {
    const programLines = ProgramLines.parse(str);
    if (programLines instanceof ProgramLines) {
        assertEquals(programLines.pretty().trim(), str.trim());
    } else {
        throw Error("error");
    }
}

test("ProgramLines parse program9_1", () => {
    parsePrettyTest(program9_1);
});

test("ProgramLines parse program9_2", () => {
    parsePrettyTest(program9_2);
});

test("ProgramLines parse program9_3", () => {
    parsePrettyTest(program9_2);
});

test("ProgramLines parse pi", () => {
    parsePrettyTest(piCalculator);
});
