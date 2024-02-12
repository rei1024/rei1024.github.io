// @ts-check

/* eslint-disable camelcase */
import { format, ProgramLines } from "../src/ProgramLines.js";
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

test("ProgramLines format", () => {
    const programLines = ProgramLines.parse(program9_1);
    if (!(programLines instanceof ProgramLines)) {
        throw Error("error");
    }
    assertEquals(
        format(programLines),
        `
INITIAL; ZZ; ID1; TDEC U0
ID1;     Z;  ID2; OUTPUT 0, HALT_OUT
ID1;     NZ; ID2; TDEC U1
ID2;     Z;  ID1; OUTPUT 1, HALT_OUT
ID2;     NZ; ID1; TDEC U0
`,
    );
});
