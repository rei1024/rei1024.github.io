// @ts-check

import { NopAction } from "../../src/actions/NopAction.js";
import { NOP } from "../../src/components/NOP.js";
import { assertEquals, test } from "../deps.js";

test('NOP', () => {
    const x = new NOP();
    assertEquals(x.nop(), 0);
});
