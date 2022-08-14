import {
    _,
    apgmExpr,
    funcAPGMExpr,
    header,
    identifier,
    identifierOnly,
    ifAPGMExpr,
    macro,
    main,
    stringLit,
} from "./mod.ts";
import { assertEquals, assertThrows, test } from "../../deps_test.ts";
import { VarAPGMExpr } from "../ast/var.ts";

test("parser: identifier", () => {
    const value = identifier.tryParse("abc");
    assertEquals(value, "abc");
});

test("parser: identifier empty fail", () => {
    assertThrows(() => {
        identifier.tryParse("");
    });
});

test("parser: identifier start number fail", () => {
    assertThrows(() => {
        identifier.tryParse("1abc");
    });
});

test("parser: identifier contains number", () => {
    const value = identifier.tryParse("abc1");
    assertEquals(value, "abc1");
});

test("parser: identifier whitespace", () => {
    assertThrows(() => {
        identifier.tryParse("abc def");
    });
});

test("parser: comment", () => {
    const array = [
        "abc def",
        "abc /* comment */ def",
        "abc/* comment */def",
        "abc/* comment *//* comment2 */def",
        "abc/* comment */  /* comment2 */  def",
        "abc/**//**/def",
        "abc/**/def",
        "abc/*\n*/def",
        "abc\ndef",
        "abc\n\ndef",
        "abc\n/*\n comment \n*/\ndef",
    ];
    for (const s of array) {
        const value = identifierOnly.skip(_).and(identifierOnly).tryParse(s);
        assertEquals(value, ["abc", "def"]);
    }
});

test("parser: comment", () => {
    const array = [
        "abc/* comment */ def /* comment2 */",
    ];
    for (const s of array) {
        const value = identifier.repeat().tryParse(s);
        assertEquals(value, ["abc", "def"]);
    }
});

test("parser: header", () => {
    assertEquals(header.tryParse("#REGISTERS {}").toString(), "#REGISTERS {}");
    assertEquals(
        header.tryParse("#COMPONENTS OUTPUT").toString(),
        "#COMPONENTS OUTPUT",
    );
});

test("parser: header no space", () => {
    assertEquals(header.tryParse("#REGISTERS{}").toString(), "#REGISTERS {}");
});

test("parser: func", () => {
    const array = [
        "f(a,b,c)",
        "f(a, b, c)",
        "f ( a, b , c )",
        "f ( a, /* comment */ b , c )",
        "f ( a, \n b , \n c )",
        "f \n(\n a\n,b,c)",
    ];
    for (const s of array) {
        const value = funcAPGMExpr().tryParse(s);
        assertEquals(value.name, "f");
        assertEquals(
            value.args.map((x) => x instanceof VarAPGMExpr ? x.name : ""),
            ["a", "b", "c"],
        );
    }
});

test("parser: stringLit", () => {
    const value = stringLit.tryParse(`"abc"`);
    assertEquals(value, "abc");

    const value2 = stringLit.tryParse(`  "def"`);
    assertEquals(value2, "def");
});

test("parser: main", () => {
    assertThrows(() => {
        main().tryParse(`
            /* no ! */
            macro f(x) {
                x;
            }
        `);
    });
    assertThrows(() => {
        main().tryParse(`
            macrof!(x) {
                x;
            }
        `);
    });
    ifAPGMExpr().tryParse(`
        if_z(f(2)) {
            g(3);
        }
    `);

    const testCases = [
        ``,
        `  `,
        `f();`,

        `/* macro name must end with "!" */
        macro f!(x) {
            x;
            x;
        }
        macro h!( y ) {
            y;
        }
        macro   g!( y ) {
            y;
        }
        f!(2);
        f!("2");
        f!({ g(3); });`,

        `if_z(f(2)) {
            g(3);
        }`,

        `if_z(f(2)) {
            g(3);
        } else {
            f(4);
        }`,

        `if_z(f(2)) {
            g(3);
        } else if_z(g(7)) {
            f(4);
        }`,

        `if_z(f(2)) {
            g(3);
        } else if_nz(g(7)) {
            f(4);
        } else {
            h(5);
        }`,

        `while_z(f(2)) {
            g(3);
        }
        while_nz(g("1")) {
            f(2);
        }`,

        `loop {
            g(3);
        }`,

        `loop {
            g (  3 ) ;
        }`,

        `loop {
            g(3);
        }
        loop {
            g(3);
        }`,

        `f({
            g(2);
            g(3);
        });`,

        `macro f!() {
            output("1");
        }
        #REGISTERS {}
        f(2);`,

        `macro my_output!(x) {
            output(x);
        }
        #REGISTERS { "U0": 5 }
        inc_u(0);`,
    ];
    for (const c of testCases) {
        const m = main().tryParse(c);
        const mPretty = m.pretty();
        try {
            main().tryParse(mPretty);
        } catch (error) {
            throw Error(`Parse Error for: "${c}" -> "${mPretty}"`, {
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
});

test("parser: main hex", () => {
    const res = main().tryParse(`f(0x10);`);
    // @ts-ignore complex
    assertEquals(res.seqExpr.exprs[0].args[0].value, 16);
});

test("parser: pretty", () => {
    const value = apgmExpr().tryParse("f(a,b)");
    assertEquals(value.pretty(), "f(a, b)");
});

test("parser: pretty 2", () => {
    const value = apgmExpr().tryParse(`{ f(1); g("2"); }`);
    assertEquals(value.pretty(), `{f(1);\ng("2");}`);
});

test("parser: pretty loop", () => {
    const value = apgmExpr().tryParse(`loop { f(1); g("2"); }`);
    assertEquals(value.pretty(), `loop {f(1);\ng("2");}`);
});

test("parser: pretty macro", () => {
    const value = macro().tryParse(`macro f!() { output("3"); }`);
    assertEquals(value.pretty(), `macro f!() {output("3");}`);
});

test("parser: pretty macro args", () => {
    const value = macro().tryParse(`macro f!(x, y) { output("3"); }`);
    assertEquals(value.pretty(), `macro f!(x, y) {output("3");}`);
});
