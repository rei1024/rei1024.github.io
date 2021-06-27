import { Program } from '../src/Program.js';
import { assertEquals } from "./deps.js";

export const program9_1 = `
INITIAL; ZZ; ID1; TDEC U0
ID1; Z; ID2; OUTPUT 0, HALT_OUT
ID1; NZ; ID2; TDEC U1
ID2; Z; ID1; OUTPUT 1, HALT_OUT
ID2; NZ; ID1; TDEC U0
`;

export const program9_2 = `
#COMPONENTS U0-1,HALT_OUT
#REGISTERS {"U0":7, "U1":5}
# State Input Next state Actions
# ---------------------------------------
INITIAL; ZZ; ID1; TDEC U0
ID1; Z; ID1; HALT_OUT
ID1; NZ; ID1; TDEC U0, INC U1
`;

export const program9_3 = `
#COMPONENTS U0-3,HALT_OUT
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
ID3; NZ; ID3; TDEC U3, INC U1, INC U2
`

export const program9_4 = `
#COMPONENTS B0,NOP,HALT_OUT
#REGISTERS {}
# State Input Next state Actions
# ---------------------------------------
INITIAL; ZZ; ID1; SET B0, NOP
ID1; ZZ; ID2; INC B0, NOP
ID2; ZZ; ID3; SET B0, NOP
ID3; ZZ; ID4; INC B0, NOP
ID4; ZZ; ID5; INC B0, NOP
ID5; ZZ; ID6; SET B0, NOP
ID6; ZZ; ID7; INC B0, NOP
ID7; ZZ; ID8; INC B0, NOP
ID8; ZZ; ID9; INC B0, NOP
ID9; ZZ; ID10; INC B0, NOP
ID10; ZZ; LSB1; SET B0, NOP
# Move B0’s read head back to its least significant bit.
LSB1; ZZ; LSB2; TDEC B0
LSB2; Z; LSB2; HALT_OUT
LSB2; NZ; LSB2; TDEC B0
`

Deno.test('Program pretty program9_1', () => {
    const program = Program.parse(program9_1);
    if (program instanceof Program) {
        assertEquals(program.pretty().trim(), program9_1.trim());
    } else {
        throw Error('parse error');
    }
});

Deno.test('Program pretty inverse', () => {
    const str = `
#COMPONENTS U0-1,HALT_OUT
#REGISTERS {"U0":7, "U1":5}
INITIAL; ZZ; ID1; TDEC U0
    `;
    const program = Program.parse(str);
    if (program instanceof Program) {
        assertEquals(program.pretty().trim(), str.trim());
    } else {
        throw Error('parse error');
    }
});

Deno.test('Program parse 9.1', () => {
    // p252 APGsembly 9.1
    const str = program9_1
    const program = Program.parse(str);

    if (program instanceof Program) {
        assertEquals(program.commands.length, 5);
        assertEquals(program.registersHeader, undefined);
        assertEquals(program.componentsHeader, undefined);
    } else {
        throw Error('parse error');
    }
});

Deno.test('Program parse 9.2', () => {
    // p252 APGsembly 9.2
    const str = program9_2
    const program = Program.parse(str);

    if (program instanceof Program) {
        assertEquals(program.commands.length, 3);
        assertEquals(program.registersHeader?.content, '{"U0":7, "U1":5}');
        assertEquals(program.componentsHeader?.content, 'U0-1,HALT_OUT');
    } else {
        throw Error('parse error');
    }
});
