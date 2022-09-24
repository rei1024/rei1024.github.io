import { ErrorWithSpan } from "../apgm/ast/mod.ts";
import {
    // export
    completionParser,
    emptyArgFuncs,
    integration,
    numArgFuncs,
    strArgFuncs,
} from "./mod.ts";
import { assertEquals, assertThrows, test } from "../deps_test.ts";

test("exports", () => {
    assertEquals(emptyArgFuncs instanceof Map, true);
    assertEquals(numArgFuncs instanceof Map, true);
    assertEquals(strArgFuncs instanceof Map, true);
    assertEquals(typeof completionParser, "function");
});

const comment = [
    "# State    Input    Next state    Actions",
    "# ---------------------------------------",
];

test("integration 0", () => {
    const src = `
    output("1");
    `;
    const res = integration(src);
    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; OUTPUT 1, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration optimize", () => {
    const src = `
    inc_u(1);
    inc_u(2);
    `;
    const res = integration(src);
    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; INC U1, INC U2, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration optimize seq", () => {
    const src = `
    {
        inc_u(1);
    };
    {};
    {
        inc_u(2);
    };
    `;
    const res = integration(src);
    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; INC U1, INC U2, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration output non string", () => {
    const src = `
    output(1);
    `;
    assertThrows(() => {
        integration(src);
    });
});

test("integration optimize", () => {
    const src = `
    inc_u(1);
    inc_u(2);
    `;
    const res = integration(src);
    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; INC U1, INC U2, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration optimize loop", () => {
    const src = `
    loop {
        inc_u(1);
        inc_u(2);
    }
    `;
    const res = integration(src);
    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_1_INITIAL; INC U1, INC U2, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
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
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; OUTPUT 1, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
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
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; OUTPUT 1, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
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
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; INC U0, TDEC U1, INC B2",
        "STATE_2; *; STATE_END; TDEC B3",
        "STATE_END; *; STATE_END; HALT_OUT",
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
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; TDEC U0",
        "STATE_2; Z; STATE_END; OUTPUT 0, NOP",
        "STATE_2; NZ; STATE_END; OUTPUT 1, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration if multi", () => {
    const src = `if_z(nop()) {
        output("1");
        output("2");
    } else {
        output("3");
        output("4");
    }
      `;
    const res = integration(src);
    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; NOP",
        "STATE_2; Z; STATE_3; OUTPUT 1, NOP",
        "STATE_2; NZ; STATE_4; OUTPUT 3, NOP",
        "STATE_3; *; STATE_END; OUTPUT 2, NOP",
        "STATE_4; *; STATE_END; OUTPUT 4, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration loop if", () => {
    const src = `
    if_z(nop()) {
        loop {}
    }
    `;
    const res = integration(src);

    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; NOP",
        "STATE_2; Z; STATE_3; NOP",
        "STATE_2; NZ; STATE_END; NOP",
        "STATE_3; *; STATE_3; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration break(2) error", () => {
    const src = `
        loop {
            break(2);
        }
    `;
    assertThrows(() => {
        integration(src);
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
    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_END; NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration header", () => {
    const src = `
macro f!() {}
#REGISTERS {}
        loop {
            loop {
                break(2);
            }
        }
    `;

    const res = integration(src);
    assertEquals(res[0], "#REGISTERS {}");
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
        integration(src);
    });
});

test("integration repeat", () => {
    const src = `
    repeat(2, output("1"));
    `;
    const res = integration(src);
    assertEquals(res, [
        ...comment,
        "INITIAL; ZZ; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; OUTPUT 1, NOP",
        "STATE_2; *; STATE_END; OUTPUT 1, NOP",
        "STATE_END; *; STATE_END; HALT_OUT",
    ]);
});

test("integration repeat throws empty args", () => {
    const src = `
    repeat();
    `;
    assertThrows(() => {
        integration(src);
    }, ErrorWithSpan);
});

test("integration repeat throws one args", () => {
    const src = `
    repeat(4);
    `;
    assertThrows(() => {
        integration(src);
    }, ErrorWithSpan);
});

test("integration unknown function", () => {
    const src = `
    unknown_function();
    `;
    assertThrows(
        () => {
            integration(src);
        },
        ErrorWithSpan,
        'Unknown function: "unknown_function" at line 2 column 5',
    );
});

test("integration unknown macro", () => {
    const src = `
    unknown_macro!();
    `;
    assertThrows(
        () => {
            integration(src);
        },
        ErrorWithSpan,
        'Unknown macro: "unknown_macro!" at line 2 column 5',
    );
});

test("integration parse error with span", () => {
    const src = `
    {
    `;
    assertThrows(
        () => {
            integration(src);
        },
        ErrorWithSpan,
    );
});
