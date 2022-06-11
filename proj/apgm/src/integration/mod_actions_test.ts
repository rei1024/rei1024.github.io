import { integration } from "./mod.ts";
import { assertEquals, test } from "../deps_test.ts";

test("integration 0 actions", () => {
    const src = `
    nop();
    halt_out();
    mul_0();
    `;
    const res = integration(src);
    assertEquals(res, [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; NOP",
        "STATE_2; *; STATE_3; HALT_OUT",
        "STATE_3; *; STATE_END; MUL 0",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});
