import { NopAction } from "../../src/actions/NopAction.js";
import { assertEquals, test } from "../deps.js";

test('parse NOP', () => {
    assertEquals(NopAction.parse('NOP')?.pretty(), 'NOP');
});

test('parse NOP space', () => {
    assertEquals(NopAction.parse('  NOP  ')?.pretty(), 'NOP');
});

test('parse NOP fail', () => {
    assertEquals(NopAction.parse(''), undefined);
});

test('NOP isSameComponent', () => {
    assertEquals(
        NopAction.parse('NOP').isSameComponent(NopAction.parse('NOP')),
        true
    );
});
