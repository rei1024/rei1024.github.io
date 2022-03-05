import { optimize } from "./mod.ts";
import { assertEquals, test } from "../../deps_test.ts";
import {
    ActionAPGLExpr,
    LoopAPGLExpr,
    SeqAPGLExpr,
    WhileAPGLExpr,
} from "../ast/mod.ts";

test("optimize empty", () => {
    const before = new SeqAPGLExpr([]);
    const after = new SeqAPGLExpr([]);
    assertEquals(optimize(before), after);
});

test("optimize one nop", () => {
    const before = new SeqAPGLExpr([new ActionAPGLExpr(["NOP"])]);
    const after = new SeqAPGLExpr([new ActionAPGLExpr(["NOP"])]);
    assertEquals(optimize(before), after);
});

test("optimize two nop", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["NOP"]),
        new ActionAPGLExpr(["NOP"]),
    ]);
    const after = new SeqAPGLExpr([new ActionAPGLExpr(["NOP"])]);
    assertEquals(optimize(before), after);
});

test("optimize three nop", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["NOP"]),
        new ActionAPGLExpr(["NOP"]),
        new ActionAPGLExpr(["NOP"]),
    ]);
    const after = new SeqAPGLExpr([new ActionAPGLExpr(["NOP"])]);
    assertEquals(optimize(before), after);
});

test("optimize two inc", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["INC U2", "NOP"]),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "INC U2", "NOP"]),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize three inc", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["INC U2", "NOP"]),
        new ActionAPGLExpr(["INC U3", "NOP"]),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "INC U2", "INC U3", "NOP"]),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize four inc", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["INC U2", "NOP"]),
        new ActionAPGLExpr(["INC U2", "NOP"]),
        new ActionAPGLExpr(["INC U3", "NOP"]),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "INC U2", "NOP"]),
        new ActionAPGLExpr(["INC U2", "INC U3", "NOP"]),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize two tdec", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["TDEC U1", "NOP"]),
        new ActionAPGLExpr(["TDEC U2", "NOP"]),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["TDEC U1", "NOP"]),
        new ActionAPGLExpr(["TDEC U2", "NOP"]),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize inc and tdec", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["TDEC U2", "NOP"]),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["TDEC U2", "NOP"]),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize tdec and inc", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["TDEC U2", "NOP"]),
        new ActionAPGLExpr(["INC U1", "NOP"]),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["TDEC U2", "NOP"]),
        new ActionAPGLExpr(["INC U1", "NOP"]),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize inc twice", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["INC U1", "NOP"]),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["INC U1", "NOP"]),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize inner", () => {
    const inner1 = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["INC U2", "NOP"]),
    ]);
    const inner2 = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "INC U2", "NOP"]),
    ]);
    {
        const before = new SeqAPGLExpr([inner1]);
        const after = new SeqAPGLExpr([inner2]);
        assertEquals(optimize(before), after);
    }
    {
        const before = new LoopAPGLExpr(inner1);
        const after = new LoopAPGLExpr(inner2);
        assertEquals(optimize(before), after);
    }
    {
        const before = new WhileAPGLExpr("Z", inner1, inner1);
        const after = new WhileAPGLExpr("Z", inner2, inner2);
        assertEquals(optimize(before), after);
    }
});

test("optimize loop", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new ActionAPGLExpr(["INC U2", "NOP"]),
        new LoopAPGLExpr(new SeqAPGLExpr([])),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "INC U2", "NOP"]),
        new LoopAPGLExpr(new SeqAPGLExpr([])),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize loop between", () => {
    const before = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new LoopAPGLExpr(new SeqAPGLExpr([])),
        new ActionAPGLExpr(["INC U2", "NOP"]),
    ]);

    const after = new SeqAPGLExpr([
        new ActionAPGLExpr(["INC U1", "NOP"]),
        new LoopAPGLExpr(new SeqAPGLExpr([])),
        new ActionAPGLExpr(["INC U2", "NOP"]),
    ]);
    assertEquals(optimize(before), after);
});

test("optimize loop inner", () => {
    const before = new LoopAPGLExpr(
        new SeqAPGLExpr([
            new ActionAPGLExpr(["INC U1", "NOP"]),
            new ActionAPGLExpr(["INC U2", "NOP"]),
        ]),
    );

    const after = new LoopAPGLExpr(
        new SeqAPGLExpr([
            new ActionAPGLExpr(["INC U1", "INC U2", "NOP"]),
        ]),
    );
    assertEquals(optimize(before), after);
});
