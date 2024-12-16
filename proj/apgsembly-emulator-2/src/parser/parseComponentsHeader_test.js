// @ts-check

import { assertEquals, assertThrows, test } from "../../test/deps.js";
import { parseComponentsHeader } from "./parseComponentsHeader.js";

/**
 * @param {string} str
 */
function parse(str) {
    /** @type {string[]} */
    const components = [];
    parseComponentsHeader(str, components);
    return { components };
}

test("parseComponentsHeader", () => {
    assertEquals(
        parse("B0-5, U0-5, U8-9, ADD, SUB, MUL, OUTPUT"),
        {
            components: [
                "B0",
                "B1",
                "B2",
                "B3",
                "B4",
                "B5",
                "U0",
                "U1",
                "U2",
                "U3",
                "U4",
                "U5",
                "U8",
                "U9",
                "ADD",
                "SUB",
                "MUL",
                "OUTPUT",
            ],
        },
    );
});

test("parseComponentsHeader CLOCK", () => {
    assertEquals(
        parse("CLOCK2^20"),
        {
            components: [],
        },
    );
});

test("parseComponentsHeader Error B", () => {
    assertThrows(() => {
        parse("B");
    });

    assertThrows(() => {
        parse("B2-");
    });

    assertThrows(() => {
        parse("B-3");
    });
});
