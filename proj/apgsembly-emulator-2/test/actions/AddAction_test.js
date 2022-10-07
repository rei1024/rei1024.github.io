// @ts-check

import { AddAction } from "../../src/actions/AddAction.js";
import { assertEquals, test, never } from "../deps.js";

/**
 *
 * @param {string} str
 * @param {string | undefined} str2
 */
function parsePretty(str, str2) {
    assertEquals(AddAction.parse(str)?.pretty(), str2);
}

test('ADD parse ADD B0', () => {
    parsePretty('ADD B0', "ADD B0");
    parsePretty('ADD    B0', "ADD B0");
});

test('ADD parse ADD A1', () => {
    parsePretty('ADD A1', "ADD A1");
});

test('ADD parse ADD B1', () => {
    parsePretty('ADD B1', "ADD B1");
});

test('ADD parse fail', () => {
    parsePretty('', undefined);
    parsePretty('ADD', undefined);
    parsePretty('ADDB0', undefined);
});

test('ADD isSameComponent', () => {
    assertEquals(
        AddAction.parse('ADD A1')?.isSameComponent(AddAction.parse('ADD B0') ?? never()),
        true
    );
});
