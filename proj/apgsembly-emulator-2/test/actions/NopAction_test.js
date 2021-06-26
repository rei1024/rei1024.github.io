import { NopAction } from "../../src/actions/NopAction.js"
import { assertEquals } from "../deps.js";

Deno.test('parse NOP', () => {
    assertEquals(NopAction.parse('NOP')?.pretty(), 'NOP');
});

Deno.test('parse NOP space', () => {
    assertEquals(NopAction.parse('  NOP  ')?.pretty(), 'NOP');
});


Deno.test('parse NOP fail', () => {
    assertEquals(NopAction.parse(''), undefined);
});
