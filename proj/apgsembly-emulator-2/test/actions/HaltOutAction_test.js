import { HaltOutAction } from "../../src/actions/HaltOutAction.js"
import { assertEquals } from "../deps.js";

Deno.test('parse HALT_OUT', () => {
    assertEquals(HaltOutAction.parse('HALT_OUT')?.pretty(), 'HALT_OUT');
});

Deno.test('parse HALT_OUT fail', () => {
    assertEquals(HaltOutAction.parse('HALT'), undefined);
});
