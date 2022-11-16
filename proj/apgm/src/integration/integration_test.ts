import { assertEquals, runAPGsembly, test } from "../deps_test.ts";
import { integration } from "./mod.ts";
import { pi } from "./test_data.ts";

function runAPGMMachine(src: string) {
    return runAPGsembly(integration(src).join("\n"));
}

function runAPGM(src: string): string {
    return runAPGMMachine(src).actionExecutor.output.getString();
}

test("integration 2", () => {
    const output = runAPGM('output("3");');
    assertEquals(output, "3");
});

test("integration 3", () => {
    const output = runAPGM(`
output("4");
output("2");
`);
    assertEquals(output, "42");
});

test("integration 4", () => {
    const output = runAPGM(`
if_z (tdec_u(0)) {
    output("1");
} else {
    output("2");
}
`);
    assertEquals(output, "1");
});

test("integration 5", () => {
    const output = runAPGM(`
inc_u(0);
if_z (tdec_u(0)) {
    output("1");
} else {
    output("2");
}
`);
    assertEquals(output, "2");
});

test("integration 6", () => {
    const output = runAPGM(`
inc_u(0);
if_z (tdec_u(0)) {
    output("1");
    output("1");
} else {
    output("2");
    output("2");
}
`);
    assertEquals(output, "22");
});

test("integration 7", () => {
    const output = runAPGM(`
    loop {
        output("1");
        output("2");
        break();
        output("3");
    }
    output("4");
`);
    assertEquals(output, "124");
});

test("integration 8", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 42 }
    while_nz (tdec_u(0)) {
        output(".");
    }
`);
    assertEquals(output, ".".repeat(42));
});

test("integration 9", () => {
    const output = runAPGM(`
    repeat(2, output("1"));
`);
    assertEquals(output, "11");
});

test("integration 10", () => {
    const output = runAPGM(`
    macro g!(x) {
        f!(x);
    }
    macro f!(x) {
        output(x);
    }
    g!("1");
`);
    assertEquals(output, "1");
});

test("integration 11", () => {
    const output = runAPGM(`
/*
* Print single digit of an Ux register
*/
macro print_digit_u!(x) {
    if_z (tdec_u(x)) {
        output("0");
    } else if_z (tdec_u(x)) {
        output("1");
    } else if_z (tdec_u(x)) {
        output("2");
    } else if_z (tdec_u(x)) {
        output("3");
    } else if_z (tdec_u(x)) {
        output("4");
    } else if_z (tdec_u(x)) {
        output("5");
    } else if_z (tdec_u(x)) {
        output("6");
    } else if_z (tdec_u(x)) {
        output("7");
    } else if_z (tdec_u(x)) {
        output("8");
    } else {
        output("9");
    }
}

#REGISTERS { "U0": 4, "U1": 2 }

print_digit_u!(0);
print_digit_u!(1);
`);
    assertEquals(output, "42");
});

test("integration 12", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 42 }
    while_nz (tdec_u(0)) {}
    if_z (tdec_u(0)) {
        output("0");
    } else {
        output("1");
    }
`);
    assertEquals(output, "0");
});

test("integration 12.5", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 42 }
    while_nz ({ tdec_u(0); tdec_u(0); }) {}
    if_z (tdec_u(0)) {
        output("0");
    } else {
        output("1");
    }
`);
    assertEquals(output, "0");
});

test("integration 12.6", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 42 }
    while_z ({ tdec_u(0); tdec_u(0); }) {}
    if_z (tdec_u(0)) {
        output("0");
    } else {
        output("1");
    }
`);
    assertEquals(output, "1");
});

test("integration 12.7", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 42 }
    if_nz (tdec_u(1)) {
        output(".");
    }
    while_nz ({ tdec_u(0); tdec_u(0); }) {}
    if_z (tdec_u(0)) {
        output("0");
    } else {
        output("1");
    }
`);
    assertEquals(output, "0");
});

test("integration 12.8", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 42 }
    if_nz (tdec_u(1)) {
        output(".");
    }
    while_z ({ tdec_u(0); tdec_u(0); }) {}
    if_z (tdec_u(0)) {
        output("0");
    } else {
        output("1");
    }
`);
    assertEquals(output, "1");
});

test("integration 13", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 42 }
    if_z (tdec_u(1)) {
        output("2");
    } else {
        output("3");
    }
    while_nz (tdec_u(0)) {}
    if_z (tdec_u(0)) {
        output("0");
    } else {
        output("1");
    }
`);
    assertEquals(output, "20");
});

test("integration 14", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 42 }
    if_nz (tdec_u(1)) {
        output("2");
    } else {
        output("3");
    }
    while_nz (tdec_u(0)) {}
    if_z (tdec_u(0)) {
        output("0");
    } else {
        output("1");
    }
`);
    assertEquals(output, "30");
});

test("integration 14.5", () => {
    const output = runAPGM(`
    while_nz (output("3")) {}
`);
    assertEquals(output, "3");
});

test("integration 15", () => {
    const output = runAPGM(`
    #REGISTERS { "U0": 2 }
    while_z (tdec_u(0)) {}
    if_z (tdec_u(0)) {
        inc_u(0);
        output("0");
    } else {
        output("1");
    }

    if_z (tdec_u(0)) {
        inc_u(0);
        output("0");
    } else {
        output("1");
    }
`);
    assertEquals(output, "10");
});

test("integration 16", () => {
    const output = runAPGM(pi);
    assertEquals(output, "3.14");
});
