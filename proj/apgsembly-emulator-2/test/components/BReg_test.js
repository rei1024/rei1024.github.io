import { BRegAction } from "../../src/actions/BRegAction.js";
import { BReg } from "../../src/components/BReg.js"
import { assertEquals, assertThrows } from "../deps.js";

Deno.test("BReg read initial", () => {
    const x = new BReg();
    assertEquals(x.read(), 0);
});

Deno.test("BReg set", () => {
    const x = new BReg();
    assertEquals(x.read(), 0);
    x.set();
    assertEquals(x.read(), 1);
});

Deno.test("BReg read twice", () => {
    const x = new BReg();
    x.set();
    assertEquals(x.read(), 1);
    assertEquals(x.read(), 0);
});

Deno.test("BReg inc and set", () => {
    const x = new BReg();
    x.inc();
    assertEquals(x.read(), 0);
    x.set();
    assertEquals(x.getBits(), [0, 1]);
});

Deno.test("BReg inc twice and set", () => {
    const x = new BReg();
    x.inc();
    x.inc();
    assertEquals(x.read(), 0);
    x.set();
    assertEquals(x.getBits(), [0, 0, 1]);
});

Deno.test("BReg tdec", () => {
    const x = new BReg();
    assertEquals(x.tdec(), 0);
    x.inc();
    assertEquals(x.tdec(), 1);
});

Deno.test("BReg toBinaryString", () => {
    const x = new BReg();
    assertEquals(x.toBinaryString(), "0");
    x.inc();
    x.set();
    assertEquals(x.getBits(), [0, 1]);
    assertEquals(x.toBinaryString(), "10");
    assertEquals(x.getBits(), [0, 1]);
    x.inc();
    assertEquals(x.getBits(), [0, 1, 0]);
    assertEquals(x.toBinaryString(), "010");
});

Deno.test('BReg toObject', () => {
    const x = new BReg();
    assertEquals(x.toBinaryString(), "0");
    x.inc();
    x.set();
    x.inc();
    assertEquals(x.getBits(), [0, 1, 0]);
    x.tdec();
    assertEquals(x.toObject(), {
        prefix: [0],
        head: 1,
        suffix: [0]
    });
});

Deno.test('BReg error', () => {
    const x = new BReg();
    x.set();
    assertThrows(() => {
        x.set();
    });
});

Deno.test('BReg action', () => {
    const x = new BReg();
    assertEquals(x.action(new BRegAction("INC", 0)), undefined);
    assertEquals(x.pointer, 1);
    assertEquals(x.action(new BRegAction("TDEC", 0)), 1);

    assertEquals(x.action(new BRegAction("SET", 0)), undefined);

    assertEquals(x.action(new BRegAction("READ", 0)), 1);
    assertEquals(x.action(new BRegAction("READ", 0)), 0);
});
