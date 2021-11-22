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
import { test } from "../../deps_test.ts";

test("expand", () => {
    const macros: Macro[] = [
        new Macro(
            "f!",
            [new VarAPGMExpr("x")],
            new FuncAPGMExpr("output", [new VarAPGMExpr("x")]),
        ),
    ];
    const body = new SeqAPGMExpr([
        new FuncAPGMExpr("f!", [new StringAPGMExpr("3")]),
    ]);
    const result = expand(new Main(macros, [], body));
});
