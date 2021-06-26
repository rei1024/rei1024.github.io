import { NopAction } from "../../src/actions/NopAction.js";
import { NOP } from "../../src/components/NOP.js"
import { assertEquals } from "../deps.js";

Deno.test('NOP', () => {
    const x = new NOP();
    assertEquals(x.nop(), 0);
});
