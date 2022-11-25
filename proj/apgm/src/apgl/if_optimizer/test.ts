import { optimizeIf } from "./mod.ts";
import { assertEquals, test } from "../../deps_test.ts";
import { ActionAPGLExpr, IfAPGLExpr, SeqAPGLExpr } from "../ast/mod.ts";

test("if optimize empty", () => {
    const before = new SeqAPGLExpr([]);
    const after = new SeqAPGLExpr([]);
    assertEquals(optimizeIf(before), after);
});

test("if optimize 1", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["TDEC U0"]),
    ]);
    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["TDEC U0"]),
    ]);
    assertEquals(optimizeIf(before), after);
});

test("if optimize 2", () => {
    const before = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
    ]);
    const after = new SeqAPGLExpr([
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
    ]);
    assertEquals(optimizeIf(before), after);
});

test("if optimize 3", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U0", "NOP"]),
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
    ]);
    const after = new SeqAPGLExpr([
        new IfAPGLExpr(
            new SeqAPGLExpr([
                new ActionAPGLExpr(["INC U0", "NOP"]),
                new ActionAPGLExpr(["TDEC U0"]),
            ]),
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
    ]);
    assertEquals(optimizeIf(before), after);
});

test("if optimize 4", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U0", "NOP"]),
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
        new ActionAPGLExpr(["INC B2DX", "NOP"]),
    ]);
    const after = new SeqAPGLExpr([
        new IfAPGLExpr(
            new SeqAPGLExpr([
                new ActionAPGLExpr(["INC U0", "NOP"]),
                new ActionAPGLExpr(["TDEC U0"]),
            ]),
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
        new ActionAPGLExpr(["INC B2DX", "NOP"]),
    ]);
    assertEquals(optimizeIf(before), after);
});

test("if optimize 5", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U0", "NOP"]),
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new IfAPGLExpr(
            new ActionAPGLExpr(["TDEC U0"]),
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
        new ActionAPGLExpr(["INC B2DX", "NOP"]),
    ]);
    const after = new SeqAPGLExpr([
        new IfAPGLExpr(
            new SeqAPGLExpr([
                new ActionAPGLExpr(["INC U0", "NOP"]),
                new ActionAPGLExpr(["INC U1", "NOP"]),
                new ActionAPGLExpr(["TDEC U0"]),
            ]),
            new ActionAPGLExpr(["TDEC U1"]),
            new ActionAPGLExpr(["TDEC U2"]),
        ),
        new ActionAPGLExpr(["INC B2DX", "NOP"]),
    ]);
    assertEquals(optimizeIf(before), after);
});
