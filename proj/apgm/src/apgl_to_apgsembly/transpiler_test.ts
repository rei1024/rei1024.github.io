import { transpileAPGL } from "./transpiler.ts";
import {
    ActionAPGLExpr,
    BreakAPGLExpr,
    IfAPGLExpr,
    LoopAPGLExpr,
    SeqAPGLExpr,
    WhileAPGLExpr,
} from "../apgl/ast/mod.ts";

import { assertEquals, assertThrows, test } from "../deps_test.ts";

test("transpileAPGL NOP", () => {
    const expr = new ActionAPGLExpr(["NOP"]);
    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL empty action throws", () => {
    const expr = new ActionAPGLExpr([]);
    assertThrows(() => {
        transpileAPGL(expr);
    });
});

test("transpileAPGL Seq empty", () => {
    const expr1 = new SeqAPGLExpr([]);
    const expr2 = new SeqAPGLExpr([
        new SeqAPGLExpr([]),
        new SeqAPGLExpr([
            new SeqAPGLExpr([]),
        ]),
    ]);

    const expected = [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ];
    assertEquals(transpileAPGL(expr1), expected);
    assertEquals(transpileAPGL(expr2), expected);
});

test("transpileAPGL if", () => {
    const expr = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["INC U0", "NOP"]),
            new ActionAPGLExpr(["INC U1", "NOP"]),
        ),
    ]);

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_END; INC U0, NOP",
        "STATE_2; NZ; STATE_END; INC U1, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL if multi", () => {
    const expr = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new SeqAPGLExpr([
                new ActionAPGLExpr(["INC U1", "NOP"]),
                new ActionAPGLExpr(["TDEC U1"]),
            ]),
            new SeqAPGLExpr([
                new ActionAPGLExpr(["INC U2", "NOP"]),
                new ActionAPGLExpr(["TDEC U2"]),
            ]),
        ),
    ]);

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_3; INC U1, NOP",
        "STATE_2; NZ; STATE_4; INC U2, NOP",
        "STATE_3; *; STATE_END; TDEC U1",
        "STATE_4; *; STATE_END; TDEC U2",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL if empty", () => {
    const expr = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new SeqAPGLExpr([]),
            new SeqAPGLExpr([]),
        ),
    ]);

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; TDEC U0",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL if all empty", () => {
    const expr = new SeqAPGLExpr([
        new IfAPGLExpr(
            new SeqAPGLExpr([]),
            new SeqAPGLExpr([]),
            new SeqAPGLExpr([]),
        ),
    ]);

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL if nest", () => {
    const expr = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["INC U0", "NOP"]),
            new IfAPGLExpr(
                new ActionAPGLExpr(["TDEC U1"]),
                new ActionAPGLExpr(["INC U1", "NOP"]),
                new SeqAPGLExpr([]),
            ),
        ),
    ]);

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_END; INC U0, NOP",
        "STATE_2; NZ; STATE_3; TDEC U1",
        "STATE_3; Z; STATE_END; INC U1, NOP",
        "STATE_3; NZ; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL if nest 2", () => {
    const expr = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new SeqAPGLExpr([]),
            new IfAPGLExpr(
                new ActionAPGLExpr(["TDEC U1"]),
                new ActionAPGLExpr(["INC U1", "NOP"]),
                new SeqAPGLExpr([]),
            ),
        ),
    ]);

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_END; NOP",
        "STATE_2; NZ; STATE_3; TDEC U1",
        "STATE_3; Z; STATE_END; INC U1, NOP",
        "STATE_3; NZ; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL if z", () => {
    const expr = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["INC U0", "NOP"]),
            new SeqAPGLExpr([]),
        ),
    ]);

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_END; INC U0, NOP",
        "STATE_2; NZ; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL if nz", () => {
    const expr = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new SeqAPGLExpr([]),
            new ActionAPGLExpr(["INC U0", "NOP"]),
        ),
    ]);

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_END; NOP",
        "STATE_2; NZ; STATE_END; INC U0, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL empty loop", () => {
    const expr = new LoopAPGLExpr(
        new SeqAPGLExpr([]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL loop", () => {
    const expr = new LoopAPGLExpr(
        new ActionAPGLExpr(["INC U0", "NOP"]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_1_INITIAL; INC U0, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL loop break", () => {
    const expr = new LoopAPGLExpr(
        new SeqAPGLExpr([
            new ActionAPGLExpr(["INC U0", "NOP"]),
            new BreakAPGLExpr(undefined),
        ]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; INC U0, NOP",
        "STATE_2; *; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL loop 2 break 1", () => {
    const expr = new LoopAPGLExpr(
        new LoopAPGLExpr(
            new SeqAPGLExpr([
                new ActionAPGLExpr(["INC U0", "NOP"]),
                new BreakAPGLExpr(1),
            ]),
        ),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; INC U0, NOP",
        "STATE_2; *; STATE_1_INITIAL; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL loop 2 break 2", () => {
    const expr = new LoopAPGLExpr(
        new LoopAPGLExpr(
            new SeqAPGLExpr([
                new ActionAPGLExpr(["INC U0", "NOP"]),
                new BreakAPGLExpr(2),
            ]),
        ),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; INC U0, NOP",
        "STATE_2; *; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL break", () => {
    const expr = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U0", "NOP"]),
        new BreakAPGLExpr(undefined),
    ]);
    assertThrows(() => {
        transpileAPGL(expr);
    });
});

test("transpileAPGL while nz", () => {
    const expr = new WhileAPGLExpr(
        "NZ",
        new ActionAPGLExpr(["TDEC U0"]),
        new SeqAPGLExpr([]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_END; NOP",
        "STATE_2; NZ; STATE_1_INITIAL; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL while z", () => {
    const expr = new WhileAPGLExpr(
        "Z",
        new ActionAPGLExpr(["TDEC U0"]),
        new SeqAPGLExpr([]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_1_INITIAL; NOP",
        "STATE_2; NZ; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL while z 2", () => {
    const expr = new WhileAPGLExpr(
        "Z",
        new SeqAPGLExpr([
            new ActionAPGLExpr(["TDEC U0"]),
        ]),
        new SeqAPGLExpr([
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_3_WHILE_BODY; NOP",
        "STATE_2; NZ; STATE_END; NOP",
        "STATE_3_WHILE_BODY; *; STATE_4; TDEC U1",
        "STATE_4; *; STATE_1_INITIAL; TDEC U2",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL if while ", () => {
    const expr = new IfAPGLExpr(
        new ActionAPGLExpr(["TDEC U1"]),
        new WhileAPGLExpr(
            "Z",
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
        new SeqAPGLExpr([]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U1",
        "STATE_2; Z; STATE_3; NOP",
        "STATE_2; NZ; STATE_END; NOP",
        "STATE_3; *; STATE_4; TDEC U0",
        "STATE_4; Z; STATE_5_WHILE_BODY; NOP",
        "STATE_4; NZ; STATE_END; NOP",
        "STATE_5_WHILE_BODY; *; STATE_3; TDEC U2",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL while", () => {
    const expr = new WhileAPGLExpr(
        "Z",
        new ActionAPGLExpr(["TDEC U0"]),
        new ActionAPGLExpr(["TDEC U2"]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_3_WHILE_BODY; NOP",
        "STATE_2; NZ; STATE_END; NOP",
        "STATE_3_WHILE_BODY; *; STATE_1_INITIAL; TDEC U2",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL while body", () => {
    const expr = new WhileAPGLExpr(
        "NZ",
        new ActionAPGLExpr(["TDEC U0"]),
        new SeqAPGLExpr([
            new ActionAPGLExpr(["OUTPUT 1", "NOP"]),
        ]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_END; NOP",
        "STATE_2; NZ; STATE_3_WHILE_BODY; NOP",
        "STATE_3_WHILE_BODY; *; STATE_1_INITIAL; OUTPUT 1, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL while empty", () => {
    const expr = new WhileAPGLExpr(
        "Z",
        new ActionAPGLExpr(["TDEC U0"]),
        new SeqAPGLExpr([
            new SeqAPGLExpr([]),
        ]),
    );

    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_1_INITIAL; NOP",
        "STATE_2; NZ; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("transpileAPGL options prefix", () => {
    const expr = new ActionAPGLExpr(["NOP"]);
    assertEquals(transpileAPGL(expr, { prefix: "X_" }), [
        "INITIAL; *; X_1_INITIAL; NOP",
        "X_1_INITIAL; *; X_END; NOP",
        "X_END; *; X_END; HALT_OUT",
    ]);
});
