// @ts-check

import { assertEquals, test } from "../../test/deps.js";
import { parseReplacements } from "./parseReplacements.js";

test("parseReplacements", () => {
    assertEquals(parseReplacements("{ x = 2 }", undefined, "_", "#DEFINE"), [{
        needle: "x",
        replacement: "2",
    }]);
});

test("parseReplacements", () => {
    assertEquals(
        parseReplacements("{ x = 2", undefined, "_", "#DEFINE"),
        `Invalid line "_". #DEFINE replacements does not end with "}"`,
    );
});