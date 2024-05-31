import { optimizeSeq } from "./mod.ts";
import { assertEquals, test } from "../../deps_test.ts";
import { ActionAPGLExpr, SeqAPGLExpr } from "../ast/mod.ts";

test("seq optimize empty", () => {
    const before = new SeqAPGLExpr([]);
    const after = new SeqAPGLExpr([]);
    assertEquals(optimizeSeq(before), after);
});

test("seq optimize no", () => {
    const before = new SeqAPGLExpr([new ActionAPGLExpr(["TDEC U0"])]);
    assertEquals(optimizeSeq(before), before);
});

test("seq optimize empty elem", () => {
    const before = new SeqAPGLExpr([
        new SeqAPGLExpr([]),
        new SeqAPGLExpr([]),
    ]);
    const after = new SeqAPGLExpr([]);
    assertEquals(optimizeSeq(before), after);
});

test("seq optimize ", () => {
    const action = new ActionAPGLExpr(["TDEC U0"]);
    const before = new SeqAPGLExpr([
        new SeqAPGLExpr([action]),
        new SeqAPGLExpr([]),
        new SeqAPGLExpr([action]),
    ]);
    const after = new SeqAPGLExpr([
        action,
        action,
    ]);
    assertEquals(optimizeSeq(before), after);
});
