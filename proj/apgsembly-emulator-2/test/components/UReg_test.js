// @ts-check

import { URegAction } from "../../src/actions/URegAction.js";
import { UReg } from "../../src/components/UReg.js";
import { assertEquals, test, assertThrows } from "../deps.js";

test("UReg tdec", () => {
    const x = new UReg();
    assertEquals(x.getValue(), 0);
    assertEquals(x.tdec(), 0);
    assertEquals(x.getValue(), 0);
    assertEquals(x.tdec(), 0);
    assertEquals(x.getValue(), 0);
});

test("UReg inc", () => {
    const x = new UReg();
    assertEquals(x.getValue(), 0);
    x.inc();
    assertEquals(x.getValue(), 1);
    assertEquals(x.tdec(), 1);
    assertEquals(x.getValue(), 0);
    assertEquals(x.tdec(), 0);
    assertEquals(x.getValue(), 0);
});

test("UReg inc twice", () => {
    const x = new UReg();
    assertEquals(x.getValue(), 0);
    x.inc();
    assertEquals(x.getValue(), 1);
    x.inc();
    assertEquals(x.getValue(), 2);
    x.tdec();
    assertEquals(x.getValue(), 1);
});

// action
test("UReg action INC", () => {
    const x = new UReg();
    assertEquals(x.getValue(), 0);
    x.action(URegAction.parse("INC U0"));
    assertEquals(x.getValue(), 1);
    x.action(URegAction.parse("INC U0"));
    assertEquals(x.getValue(), 2);
    x.action(URegAction.parse("INC U0"));
    assertEquals(x.getValue(), 3);
});

test("UReg action TDEC", () => {
    const x = new UReg();
    assertEquals(x.getValue(), 0);
    const res = x.action(URegAction.parse("TDEC U0"));
    assertEquals(x.getValue(), 0);
    assertEquals(res, 0);

    x.action(URegAction.parse("INC U0"));
    assertEquals(x.getValue(), 1);

    const res2 = x.action(URegAction.parse("TDEC U0"));

    assertEquals(x.getValue(), 0);
    assertEquals(res2, 1);

    x.action(URegAction.parse("INC U0"));
    assertEquals(x.getValue(), 1);
    x.action(URegAction.parse("INC U0"));
    assertEquals(x.getValue(), 2);


    const res3 = x.action(URegAction.parse("TDEC U0"));

    assertEquals(x.getValue(), 1);
    assertEquals(res3, 1);
});

test("UReg setBy", () => {
    const x = new UReg();
    x.setByRegistersInit('1', 0);
    assertEquals(x.getValue(), 0);
    x.setByRegistersInit('1', 3);
    assertEquals(x.getValue(), 3);

    assertThrows(() => {
        x.setByRegistersInit('1', []);
    });

    assertThrows(() => {
        x.setByRegistersInit('1', 3.3);
    });

    assertThrows(() => {
        x.setByRegistersInit('1', NaN);
    });

    assertThrows(() => {
        x.setByRegistersInit('1', true);
    });

    assertThrows(() => {
        x.setByRegistersInit('1', 'a');
    });
});
