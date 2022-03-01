import { expand } from "./expander.ts";
import {
    APGMExpr,
    FuncAPGMExpr,
    IfAPGMExpr,
    LoopAPGMExpr,
    Macro,
    Main,
    NumberAPGMExpr,
    SeqAPGMExpr,
    StringAPGMExpr,
    VarAPGMExpr,
    WhileAPGMExpr,
} from "../ast/mod.ts";
import { assertEquals, assertThrows, test } from "../../deps_test.ts";

test("expand", () => {
    const macros: Macro[] = [
        new Macro(
            "f!",
            [new VarAPGMExpr("x")],
            new FuncAPGMExpr("output", [new VarAPGMExpr("x")], undefined),
            undefined,
        ),
    ];
    const body = new SeqAPGMExpr([
        new FuncAPGMExpr("f!", [new StringAPGMExpr("3")], undefined),
    ]);
    const result = expand(new Main(macros, [], body));

    assertEquals(
        result,
        new SeqAPGMExpr([
            new FuncAPGMExpr("output", [new StringAPGMExpr("3")], undefined),
        ]),
    );
});

test("duplicate macro", () => {
    const macros: Macro[] = [
        new Macro(
            "f!",
            [new VarAPGMExpr("x")],
            new FuncAPGMExpr("output", [new VarAPGMExpr("x")], undefined),
            undefined,
        ),
        new Macro(
            "f!",
            [new VarAPGMExpr("x")],
            new FuncAPGMExpr("output", [new VarAPGMExpr("x")], undefined),
            undefined,
        ),
    ];
    const body = new SeqAPGMExpr([
        new FuncAPGMExpr("f!", [new StringAPGMExpr("3")], undefined),
    ]);
    assertThrows(
        () => {
            expand(new Main(macros, [], body));
        },
        Error,
        'duplicate definition of macro: "f!"',
    );
});
