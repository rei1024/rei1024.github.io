import { assertEquals, test } from "../../deps_test.ts";
import { formatLocation, formatLocationAt } from "./core.ts";

test("apgm core", () => {
    assertEquals(
        formatLocation({ index: 10, line: 3, column: 5 }),
        "line 3 column 5",
    );

    assertEquals(
        formatLocationAt({ index: 10, line: 3, column: 5 }),
        " at line 3 column 5",
    );

    assertEquals(formatLocationAt(undefined), "");
});
