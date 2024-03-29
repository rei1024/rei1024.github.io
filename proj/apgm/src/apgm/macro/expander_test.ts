import { expand } from "./expander.ts";
import {
    FuncAPGMExpr,
    Macro,
    Main,
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
            [new VarAPGMExpr("x", undefined)],
            new FuncAPGMExpr(
                "output",
                [new VarAPGMExpr("x", undefined)],
                undefined,
            ),
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
            [new VarAPGMExpr("x", undefined)],
            new FuncAPGMExpr(
                "output",
                [new VarAPGMExpr("x", undefined)],
                undefined,
            ),
            undefined,
        ),
        new Macro(
            "f!",
            [new VarAPGMExpr("x", undefined)],
            new FuncAPGMExpr(
                "output",
                [new VarAPGMExpr("x", undefined)],
                undefined,
            ),
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
        'There is a macro with the same name: "f!"',
    );
});

test("arguments length macro", () => {
    const macros: Macro[] = [
        new Macro(
            "f!",
            [new VarAPGMExpr("x", undefined)],
            new FuncAPGMExpr(
                "output",
                [new VarAPGMExpr("x", undefined)],
                undefined,
            ),
            undefined,
        ),
    ];
    const body = new SeqAPGMExpr([
        new FuncAPGMExpr("f!", [
            new StringAPGMExpr("3"),
            new StringAPGMExpr("3"),
        ], undefined),
    ]);
    assertThrows(
        () => {
            expand(new Main(macros, [], body));
        },
        Error,
        `Error at "f!": this macro takes 1 argument but 2 arguments was supplied`,
    );
});

test("macro while error", () => {
    const macros: Macro[] = [
        new Macro(
            "f!",
            [new VarAPGMExpr("x", undefined)],
            new FuncAPGMExpr(
                "output",
                [new VarAPGMExpr("x", undefined)],
                undefined,
            ),
            undefined,
        ),
    ];
    const whileExpr = new WhileAPGMExpr(
        "Z",
        new FuncAPGMExpr("f!", [
            new StringAPGMExpr("3"),
            new StringAPGMExpr("3"),
        ], undefined),
        new SeqAPGMExpr([]),
    );
    assertThrows(
        () => {
            expand(new Main(macros, [], new SeqAPGMExpr([whileExpr])));
        },
        Error,
        `Error at "f!": this macro takes 1 argument but 2 arguments was supplied`,
    );
});

test("macro scope error", () => {
    const macros: Macro[] = [
        new Macro(
            "f!",
            [new VarAPGMExpr("x", undefined)],
            new FuncAPGMExpr(
                "output",
                [new VarAPGMExpr("y", undefined)],
                undefined,
            ),
            undefined,
        ),
    ];
    const whileExpr = new FuncAPGMExpr("f!", [
        new StringAPGMExpr("3"),
    ], undefined);
    assertThrows(
        () => {
            expand(new Main(macros, [], new SeqAPGMExpr([whileExpr])));
        },
        Error,
        `Error: Unknown variable "y"`,
    );
});
