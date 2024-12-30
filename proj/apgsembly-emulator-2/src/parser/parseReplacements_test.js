// @ts-check

import { assertEquals, test } from "../../test/deps.js";
import { parseReplacements } from "./parseReplacements.js";

test("parseReplacements 1", () => {
    assertEquals(parseReplacements("{ x = 2 }", undefined, "_", "#DEFINE"), [{
        needle: "x",
        replacement: "2",
    }]);
});

test("parseReplacements 2", () => {
    assertEquals(
        parseReplacements("{ x = 2; y = 4 }", undefined, "_", "#DEFINE"),
        [{
            needle: "x",
            replacement: "2",
        }, {
            needle: "y",
            replacement: "4",
        }],
    );
});

test("parseReplacements error", () => {
    assertEquals(
        parseReplacements("{ x = 2", undefined, "_", "#DEFINE"),
        `Invalid line "_". #DEFINE replacements does not end with "}"`,
    );
});
