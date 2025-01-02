import { integration } from "./mod.ts";
import { assertEquals, test } from "../deps_test.ts";

test("integration 0 actions", () => {
    const src = `
    nop();
    halt_out();
    halt();
    mul_0();
    `;
    const res = integration(src);
    assertEquals(res, [
        "#COMPONENTS MUL",
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
        "INITIAL; ZZ; STATE_1; NOP",
        "STATE_1;  *; STATE_2; NOP",
        "STATE_2;  *; STATE_3; HALT_OUT",
        "STATE_3;  *; STATE_4; HALT",
        "STATE_4;  *; STATE_END; MUL 0",
        "STATE_END;  *; STATE_END; HALT",
    ]);
});
