// @ts-check

import { SubAction } from "../../src/actions/SubAction.js";
import { assertEquals, never, test } from "../deps.js";

test("SubAction parse SUB A1", () => {
    assertEquals(SubAction.parse("SUB A1")?.pretty(), "SUB A1");
});

test("SubAction parse SUB B0", () => {
    assertEquals(SubAction.parse("SUB B0")?.pretty(), "SUB B0");
});

test("SubAction parse SUB B1", () => {
    assertEquals(SubAction.parse("SUB B1")?.pretty(), "SUB B1");
});

test("SubAction parse fail", () => {
    assertEquals(SubAction.parse("SUB"), undefined);
});

test("SubAction isSameComponent", () => {
    assertEquals(
        SubAction.parse("SUB A1")?.isSameComponent(
            SubAction.parse("SUB B0") ?? never(),
        ),
        true,
    );
});
