import { OutputAction } from "../../src/actions/OutputAction.js";
import { assertEquals, test } from "../deps.js";

test('OutputAction parse OUTPUT 0', () => {
    assertEquals(OutputAction.parse('OUTPUT 0')?.pretty(), 'OUTPUT 0');
});

test('OutputAction parse OUTPUT A', () => {
    assertEquals(OutputAction.parse('OUTPUT A')?.pretty(), 'OUTPUT A');
});

test('OutputAction isSameComponent', () => {
    assertEquals(OutputAction.parse('OUTPUT A')?.isSameComponent(OutputAction.parse('OUTPUT A')), true);
});
