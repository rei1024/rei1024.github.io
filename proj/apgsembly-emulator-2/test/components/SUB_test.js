import { SubAction } from "../../src/actions/SubAction.js";
import { SUB } from "../../src/components/SUB.js"
import { assertEquals } from "../deps.js";

Deno.test('SUB a1', () => {
    const x = new SUB();
    x.a1();
    assertEquals(x.getValue(), 3);
});

Deno.test('SUB b0', () => {
    const x = new SUB();
    x.b0();
    assertEquals(x.getValue(), 0);
});

Deno.test('SUB b1', () => {
    const x = new SUB();
    x.b1();
    assertEquals(x.getValue(), 17);
});

// action
Deno.test('SUB action a1', () => {
    const x = new SUB();
    x.action(SubAction.parse('SUB A1'));
    assertEquals(x.getValue(), 3);
});

Deno.test('SUB action b0', () => {
    const x = new SUB();
    x.action(SubAction.parse('SUB B0'));
    assertEquals(x.getValue(), 0);
});

Deno.test('SUB action b1', () => {
    const x = new SUB();
    x.action(SubAction.parse('SUB B1'));
    assertEquals(x.getValue(), 17);
});
