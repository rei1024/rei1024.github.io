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
        `argument length mismatch: "f!" expect 1 argument but given 2 arguments`,
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
        `argument length mismatch: "f!" expect 1 argument but given 2 arguments`,
    );
});
