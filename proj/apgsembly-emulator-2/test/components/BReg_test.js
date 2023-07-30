// @ts-check

import {
    B_INC,
    B_READ,
    B_SET,
    B_TDEC,
    BRegAction,
} from "../../src/actions/BRegAction.js";
import { BReg } from "../../src/components/BReg.js";
import { assertEquals, assertThrows, test } from "../deps.js";

test("BReg read initial", () => {
    const x = new BReg();
    assertEquals(x.pointer, 0);
    assertEquals(x.getBits(), [0]);
    assertEquals(x.read(), 0);
});

test("BReg set inc", () => {
    const x = new BReg();
    assertEquals(x.getBits(), [0]);
    assertEquals(x.pointer, 0);
    const setRes = x.set();
    assertEquals(setRes, undefined);
    assertEquals(x.getBits(), [1]);
    assertEquals(x.pointer, 0);
    const res = x.inc();
    assertEquals(res, undefined);
    assertEquals(x.getBits(), [1, 0]);
    assertEquals(x.pointer, 1);
});

test("BReg extend", () => {
    const x = new BReg();
    x.pointer = 3;
    x.extend();
    assertEquals(x.getBits(), [0, 0, 0, 0]);

    x.extend();
    assertEquals(x.getBits(), [0, 0, 0, 0]);
});

test("BReg set", () => {
    const x = new BReg();
    assertEquals(x.read(), 0);
    assertEquals(x.getBits().length, 1);
    x.set();
    assertEquals(x.read(), 1);
    assertEquals(x.getBits().length, 1);
});

test("BReg read twice", () => {
    const x = new BReg();
    x.set();
    assertEquals(x.read(), 1);
    assertEquals(x.read(), 0);
    assertEquals(x.read(), 0);
});

test("BReg inc and set", () => {
    const x = new BReg();
    x.inc();
    assertEquals(x.pointer, 1);
    assertEquals(x.read(), 0);
    assertEquals(x.getBits(), [0, 0]);

    x.set();
    assertEquals(x.getBits(), [0, 1]);

    x.inc();
    assertEquals(x.pointer, 2);
    assertEquals(x.getBits(), [0, 1, 0]);
});

test("BReg inc twice and set", () => {
    const x = new BReg();
    x.inc();
    x.inc();
    assertEquals(x.read(), 0);
    x.set();
    assertEquals(x.getBits(), [0, 0, 1]);
});

test("BReg tdec", () => {
    const x = new BReg();
    assertEquals(x.tdec(), 0);
    x.inc();
    assertEquals(x.tdec(), 1);
});

test("BReg toBinaryString", () => {
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

test("BReg toNumberString", () => {
    const x = new BReg();
    x.inc();
    x.set();
    assertEquals(x.toNumberString(), "2");
    x.read();
    for (let i = 0; i < 19; i++) {
        x.inc();
    }
    x.set();
    assertEquals(x.toNumberString(), "1048576");
    assertEquals(x.toNumberString(10), "1048576");
    assertEquals(x.toNumberString(16), "100000");
});

test("BReg toObject", () => {
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
        suffix: [0],
    });
});

test("BReg set error", () => {
    const x = new BReg();
    x.set();
    assertThrows(() => {
        x.set();
    });
});

test("BReg action", () => {
    const x = new BReg();
    assertEquals(x.action(new BRegAction(B_INC, 0)), undefined);
    assertEquals(x.pointer, 1);
    assertEquals(x.action(new BRegAction(B_TDEC, 0)), 1);

    assertEquals(x.action(new BRegAction(B_SET, 0)), undefined);

    assertEquals(x.action(new BRegAction(B_READ, 0)), 1);
    assertEquals(x.action(new BRegAction(B_READ, 0)), 0);
});

test("BReg setBy", () => {
    const x = new BReg();
    x.setByRegistersInit("B1", 3);
    assertEquals(x.getBits(), [1, 1]);

    x.setByRegistersInit("B1", 6);

    assertEquals(x.getBits(), [0, 1, 1]);

    x.setByRegistersInit("B1", [1, "01100"]);

    assertEquals(x.getBits(), [0, 1, 1, 0, 0]);

    assertEquals(x.pointer, 1);

    assertThrows(() => {
        x.setByRegistersInit("B1", []);
    });

    assertThrows(() => {
        x.setByRegistersInit("B0", [1.1, ""]);
    });

    assertThrows(() => {
        x.setByRegistersInit("B0", [NaN, ""]);
    });

    assertThrows(() => {
        x.setByRegistersInit("B0", [1, "abc"]);
    });

    assertThrows(() => {
        x.setByRegistersInit("B1", true);
    });

    assertThrows(() => {
        x.setByRegistersInit("B1", null);
    });

    assertThrows(() => {
        x.setByRegistersInit("B1", [-3, "0110"]);
    });
});
