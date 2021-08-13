/* eslint-disable camelcase */
import { Program } from '../src/Program.js';
import { assertEquals, test } from "./deps.js";

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
`;

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
`;

test('Program empty', () => {
    const program = Program.parse('');
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(program, 'Program is empty');
    }
});

test('Program multiple $REGISTERS', () => {
    const program = Program.parse(`
#COMPONENTS U0-1,HALT_OUT
#REGISTERS {"U0":7, "U1":5}
#REGISTERS {"U0":7, "U1":5}
INITIAL; ZZ; ID1; TDEC U0`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(program, 'Multiple #REGISTER');
    }
});

test('Program multiple $COMPONENTS', () => {
    const program = Program.parse(`
#COMPONENTS U0-1,HALT_OUT
#COMPONENTS U0-1,HALT_OUT
#REGISTERS {"U0":7, "U1":5}
INITIAL; ZZ; ID1; TDEC U0`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(program, 'Multiple #COMPONENTS');
    }
});

test('Program duplicated actions', () => {
    const program = Program.parse(`
    INITIAL; ZZ; A0; NOP, NOP
    A0; *; A0; NOP`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(
            program,
            `Duplicated actions "NOP" in "INITIAL; ZZ; A0; NOP, NOP"`
        );
    }
});

test('Program return one value: no return', () => {
    const program = Program.parse(`
    INITIAL; ZZ; A0; OUTPUT 1
    A0; *; A0; NOP`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(
            program,
            `Does not return the value in "INITIAL; ZZ; A0; OUTPUT 1"`
        );
    }
});

test('Program return one value', () => {
    const program = Program.parse(`
    INITIAL; ZZ; A0; NOP, TDEC U0
    A0; *; A0; NOP`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(
            program,
            `The return value is returned more than once in ` +
            `"INITIAL; ZZ; A0; NOP, TDEC U0": ` +
            `Actions that return a return value more than once are NOP, TDEC U0`
        );
    }
});

test('Program same component actions U', () => {
    const program = Program.parse(`
    INITIAL; ZZ; A0; INC U0, TDEC U0
    A0; *; A0; NOP`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(
            program,
            `Actions "INC U0" and "TDEC U0" act on the same component in ` +
            `"INITIAL; ZZ; A0; INC U0, TDEC U0"`
        );
    }
});

test('Program same component actions SUB', () => {
    const program = Program.parse(`
    INITIAL; ZZ; A0; SUB A1, SUB B0
    A0; *; A0; NOP`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(
            program,
            `Actions "SUB A1" and "SUB B0" act on the same component in ` +
            `"INITIAL; ZZ; A0; SUB A1, SUB B0"`
        );
    }
});

test('Program same component actions B', () => {
    const program = Program.parse(`
    INITIAL; ZZ; A0; INC B0, TDEC B0
    A0; *; A0; NOP`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(
            program,
            `Actions "INC B0" and "TDEC B0"` +
            ` act on the same component in "INITIAL; ZZ; A0; INC B0, TDEC B0"`
        );
    }
});

test('Program same component actions OUTPUT', () => {
    const program = Program.parse(`
    INITIAL; ZZ; A0; OUTPUT 1, NOP, OUTPUT 2
    A0; *; A0; NOP`);
    if (program instanceof Program) {
        throw Error('expected parse error');
    } else {
        assertEquals(
            program,
            `Actions "OUTPUT 1" and "OUTPUT 2" act on the same component in ` +
            `"INITIAL; ZZ; A0; OUTPUT 1, NOP, OUTPUT 2"`
        );
    }
});

test('Program pretty program9_1', () => {
    const program = Program.parse(program9_1);
    if (program instanceof Program) {
        assertEquals(program.pretty().trim(), program9_1.trim());
    } else {
        throw Error('parse error');
    }
});

test('Program pretty inverse', () => {
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

test('Program parse 9.1', () => {
    // p252 APGsembly 9.1
    const str = program9_1;
    const program = Program.parse(str);

    if (program instanceof Program) {
        assertEquals(program.commands.length, 5);
        assertEquals(program.registersHeader, undefined);
        assertEquals(program.componentsHeader, undefined);
    } else {
        throw Error('parse error');
    }
});

test('Program parse 9.2', () => {
    // p252 APGsembly 9.2
    const str = program9_2;
    const program = Program.parse(str);

    if (program instanceof Program) {
        assertEquals(program.commands.length, 3);
        assertEquals(program.registersHeader?.content, '{"U0":7, "U1":5}');
        assertEquals(program.componentsHeader?.content, 'U0-1,HALT_OUT');
    } else {
        throw Error('parse error');
    }
});
