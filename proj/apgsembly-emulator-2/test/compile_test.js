// @ts-check

/* eslint-disable camelcase */
import { commandsToLookupTable } from "../src/compile.js";
import { Program } from "../src/Program.js";
import { assertEquals, test } from "./deps.js";
import { program9_2, program9_3 } from "./Program_test.js";

test('Compile empty', () => {
    const obj = commandsToLookupTable([]);
    assertEquals(obj, { lookup: [], stateMap: new Map(), states: [] });
});

test('Compile program9_2', () => {
    const program = Program.parse(program9_2);

    if (!(program instanceof Program)) {
        throw TypeError('parse error program');
    }

    const obj = commandsToLookupTable(program.commands);
    assertEquals(obj.states, ["INITIAL", "ID1"]);
    assertEquals(obj.lookup.length, 2);

    assertEquals(obj.lookup[0].nz, undefined);
    assertEquals(obj.lookup[0]?.z?.nextState, 1);

    assertEquals(obj.stateMap.size, 2);
    assertEquals(obj.stateMap.get("INITIAL"), 0);
    assertEquals(obj.stateMap.get("ID1"), 1);
});

test('Compile program9_3', () => {
    const program = Program.parse(program9_3);

    if (!(program instanceof Program)) {
        throw TypeError('parse error program');
    }

    const obj = commandsToLookupTable(program.commands);
    assertEquals(obj.states, ["INITIAL", "ID1", "ID2", "ID3"]);
});
