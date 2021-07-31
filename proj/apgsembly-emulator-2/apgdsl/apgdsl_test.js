/* eslint-disable array-bracket-newline */
/* eslint-disable camelcase */
import {
    emit,
    promote,
    if_zero,
    if_non_zero,
    while_zero,
    while_non_zero,
    output,
    inc_u,
    tdec_u,
    inc_b,
    tdec_b,
    read_b,
    set_b,
    inc_b2dx,
    inc_b2dy,
    tdec_b2dx,
    tdec_b2dy,
    add_a1,
    add_b0,
    add_b1,
    sub_a1,
    sub_b0,
    sub_b1,
    mul_0,
    mul_1,
    nop,
    halt_out,
} from "./apgdsl.js";

import { assertEquals, test } from "../test/deps.js";

test('apgdsl', () => {
    const program = promote([
        output("a"),
        output('b'),
    ]);
    assertEquals(emit(program).map(x => x.pretty()).join('\n'),
`INITIAL; ZZ; STATE0; NOP
STATE0; *; STATE1; OUTPUT a, NOP
STATE1; *; STATE2; OUTPUT b, NOP
STATE2; *; STATE2; HALT_OUT
`.trim());
});

test('apgdsl if', () => {
    const program = promote([
        output("a"),
        output('b'),
        if_zero(tdec_u(0), [
            output("c"),
        ], [
            output("d")
        ])
    ]);
    assertEquals(emit(program).map(x => x.pretty()).join('\n'),
`INITIAL; ZZ; STATE0; NOP
STATE0; *; STATE1; OUTPUT a, NOP
STATE1; *; STATE2; OUTPUT b, NOP
STATE2; *; STATE3; TDEC U0
STATE3; Z; STATE4; NOP
STATE3; NZ; STATE5; NOP
STATE4; *; STATE6; OUTPUT c, NOP
STATE5; *; STATE7; OUTPUT d, NOP
STATE6; *; STATE8; NOP
STATE7; *; STATE8; NOP
STATE8; *; STATE8; HALT_OUT
`.trim());
});

test('apgdsl if_non_zero', () => {
    const program = promote([
        output("a"),
        output('b'),
        if_non_zero(tdec_u(0), [
            output("c"),
        ], [
            output("d")
        ])
    ]);
    assertEquals(emit(program).map(x => x.pretty()).join('\n'),
`INITIAL; ZZ; STATE0; NOP
STATE0; *; STATE1; OUTPUT a, NOP
STATE1; *; STATE2; OUTPUT b, NOP
STATE2; *; STATE3; TDEC U0
STATE3; Z; STATE4; NOP
STATE3; NZ; STATE5; NOP
STATE4; *; STATE6; OUTPUT d, NOP
STATE5; *; STATE7; OUTPUT c, NOP
STATE6; *; STATE8; NOP
STATE7; *; STATE8; NOP
STATE8; *; STATE8; HALT_OUT
`.trim());
});
