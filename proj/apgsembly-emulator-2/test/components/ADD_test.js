import { AddAction, ADD_A1 } from "../../src/actions/AddAction.js";
import { ADD, addLookupA1, addLookupB0, addLookupB1 } from "../../src/components/ADD.js";
import { assertEquals, test } from "../deps.js";

test('ADD table', () => {
    assertEquals(addLookupA1, [5, 4, 7, 6, 1, 0, 3, 2, 13, 12, 15, 14, 9, 8, 11, 10]);
    assertEquals(addLookupB0, [0, 0, 0, 0, 0, 0, 9, 9, 0, 0, 9, 9, 9, 9, 9, 9]);
    assertEquals(addLookupB1, [0, 0, 0, 0, 9, 9, 0, 0, 9, 9, 0, 0, 9, 9, 9, 9]);
});

test('ADD a1', () => {
    const x = new ADD();
    assertEquals(x.a1(), undefined);
    assertEquals(x.getValue(), 5);
});

test('ADD a1 toString', () => {
    const x = new ADD();
    assertEquals(x.a1(), undefined);
    assertEquals(x.toString(), "0101");
});

test('ADD a1 toStringDetail', () => {
    const x = new ADD();
    assertEquals(x.a1(), undefined);
    assertEquals(x.toStringDetail(), "010 bit1");
});

test('ADD a1 twice', () => {
    const x = new ADD();
    x.a1();
    x.a1();
    assertEquals(x.getValue(), 0);
});

test('ADD b0', () => {
    const x = new ADD();
    assertEquals(x.b0(), 0);
    assertEquals(x.getValue(), 0);
});

test('ADD b1', () => {
    const x = new ADD();
    assertEquals(x.b1(), 1);
    assertEquals(x.getValue(), 0);
});

test('ADD complex', () => {
    const x = new ADD();
    x.a1();
    assertEquals(x.getValue(), 5);
    x.b1();
    x.a1();
    assertEquals(x.getValue(), 12);
});

// action
test('ADD action', () => {
    const x = new ADD();
    const act = AddAction.parse('ADD A1');
    if (act === undefined) {
        throw Error('Parse Error AddAction');
    }
    assertEquals(act.pretty(), "ADD A1");
    assertEquals(act.op, ADD_A1);
    assertEquals(x.getValue(), 0);

    x.action(act);

    assertEquals(x.getValue(), 5);
    x.action(AddAction.parse('ADD B1'));
    x.action(AddAction.parse('ADD A1'));

    assertEquals(x.getValue(), 12);
});
