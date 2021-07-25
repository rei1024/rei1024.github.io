import { MulAction } from "../../src/actions/MulAction.js";
import { assertEquals, test } from "../deps.js";

test('parse MUL 0', () => {
    assertEquals(MulAction.parse('MUL 0')?.pretty(), 'MUL 0');
});

test('parse MUL 1', () => {
    assertEquals(MulAction.parse('MUL 1')?.pretty(), 'MUL 1');
});
