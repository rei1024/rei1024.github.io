import { SubAction } from "../../src/actions/SubAction.js"
import { assertEquals } from "../deps.js";

Deno.test('parse SUB A1', () => {
    assertEquals(SubAction.parse('SUB A1')?.pretty(), 'SUB A1');
});

Deno.test('parse SUB B0', () => {
    assertEquals(SubAction.parse('SUB B0')?.pretty(), 'SUB B0');
});

Deno.test('parse SUB B1', () => {
    assertEquals(SubAction.parse('SUB B1')?.pretty(), 'SUB B1');
});

Deno.test('parse fail', () => {
    assertEquals(SubAction.parse('SUB'), undefined);
});
