import { assertEquals, runAPGsembly, test } from "../deps_test.ts";
import { integration } from "./mod.ts";

function runAPGMMachine(src: string) {
    return runAPGsembly(integration(src).join("\n"));
}

test("integration 1", () => {
    const machine = runAPGMMachine(``);
    assertEquals(machine.currentState, "STATE_END");
});

function runAPGM(src: string): string {
    return runAPGsembly(integration(src).join("\n")).actionExecutor.output
        .getString();
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
