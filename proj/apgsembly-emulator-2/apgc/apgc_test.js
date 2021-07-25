import { assertEquals, test } from "../test/deps.js";
import { main } from "./apgc.js";

test('apgc main output("1");', () => {
    assertEquals(main(`output("1");`), 
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; OUTPUT 1, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main #REGISTERS output("1");', () => {
    assertEquals(main(`
#REGISTERS {}
output("1");`), 
`#REGISTERS {}
INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; OUTPUT 1, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main #COMPONENTS output("1");', () => {
    assertEquals(main(`
#COMPONENTS U0-1
output("1");`), 
`#COMPONENTS U0-1
INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; OUTPUT 1, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main empty', () => {
    assertEquals(main(``), 
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; APGC_INITIAL; HALT_OUT`);
});

test('apgc main output("1"); output("2")', () => {
    assertEquals(main(`output("1"); output("2");`), 
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; OUTPUT 1, NOP
STATE_1; *; STATE_2; OUTPUT 2, NOP
STATE_2; *; STATE_2; HALT_OUT`);
});

test('apgc main inc_u(0)', () => {
    assertEquals(main(`inc_u(0);`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; INC U0, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main tdec_u(0)', () => {
    assertEquals(main(`tdec_u(0);`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; TDEC U0
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main inc_b(0)', () => {
    assertEquals(main(`inc_b(0);`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; INC B0, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main tdec_b(0)', () => {
    assertEquals(main(`tdec_b(0);`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; TDEC B0
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main read_b(0)', () => {
    assertEquals(main(`read_b(0);`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; READ B0
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main set_b(0)', () => {
    assertEquals(main(`set_b(0);`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; SET B0, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});


test('apgc main inc_b2dx()', () => {
    assertEquals(main(`inc_b2dx();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; INC B2DX, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});


test('apgc main inc_b2dy()', () => {
    assertEquals(main(`inc_b2dy();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; INC B2DY, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main tdec_b2dx()', () => {
    assertEquals(main(`tdec_b2dx();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; TDEC B2DX
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main tdec_b2dy()', () => {
    assertEquals(main(`tdec_b2dy();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; TDEC B2DY
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main read_b2d()', () => {
    assertEquals(main(`read_b2d();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; READ B2D
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main set_b2d()', () => {
    assertEquals(main(`set_b2d();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; SET B2D, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main add_a1()', () => {
    assertEquals(main(`add_a1();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; ADD A1, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main add_b0()', () => {
    assertEquals(main(`add_b0();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; ADD B0
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main add_b1()', () => {
    assertEquals(main(`add_b1();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; ADD B1
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main sub_a1()', () => {
    assertEquals(main(`sub_a1();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; SUB A1, NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main mul_0()', () => {
    assertEquals(main(`mul_0();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; MUL 0
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main mul_1()', () => {
    assertEquals(main(`mul_1();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; MUL 1
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main nop()', () => {
    assertEquals(main(`nop();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; NOP
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main halt_out()', () => {
    assertEquals(main(`halt_out();`),
`INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; HALT_OUT
STATE_1; *; STATE_1; HALT_OUT`);
});

test('apgc main if_zero tdec_u', () => {
    const input = `
    if_zero(tdec_u(0)) {
        output("1");
    } else {
        output("2");
    }`;
    const output = `INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; TDEC U0
STATE_1; Z; STATE_2; NOP
STATE_1; NZ; STATE_3; NOP
STATE_2; *; STATE_4; OUTPUT 1, NOP
STATE_3; *; STATE_5; OUTPUT 2, NOP
STATE_4; *; STATE_6; NOP
STATE_5; *; STATE_6; NOP
STATE_6; *; STATE_6; HALT_OUT`;
    assertEquals(main(input), output);
});

test('apgc main goto label', () => {
    const input = `
label("a");
goto("a");
    `;
    const output = `INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; NOP
APGC_LABEL_a; *; STATE_1; NOP
STATE_1; *; APGC_LABEL_a; NOP`;
    assertEquals(main(input), output);
});

test('apgc main while_non_zero', () => {
    const input = `
while_non_zero(tdec_u(0)) {  }
    `;
    const output = `INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; TDEC U0
STATE_1; Z; STATE_3; NOP
STATE_1; NZ; STATE_2; NOP
STATE_2; *; APGC_INITIAL; NOP
STATE_3; *; STATE_3; HALT_OUT`;
    assertEquals(main(input), output);
});

test('apgc main while_zero', () => {
    const input = `
while_zero(tdec_u(0)) {  }
    `;
    const output = `INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; TDEC U0
STATE_1; Z; STATE_2; NOP
STATE_1; NZ; STATE_3; NOP
STATE_2; *; APGC_INITIAL; NOP
STATE_3; *; STATE_3; HALT_OUT`;
    assertEquals(main(input), output);
});

test('apgc main if_non_zero', () => {
    const input = `
if_non_zero(tdec_u(0)) { output("1"); }
    `;
    const output = `INITIAL; ZZ; APGC_INITIAL; NOP
APGC_INITIAL; *; STATE_1; TDEC U0
STATE_1; Z; STATE_3; NOP
STATE_1; NZ; STATE_2; NOP
STATE_2; *; STATE_4; OUTPUT 1, NOP
STATE_4; *; STATE_5; NOP
STATE_3; *; STATE_5; NOP
STATE_5; *; STATE_5; HALT_OUT`;
    assertEquals(main(input), output);
});
