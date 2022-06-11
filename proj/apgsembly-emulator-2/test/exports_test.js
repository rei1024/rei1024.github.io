// @ts-check

import {
    // used by APGM
    Action,
    NopAction,
    HaltOutAction,
    parseAction,
    runAPGsembly,
} from "../src/exports.js";
import { assertEquals, test } from "./deps.js";

test('run', () => {
    assertEquals(runAPGsembly(`
        INITIAL; ZZ; A0; INC U0, NOP
        A0; *; A0; HALT_OUT
    `).actionExecutor.getUReg(0).getValue(), 1);
});
