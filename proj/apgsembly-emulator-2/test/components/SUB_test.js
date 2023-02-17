// @ts-check

import { SubAction } from "../../src/actions/SubAction.js";
import { SUB } from "../../src/components/SUB.js";
import { assertEquals, test, throwError } from "../deps.js";

test("SUB a1", () => {
    const x = new SUB();
    x.a1();
    assertEquals(x.getValue(), 3);
});

test("SUB b0", () => {
    const x = new SUB();
    x.b0();
    assertEquals(x.getValue(), 0);
});

test("SUB b1", () => {
    const x = new SUB();
    x.b1();
    assertEquals(x.getValue(), 17);
});

// action
test("SUB action a1", () => {
    const x = new SUB();
    x.action(SubAction.parse("SUB A1") ?? throwError());
    assertEquals(x.getValue(), 3);
});

test("SUB action b0", () => {
    const x = new SUB();
    x.action(SubAction.parse("SUB B0") ?? throwError());
    assertEquals(x.getValue(), 0);
});

test("SUB action b1", () => {
    const x = new SUB();
    x.action(SubAction.parse("SUB B1") ?? throwError());
    assertEquals(x.getValue(), 17);
});
