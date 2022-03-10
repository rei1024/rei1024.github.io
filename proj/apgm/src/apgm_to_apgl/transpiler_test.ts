import { transpileAPGMExpr } from "./transpiler.ts";
import {
    FuncAPGMExpr,
    NumberAPGMExpr,
    StringAPGMExpr,
} from "../apgm/ast/mod.ts";
import { ActionAPGLExpr } from "../apgl/ast/mod.ts";
import { assertEquals, assertThrows, test } from "../deps_test.ts";

test("apgm_to_apgl output", () => {
    const res = transpileAPGMExpr(
        new FuncAPGMExpr("output", [new StringAPGMExpr("3")], undefined),
    );
    assertEquals(res, new ActionAPGLExpr(["OUTPUT 3", "NOP"]));
});

test("apgm_to_apgl read_b", () => {
    const res = transpileAPGMExpr(
        new FuncAPGMExpr("read_b", [new NumberAPGMExpr(3)], undefined),
    );
    assertEquals(res, new ActionAPGLExpr(["READ B3"]));
});

test("apgm_to_apgl output number throws", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new FuncAPGMExpr("output", [new NumberAPGMExpr(3)], undefined),
        );
    });
});

test("apgm_to_apgl inc_u number throws", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new FuncAPGMExpr("inc_u", [new StringAPGMExpr("5")], undefined),
        );
    });
});

test("apgm_to_apgl inc_u no arg", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new FuncAPGMExpr("inc_u", [], undefined),
        );
    });
});

test("apgm_to_apgl output no arg", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new FuncAPGMExpr("output", [], undefined),
        );
    });
});

test("apgm_to_apgl nop arguments throws", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new FuncAPGMExpr("nop", [new StringAPGMExpr("5")], undefined),
        );
    });
});
