import { AddAction } from "../../src/actions/AddAction.js";
import { assertEquals, test } from "../deps.js";

test('ADD parse ADD B0', () => {
    assertEquals(AddAction.parse('ADD B0')?.pretty(), "ADD B0");
    assertEquals(AddAction.parse('ADD    B0')?.pretty(), "ADD B0");
});

test('ADD parse ADD A1', () => {
    assertEquals(AddAction.parse('ADD A1')?.pretty(), "ADD A1");
});

test('ADD parse ADD B1', () => {
    assertEquals(AddAction.parse('ADD B1')?.pretty(), "ADD B1");
});

test('ADD parse fail', () => {
    assertEquals(AddAction.parse(''), undefined);
    assertEquals(AddAction.parse('ADD'), undefined);
});
