import { commandsToLookupTable } from "../src/compile.js";
import { Program } from "../src/Program.js";
import { assertEquals } from "./deps.js";
import { program9_2 } from "./Program_test.js";

Deno.test('Compile empty', () => {
    commandsToLookupTable([]);
});

Deno.test('Compile empty', () => {
    const program = Program.parse(program9_2);
   
    if (!(program instanceof Program)) {
        throw TypeError('parse error program');
    }

    const obj = commandsToLookupTable(program.commands);
    assertEquals(obj.states, ["INITIAL", "ID1"]);
    assertEquals(obj.lookup.length, 2);

    assertEquals(obj.lookup[0].nz, undefined);


    assertEquals(obj.lookup[0].z.nextState, 1);

    assertEquals(obj.stateMap.size, 2);
    assertEquals(obj.stateMap.get("INITIAL"), 0);
    assertEquals(obj.stateMap.get("ID1"), 1);
});
