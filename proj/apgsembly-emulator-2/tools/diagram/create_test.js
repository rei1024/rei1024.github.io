// @ts-check

import { assertEquals, test } from "../../test/deps.js";
import { create } from "./create.js";

test("diagram", () => {
    const diagram = create(`
    # State    Input    Next state    Actions
    # ---------------------------------------
    INITIAL; ZZ; STATE_1_INITIAL; NOP
    STATE_1_INITIAL; *; STATE_2; OUTPUT 1, NOP
    STATE_2; *; STATE_3; OUTPUT 2, NOP
    STATE_3; *; STATE_END; OUTPUT 3, NOP
    STATE_END; *; STATE_END; HALT_OUT
    `);
    assertEquals(
        diagram,
        `graph TB
INITIAL["INITIAL"]-->|"ZZ"|STATE_1_INITIAL["STATE_1_INITIAL"]
STATE_1_INITIAL["STATE_1_INITIAL"]-->STATE_2["STATE_2"]
STATE_2["STATE_2"]-->STATE_3["STATE_3"]
STATE_3["STATE_3"]-->STATE_END["STATE_END"]
STATE_END["STATE_END"]-->STATE_END["STATE_END"]`,
    );
});
