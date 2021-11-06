// @ts-check

import { OutputAction } from "../../src/actions/OutputAction.js";
import { OUTPUT } from "../../src/components/OUTPUT.js";
import { assertEquals, test } from "../deps.js";

test('OUTPUT initial', () => {
    const x = new OUTPUT();
    assertEquals(x.getString(), "");
});

test('OUTPUT output', () => {
    const x = new OUTPUT();
    x.output('3');
    assertEquals(x.getString(), "3");
});

test('OUTPUT output twice', () => {
    const x = new OUTPUT();
    x.output('3');
    x.output('4');
    assertEquals(x.getString(), "34");
});

// action
test('OUTPUT action', () => {
    const x = new OUTPUT();
    x.action(OutputAction.parse('OUTPUT 3'));
    x.action(OutputAction.parse('OUTPUT 4'));
    assertEquals(x.getString(), "34");
});
