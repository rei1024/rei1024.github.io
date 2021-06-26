import { OutputAction } from "../../src/actions/OutputAction.js"
import { assertEquals } from "../deps.js";

Deno.test('parse OUTPUT 0', () => {
    assertEquals(OutputAction.parse('OUTPUT 0')?.pretty(), 'OUTPUT 0');
});
