import { integration } from "./mod.ts";
import { assertEquals, assertThrows, test } from "../deps_test.ts";

test("integration 0", () => {
    const src = `
    output("1");
    `;
    const res = integration(src);
    assertEquals(res, [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; OUTPUT 1, NOP",
        "STATE_2; *; STATE_2; HALT_OUT",
    ]);
});

test("integration 1 macro", () => {
    const src = `
    macro f!(x) {
        output(x);
    }
    f!("1");
    `;
    const res = integration(src);
    assertEquals(res, [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; OUTPUT 1, NOP",
        "STATE_2; *; STATE_2; HALT_OUT",
    ]);
});

test("integration 2 macro", () => {
    const src = `
    macro g!(x) {
        f!(x);
    }
    macro f!(x) {
        output(x);
    }
    g!("1");
    `;
    const res = integration(src);
    assertEquals(res, [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; OUTPUT 1, NOP",
        "STATE_2; *; STATE_2; HALT_OUT",
    ]);
});

test("integration actions", () => {
    const src = `
    inc_u(0);
    tdec_u(1);
    inc_b(2);
    tdec_b(3);
    `;
    const res = integration(src);

    assertEquals(res, [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; INC U0, NOP",
        "STATE_2; *; STATE_3; TDEC U1",
        "STATE_3; *; STATE_4; INC B2, NOP",
        "STATE_4; *; STATE_5; TDEC B3",
        "STATE_5; *; STATE_5; HALT_OUT",
    ]);
});

test("integration if", () => {
    const src = `
    if_z(tdec_u(0)) {
        output("0");
    } else {
        output("1");
    }
    `;
    const res = integration(src);
    assertEquals(res, [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_3_IF_Z; NOP",
        "STATE_2; NZ; STATE_4_IF_NZ; NOP",
        "STATE_3_IF_Z; *; STATE_5; OUTPUT 0, NOP",
        "STATE_4_IF_NZ; *; STATE_6; OUTPUT 1, NOP",
        "STATE_5; *; STATE_6; NOP",
        "STATE_6; *; STATE_6; HALT_OUT",
    ]);
});

test("integration break(2) error", () => {
    const src = `
        loop {
            break(2);
        }
    `;
    assertThrows(() => {
        const res = integration(src);
    });
});

test("integration break(2)", () => {
    const src = `
        loop {
            loop {
                break(2);
            }
        }
    `;

    const res = integration(src);
});

test("integration header", () => {
    const src = `
#REGISTERS {}
macro f!() {}
        loop {
            loop {
                break(2);
            }
        }
    `;

    const res = integration(src);
    assertEquals(res[0], '#REGISTERS {}');
});

test("integration header fail", () => {
    const src = `
#UNKNOWN {}
        loop {
            loop {
                break(2);
            }
        }
    `;
    assertThrows(() => {
        const res = integration(src);
    });
});
