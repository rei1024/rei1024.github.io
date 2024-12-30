// @ts-check

import {
    // used by APGM
    Action,
    formatAPGsembly,
    generateComponentsHeaderForSource,
    HaltOutAction,
    NopAction,
    parseAction,
    runAPGsembly,
} from "../src/exports.js";
import { assertEquals, test } from "./deps.js";

test("run", () => {
    assertEquals(
        runAPGsembly(`
        INITIAL; ZZ; A0; INC U0, NOP
        A0; *; A0; HALT_OUT
    `).actionExecutor.getUReg(0)?.getValue(),
        1,
    );
});

test("formatAPGsembly", () => {
    assertEquals(
        formatAPGsembly(`
INITIAL; ZZ; A0; INC U0, NOP
A0; *; A0; HALT_OUT`),
        `
INITIAL; ZZ; A0; INC U0, NOP
A0;      *;  A0; HALT_OUT`,
    );
});

test("generateComponentsHeaderForSource U", () => {
    assertEquals(
        generateComponentsHeaderForSource(`
INITIAL; ZZ; A0; INC U0, NOP
A0; *; A0; HALT_OUT`),
        "U0",
    );
});

test("generateComponentsHeaderForSource U OUTPUT", () => {
    assertEquals(
        generateComponentsHeaderForSource(`
INITIAL; ZZ; A0; INC U0, OUTPUT 0, NOP
A0; *; A0; HALT_OUT`),
        "U0, OUTPUT",
    );
});

test("generateComponentsHeaderForSource U multiple", () => {
    assertEquals(
        generateComponentsHeaderForSource(`
INITIAL; ZZ; A0; INC U0, INC U1, OUTPUT 0, NOP
A0; *; A0; HALT_OUT`),
        "U0-1, OUTPUT",
    );
});

test("generateComponentsHeaderForSource U multiple 2", () => {
    assertEquals(
        generateComponentsHeaderForSource(`
INITIAL; ZZ; A0; INC U0, INC U1, INC U3, INC U4, INC U5, INC U7, OUTPUT 0, NOP
A0; *; A0; HALT_OUT`),
        "U0-1, U3-5, U7, OUTPUT",
    );
});

test("generateComponentsHeaderForSource B", () => {
    assertEquals(
        generateComponentsHeaderForSource(`
INITIAL; ZZ; A0; INC B1, OUTPUT 0, NOP
A0; *; A0; HALT_OUT`),
        "B1, OUTPUT",
    );
});
