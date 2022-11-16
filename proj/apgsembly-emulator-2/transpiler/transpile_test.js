import { transpile } from "./transpile.js";
import { test, assertEquals } from "../test/deps.js";

test('transpile', () => {
    const strOrError = transpile(`#COMPONENTS U0-3,HALT_OUT
    #REGISTERS {"U0":7, "U1":5}
    # State Input Next state Actions
    # ---------------------------------------
    INITIAL; ZZ; ID1; TDEC U0

    # Loop over U0, TDECing it until it hits 0, and then halt.
    ID1; Z; ID1; HALT_OUT
    ID1; NZ; ID2; TDEC U1

    # Copy U1 into U3 while setting U1 = 0.
    ID2; Z; ID3; TDEC U3
    ID2; NZ; ID2; TDEC U1, INC U3

    # Loop over U3, adding its value to U1 (restoring it) and U2.
    ID3; Z; ID1; TDEC U0
    ID3; NZ; ID3; TDEC U3, INC U1, INC U2`);
    assertEquals(strOrError instanceof Error, false);
});


// test('transpile 2', () => {
//     const strOrError = transpile(
//         `INITIAL; ZZ; ID1; TDEC U0
//     ID1; *; ID2; INC T0
//     ID2; *; ID2; HALT_OUT`);
//     assertEquals(strOrError, `INITIAL; ZZ; ID1; TDEC U0
// ID1; *; ID2; INC B0, NOP
// ID2; *; ID2; HALT_OUT`);
// });

// test('transpile 3', () => {
//     const strOrError = transpile(
//         `INITIAL; ZZ; ID1; TDEC U0
//     ID1; *; ID2; SET T1, DEC T1
//     ID2; *; ID2; HALT_OUT`);
//     assertEquals(strOrError,
// `INITIAL; ZZ; ID1; TDEC U0
// ID1; *; ID1__0; SET B1, NOP
// ID1__0; *; ID2; TDEC B1
// ID2; *; ID2; HALT_OUT`);
// });

// test('transpile 4', () => {
//     const strOrError = transpile(
//         `INITIAL; ZZ; ID1; TDEC U0
//     ID1; *; ID2; SET T1, DEC T1, SET T0
//     ID2; *; ID2; HALT_OUT`);
//     assertEquals(strOrError,
// `INITIAL; ZZ; ID1; TDEC U0
// ID1; *; ID1__0; SET B1, NOP
// ID1__0; *; ID1__1; TDEC B1
// ID1__1; *; ID2; SET B0, NOP
// ID2; *; ID2; HALT_OUT`);
// });

// test('transpile 5', () => {
//     const strOrError = transpile(
//         `INITIAL; ZZ; ID1; TDEC U0
//     ID1; Z; ID2; SET T1, DEC T1, SET T0
//     ID1; NZ; ID2; SET T1, DEC T1, SET T0
//     ID2; *; ID2; HALT_OUT`);
//     assertEquals(strOrError,
// `INITIAL; ZZ; ID1; TDEC U0
// ID1; NZ; ID1__0; SET B1, NOP
// ID1__0; *; ID1__1; TDEC B1
// ID1__1; *; ID2; SET B0, NOP
// ID2; *; ID2; HALT_OUT`);
// });
