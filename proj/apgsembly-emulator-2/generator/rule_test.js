// @ts-check
import { generate } from "./rule.js";
import { assertEquals, test } from "../test/deps.js";

test('rule', () => {
    const apg = generate(90);
    assertEquals(apg.split(/\n|\r\n/u).slice(0, 4), [
        "# Rule 90",
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
        "INITIAL; ZZ; NEXT_S00_READ_1; SET B2D, NOP"
    ]);
});
