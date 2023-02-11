// @ts-check

import {
    LegacyTRegAction,
    T_DEC,
    T_INC,
    T_READ,
    T_RESET,
    T_SET,
} from "../../src/actions/LegacyTRegAction.js";
import { assertEquals, never, test } from "../deps.js";

test("LegacyTRegAction parse success", () => {
    assertEquals(
        LegacyTRegAction.parse("INC T2"),
        new LegacyTRegAction(T_INC, 2),
    );
    assertEquals(
        LegacyTRegAction.parse("DEC T2"),
        new LegacyTRegAction(T_DEC, 2),
    );
    assertEquals(
        LegacyTRegAction.parse("SET T2"),
        new LegacyTRegAction(T_SET, 2),
    );
    assertEquals(
        LegacyTRegAction.parse("RESET T2"),
        new LegacyTRegAction(T_RESET, 2),
    );
    assertEquals(
        LegacyTRegAction.parse("READ T2"),
        new LegacyTRegAction(T_READ, 2),
    );
});

test("LegacyTRegAction parse whitespace", () => {
    assertEquals(
        LegacyTRegAction.parse("  INC   T2  "),
        new LegacyTRegAction(T_INC, 2),
    );
});

test("LegacyTRegAction parse fail", () => {
    assertEquals(LegacyTRegAction.parse(""), undefined);
    assertEquals(LegacyTRegAction.parse("a b c"), undefined);
    assertEquals(LegacyTRegAction.parse("INC"), undefined);
    assertEquals(LegacyTRegAction.parse("INC T"), undefined);
    assertEquals(LegacyTRegAction.parse("INC T_2"), undefined);
});

test("LegacyTRegAction pretty", () => {
    assertEquals(LegacyTRegAction.parse("INC T2")?.pretty(), "INC T2");
    assertEquals(LegacyTRegAction.parse("DEC T2")?.pretty(), "DEC T2");
    assertEquals(LegacyTRegAction.parse("RESET T2")?.pretty(), "RESET T2");
});

test("BRegAction isSameComponent", () => {
    assertEquals(
        LegacyTRegAction.parse("INC T2")?.isSameComponent(
            LegacyTRegAction.parse("INC T2") ?? never(),
        ),
        true,
    );
    assertEquals(
        LegacyTRegAction.parse("INC T1")?.isSameComponent(
            LegacyTRegAction.parse("INC T2") ?? never(),
        ),
        false,
    );
});
