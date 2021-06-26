import { AddAction } from "../../src/actions/AddAction.js";
import { ADD } from "../../src/components/ADD.js"
import { assertEquals } from "../deps.js";

Deno.test('ADD a1', () => {
    const x = new ADD();
    assertEquals(x.a1(), undefined);
    assertEquals(x.getValue(), 5);
});

Deno.test('ADD a1 toString', () => {
    const x = new ADD();
    assertEquals(x.a1(), undefined);
    assertEquals(x.toString(), "0101");
});

Deno.test('ADD a1 toStringDetail', () => {
    const x = new ADD();
    assertEquals(x.a1(), undefined);
    assertEquals(x.toStringDetail(), "010 bit1");
});

Deno.test('ADD a1 twice', () => {
    const x = new ADD();
    x.a1();
    x.a1();
    assertEquals(x.getValue(), 0);
});

Deno.test('ADD b0', () => {
    const x = new ADD();
    assertEquals(x.b0(), 0);
    assertEquals(x.getValue(), 0);
});

Deno.test('ADD b1', () => {
    const x = new ADD();
    assertEquals(x.b1(), 1);
    assertEquals(x.getValue(), 0);
});

Deno.test('ADD complex', () => {
    const x = new ADD();
    x.a1();
    assertEquals(x.getValue(), 5);
    x.b1();
    x.a1();
    assertEquals(x.getValue(), 12);
});

// action
Deno.test('ADD action', () => {
    const x = new ADD();
    const act = AddAction.parse('ADD A1');
    assertEquals(act.pretty(), "ADD A1");
    assertEquals(act.regName, "A1");
    assertEquals(x.getValue(), 0);

    x.action(act);

    assertEquals(x.getValue(), 5);
    x.action(AddAction.parse('ADD B1'));
    x.action(AddAction.parse('ADD A1'));

    assertEquals(x.getValue(), 12);
});
