// @ts-check

import {
    B_INC,
    B_READ,
    B_SET,
    B_TDEC,
    BRegAction,
} from "../../src/actions/BRegAction.js";
import { assertEquals, never, test } from "../deps.js";

test("BRegAction parse success", () => {
    assertEquals(BRegAction.parse("INC B2"), new BRegAction(B_INC, 2));

    assertEquals(BRegAction.parse("TDEC B2"), new BRegAction(B_TDEC, 2));

    assertEquals(BRegAction.parse("READ B2"), new BRegAction(B_READ, 2));

    assertEquals(BRegAction.parse("SET B2"), new BRegAction(B_SET, 2));
});

test("BRegAction parse whitespace", () => {
    assertEquals(BRegAction.parse(" INC B2"), new BRegAction(B_INC, 2));
    assertEquals(BRegAction.parse("INC B2   "), new BRegAction(B_INC, 2));
    assertEquals(BRegAction.parse("INC    B2"), new BRegAction(B_INC, 2));
});

test("BRegAction parse fail", () => {
    assertEquals(BRegAction.parse(""), undefined);
    assertEquals(BRegAction.parse("a b c"), undefined);
    assertEquals(BRegAction.parse("INC"), undefined);
    assertEquals(BRegAction.parse("INC B"), undefined);
    assertEquals(BRegAction.parse("INC B_2"), undefined);
});

test("BRegAction pretty", () => {
    assertEquals(BRegAction.parse("INC B2")?.pretty(), "INC B2");
    assertEquals(BRegAction.parse("INC  B2")?.pretty(), "INC B2");
});

test("BRegAction isSameComponent", () => {
    assertEquals(
        BRegAction.parse("INC B2")?.isSameComponent(
            BRegAction.parse("INC B2") ?? never(),
        ),
        true,
    );
    assertEquals(
        BRegAction.parse("INC B1")?.isSameComponent(
            BRegAction.parse("INC B2") ?? never(),
        ),
        false,
    );
});
