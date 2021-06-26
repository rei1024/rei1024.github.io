import { MulAction } from "../../src/actions/MulAction.js"
import { assertEquals } from "../deps.js";

Deno.test('parse MUL 0', () => {
    assertEquals(MulAction.parse('MUL 0')?.pretty(), 'MUL 0');
});

Deno.test('parse MUL 1', () => {
    assertEquals(MulAction.parse('MUL 1')?.pretty(), 'MUL 1');
});
