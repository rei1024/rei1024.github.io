import { OutputAction } from "../../src/actions/OutputAction.js";
import { OUTPUT } from "../../src/components/OUTPUT.js"
import { assertEquals } from "../deps.js";

Deno.test('OUTPUT initial', () => {
    const x = new OUTPUT();
    assertEquals(x.getString(), "");
});

Deno.test('OUTPUT output', () => {
    const x = new OUTPUT();
    x.output('3');
    assertEquals(x.getString(), "3");
});

Deno.test('OUTPUT output twice', () => {
    const x = new OUTPUT();
    x.output('3');
    x.output('4')
    assertEquals(x.getString(), "34");
});

// action
Deno.test('OUTPUT action', () => {
    const x = new OUTPUT();
    x.action(OutputAction.parse('OUTPUT 3'));
    x.action(OutputAction.parse('OUTPUT 4'));
    assertEquals(x.getString(), "34");
});
