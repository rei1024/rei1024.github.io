import { transpileAPGMExpr } from "./transpiler.ts";
import {
    FuncAPGMExpr,
    IfAPGMExpr,
    NumberAPGMExpr,
    StringAPGMExpr,
    VarAPGMExpr,
    WhileAPGMExpr,
} from "../apgm/ast/mod.ts";
import {
    ActionAPGLExpr,
    BreakAPGLExpr,
    IfAPGLExpr,
    SeqAPGLExpr,
    WhileAPGLExpr,
} from "../apgl/ast/mod.ts";
import { assertEquals, assertThrows, test } from "../deps_test.ts";

test("apgm_to_apgl output", () => {
    const res = transpileAPGMExpr(
        new FuncAPGMExpr("output", [new StringAPGMExpr("3")], undefined),
    );
    assertEquals(res, new ActionAPGLExpr(["OUTPUT 3", "NOP"]));
});

function assertAction0(name: string, actions: string[]) {
    const res = transpileAPGMExpr(
        new FuncAPGMExpr(name, [], undefined),
    );
    assertEquals(res, new ActionAPGLExpr(actions));
}

function assertAction1(name: string, num: number, actions: string[]) {
    const res = transpileAPGMExpr(
        new FuncAPGMExpr(name, [new NumberAPGMExpr(num)], undefined),
    );
    assertEquals(res, new ActionAPGLExpr(actions));
}

test("apgm_to_apgl actions", () => {
    assertAction1("read_b", 3, ["READ B3"]);
    assertAction1("set_b", 3, ["SET B3", "NOP"]);
    assertAction1("tdec_u", 3, ["TDEC U3"]);
    assertAction0("halt_out", ["HALT_OUT"]);
    assertAction0("inc_b2dx", ["INC B2DX", "NOP"]);
    assertAction0("inc_b2dy", ["INC B2DY", "NOP"]);
    assertAction0("tdec_b2dx", ["TDEC B2DX"]);
    assertAction0("tdec_b2dy", ["TDEC B2DY"]);
    assertAction0("read_b2d", ["READ B2D"]);
    assertAction0("set_b2d", ["SET B2D", "NOP"]);
    assertAction0("add_a1", ["ADD A1", "NOP"]);
    assertAction0("add_b0", ["ADD B0"]);
    assertAction0("add_b1", ["ADD B1"]);
    assertAction0("sub_a1", ["SUB A1", "NOP"]);
    assertAction0("sub_b0", ["SUB B0"]);
    assertAction0("sub_b1", ["SUB B1"]);
    assertAction0("nop", ["NOP"]);
});

test("apgm_to_apgl output number throws", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new FuncAPGMExpr("output", [new NumberAPGMExpr(3)], undefined),
        );
    });
});

test("apgm_to_apgl inc_u string throws", () => {
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

test("apgm_to_apgl if", () => {
    const res = transpileAPGMExpr(
        new IfAPGMExpr(
            "Z",
            new FuncAPGMExpr("nop", [], undefined),
            new FuncAPGMExpr("nop", [], undefined),
            undefined,
            undefined,
        ),
    );

    assertEquals(
        res,
        new IfAPGLExpr(
            new ActionAPGLExpr(["NOP"]),
            new ActionAPGLExpr(["NOP"]),
            new SeqAPGLExpr([]),
        ),
    );
});

test("apgm_to_apgl if nz", () => {
    const res = transpileAPGMExpr(
        new IfAPGMExpr(
            "NZ",
            new FuncAPGMExpr("nop", [], undefined),
            new FuncAPGMExpr("nop", [], undefined),
            undefined,
            undefined,
        ),
    );

    assertEquals(
        res,
        new IfAPGLExpr(
            new ActionAPGLExpr(["NOP"]),
            new SeqAPGLExpr([]),
            new ActionAPGLExpr(["NOP"]),
        ),
    );
});

test("apgm_to_apgl if nz", () => {
    const res = transpileAPGMExpr(
        new IfAPGMExpr(
            "NZ",
            new FuncAPGMExpr("nop", [], undefined),
            new FuncAPGMExpr("nop", [], undefined),
            new FuncAPGMExpr("nop", [], undefined),
            undefined,
        ),
    );

    assertEquals(
        res,
        new IfAPGLExpr(
            new ActionAPGLExpr(["NOP"]),
            new ActionAPGLExpr(["NOP"]),
            new ActionAPGLExpr(["NOP"]),
        ),
    );
});

test("apgm_to_apgl nop arguments throws", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new FuncAPGMExpr("nop", [new StringAPGMExpr("5")], undefined),
        );
    });
});

test("apgm_to_apgl break", () => {
    const res = transpileAPGMExpr(
        new FuncAPGMExpr("break", [], undefined),
    );
    assertEquals(res, new BreakAPGLExpr(undefined));
});

test("apgm_to_apgl while", () => {
    const res = transpileAPGMExpr(
        new WhileAPGMExpr(
            "Z",
            new FuncAPGMExpr("nop", [], undefined),
            new FuncAPGMExpr("nop", [], undefined),
        ),
    );

    assertEquals(
        res,
        new WhileAPGLExpr(
            "Z",
            new ActionAPGLExpr(["NOP"]),
            new ActionAPGLExpr(["NOP"]),
        ),
    );
});

test("apgm_to_apgl repeat non number", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new FuncAPGMExpr("repeat", [
                new StringAPGMExpr("5"),
                new StringAPGMExpr("5"),
            ], undefined),
        );
    });
});

test("apgm_to_apgl number", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new NumberAPGMExpr(3),
        );
    });
});

test("apgm_to_apgl string", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new StringAPGMExpr("a"),
        );
    });
});

test("apgm_to_apgl var", () => {
    assertThrows(() => {
        transpileAPGMExpr(
            new VarAPGMExpr("a", undefined),
        );
    });
});
