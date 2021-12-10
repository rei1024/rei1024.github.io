import {
    _,
    funcAPGMExpr,
    identifier,
    identifierOnly,
    ifAPGMExpr,
    main,
    naturalNumberParser,
    stringLit,
} from "./mod.ts";
import { assertEquals, assertThrows, test } from "../../deps_test.ts";

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

test("parser: number", () => {
    const x = naturalNumberParser.tryParse("123");
    assertEquals(x, 123);
    const y = naturalNumberParser.tryParse("0x10");
    assertEquals(y, 16);
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

test("parser: func", () => {
    const array = [
        "f(a,b,c)",
        "f(a, b, c)",
        "f ( a, b , c )",
        "f ( a, /* comment */ b , c )",
        "f ( a, \n b , \n c )",
    ];
    for (const s of array) {
        const value = funcAPGMExpr().tryParse(s);
        assertEquals(value.name, "f");
        // @ts-expect-error
        assertEquals(value.args.map((x) => x.name), ["a", "b", "c"]);
    }
});

test("parser: stringLit", () => {
    const value = stringLit.tryParse(`"abc"`);
    assertEquals(value, "abc");

    const value2 = stringLit.tryParse(`  "abc"`);
    assertEquals(value2, "abc");
});

test("parser: main", () => {
    main().tryParse(``);
    main().tryParse(`  `);
    main().tryParse(`
        f();
    `);
    main().tryParse(`
        /* macro name must end with "!" */
        macro f!(x) {
            x;
            x;
        }
        macro h!( y ) {
            y;
        }
        f!(2);
        f!("2");
        f!({ g(3); });
    `);
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
    main().tryParse(`
        if_z(f(2)) {
            g(3);
        }
    `);
    main().tryParse(`
        if_z(f(2)) {
            g(3);
        } else {
            f(4);
        }
    `);
    main().tryParse(`
        if_z(f(2)) {
            g(3);
        } else if_z(g(7)) {
            f(4);
        }
    `);
    main().tryParse(`
        if_z(f(2)) {
            g(3);
        } else if_z(g(7)) {
            f(4);
        } else {
            h(5);
        }
    `);
    main().tryParse(`
        while_z(f(2)) {
            g(3);
        }
        while_nz(g("1")) {
            f(2);
        }
    `);
    main().tryParse(`
        loop {
            g(3);
        }
    `);
    main().tryParse(`
        loop {
            g(3);
        }
        loop {
            g(3);
        }
    `);
    main().tryParse(`
        f({
            g(2);
            g(3);
        });
    `);
    main().tryParse(`
macro f!() {
    output("1");
}
#REGISTERS {}
f(2);
    `);
    main().tryParse(`
    macro my_output!(x) {
    output(x);
}
#REGISTERS { "U0": 5 }
inc_u(0);`);
});

test("parser: main hex", () => {
    const res = main().tryParse(`f(0x10);`);
    // @ts-ignore
    assertEquals(res.seqExpr.exprs[0].args[0].value, 16);
});
