// @ts-check

import { Program } from "../src/Program.js";
import { assertEquals, test } from "./deps.js";

test("Program expand", () => {
    const program = Program.parse(`
## sqrt(2) calculator
## Prints 1.41421...

#DEFINE Bxx += Byy { zero = N }

# Add Byy to Bxx

label0; *; label1zero; READ Byy
label1N; Z; label2; READ Bxx
label1N; NZ; label2; SET Byy, ADD A1, READ Bxx
# ...

#ENDDEF

#COMPONENTS B0-5, U0-5, U7-9, ADD, SUB, MUL, OUTPUT
#REGISTERS { 'B0': 7, 'B1': 3, 'B2': 5, 'B3': 2 }
#REGISTERS { 'U0': 2, 'U1': 1, 'U2': 2, 'U3': 1, 'U8': 2, 'U9': 1 }

INITIAL; ZZ; LOOP0; NOP

## Alternate between update types
LOOP0; ZZ; LOOP1; TDEC U7
LOOP1; Z; A_2AB0; INC U7, NOP
LOOP1; NZ; A_2BA0; NOP

## B1 += 2 * B0
A_2AB0; ZZ; ADD_AB0; INC B1, TDEC U1
#INSERT Bxx += Byy { xx = 1; yy = 0; label = ADD_AB; next_state = A_2CD0 }
`);

    if (program instanceof Program) {
        assertEquals(program.commands.map((x) => x.pretty()), [
            "INITIAL; ZZ; LOOP0; NOP",
            "LOOP0; ZZ; LOOP1; TDEC U7",
            "LOOP1; Z;  A_2AB0; INC U7, NOP",
            "LOOP1; NZ; A_2BA0; NOP",
            "A_2AB0; ZZ; ADD_AB0; INC B1, TDEC U1",
            "ADD_AB0; *;  ADD_AB1N; READ B0",
            "ADD_AB1N; Z;  ADD_AB2; READ B1",
            "ADD_AB1N; NZ; ADD_AB2; SET B0, ADD A1, READ B1",
        ]);
    } else {
        throw Error("parse error" + program);
    }
});
