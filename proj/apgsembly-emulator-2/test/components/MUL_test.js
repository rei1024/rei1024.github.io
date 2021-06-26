import { MulAction } from "../../src/actions/MulAction.js";
import { MUL } from "../../src/components/MUL.js"
import { assertEquals } from "../deps.js";

Deno.test('MUL 0', () => {
    const x = new MUL();
    x.mul0();
    assertEquals(x.getValue(), 0);
});

Deno.test('MUL 1', () => {
    const x = new MUL();
    x.mul1();
    assertEquals(x.getValue(), 5);
});

// action

Deno.test('MUL action 0', () => {
    const x = new MUL();
    x.action(MulAction.parse('MUL 0'));
    assertEquals(x.getValue(), 0);
});

Deno.test('MUL action 1', () => {
    const x = new MUL();
    x.action(MulAction.parse('MUL 1'));
    assertEquals(x.getValue(), 5);
});
