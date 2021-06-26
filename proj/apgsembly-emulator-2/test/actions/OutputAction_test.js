import { OutputAction } from "../../src/actions/OutputAction.js"
import { assertEquals } from "../deps.js";

Deno.test('OutputAction parse OUTPUT 0', () => {
    assertEquals(OutputAction.parse('OUTPUT 0')?.pretty(), 'OUTPUT 0');
});

Deno.test('OutputAction parse OUTPUT A', () => {
    assertEquals(OutputAction.parse('OUTPUT A')?.pretty(), 'OUTPUT A');
});
