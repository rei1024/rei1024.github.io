// @ts-check

import { assertEquals, assertIsError, test } from "./test_deps.js";
import { isHaltState, Line } from "./Line.js";

test("parse Line", () => {
    assertEquals(Line.parse("0 0 _ r 1o"), Line.make("0", "0", "_", "r", "1o"));
    assertEquals(
        Line.parse("0 0 _ r 1o"),
        Line.make("0", "0", "_", "r", "1o", false),
    );
    assertEquals(
        Line.parse("0 0 _ r 1o"),
        Line.make("0", "0", "_", "r", "1o", undefined),
    );

    assertEquals(Line.parse("0 0 _ R 1o"), Line.make("0", "0", "_", "r", "1o"));

    assertEquals(Line.parse("0 0 _ L 1o"), Line.make("0", "0", "_", "l", "1o"));

    assertEquals(
        Line.parse("1 a b r 2 !"),
        Line.make("1", "a", "b", "r", "2", true),
    );
    assertIsError(
        Line.parse("1 a b r 2 ?"),
        Error,
        `breakpoint is "!" but it is "?" at "1 a b r 2 ?".`,
    );

    assertEquals(
        Line.parse("0 0 _ r 1o; abc def"),
        Line.make("0", "0", "_", "r", "1o"),
    );

    assertEquals(
        Line.parse("0 0 _ r 1o !; abc def"),
        Line.make("0", "0", "_", "r", "1o", true),
    );

    assertEquals(Line.parse(""), undefined);

    assertEquals(Line.parse(" "), undefined);

    assertEquals(Line.parse("; a"), undefined);

    assertIsError(
        Line.parse("a b ; a"),
        Error,
        'must have 5 components but it has 2 at "a b ; a".',
    );

    assertIsError(
        Line.parse("0 0 _ x 1o"),
        Error,
        `direction should be 'l', 'r' or '*'`,
    );

    assertEquals(
        Line.parse("  0   0 _   r  1o "),
        Line.make("0", "0", "_", "r", "1o"),
    );
    assertEquals(
        Line.parse("  0   0 _   r  1o   !"),
        Line.make("0", "0", "_", "r", "1o", true),
    );
});

test("pretty Line", () => {
    /**
     * @param {string} str
     */
    function v(str) {
        const line = Line.parse(str);
        if (line === undefined) {
            throw Error("line is undefined");
        }
        if (line instanceof Error) {
            throw line;
        }
        assertEquals(line.pretty(), str);
    }
    const data = [
        "1 0 _ r 1o",
        "1 a b r 2",
        "* * b r 2",
        "* _ b r 2",
        "_ * b r 2",
        "* * * * *",
    ];
    for (const x of data) {
        v(x);
    }
});

test("isHaltState", () => {
    assertEquals(isHaltState("halt_x"), true);

    assertEquals(isHaltState("halt"), true);

    assertEquals(isHaltState("non_halt_x"), false);

    assertEquals(isHaltState("Halt_x"), true);

    assertEquals(isHaltState("HALT"), true);
    assertEquals(isHaltState("HALTED"), true);
});
