import { BRegAction } from "../../src/actions/BRegAction.js"
import { assertEquals } from "../deps.js";

Deno.test("BRegAction parse success", () => {
    assertEquals(BRegAction.parse('INC B2'), { op: "INC", regNumber: 2 });

    assertEquals(BRegAction.parse('TDEC B2'), { op: "TDEC", regNumber: 2 });

    assertEquals(BRegAction.parse('READ B2'), { op: "READ", regNumber: 2 });

    assertEquals(BRegAction.parse('SET B2'), { op: "SET", regNumber: 2 });
});

Deno.test("BRegAction parse whitespace", () => {
    assertEquals(BRegAction.parse(' INC B2'), { op: "INC", regNumber: 2 });
    assertEquals(BRegAction.parse('INC B2   '), { op: "INC", regNumber: 2 });
    assertEquals(BRegAction.parse('INC    B2'), { op: "INC", regNumber: 2 });
});

Deno.test("BRegAction parse fail", () => {
    assertEquals(BRegAction.parse(''), undefined);
    assertEquals(BRegAction.parse('a b c'), undefined);
    assertEquals(BRegAction.parse('INC'), undefined);
    assertEquals(BRegAction.parse('INC B'), undefined);
    assertEquals(BRegAction.parse('INC B_2'), undefined);
});

Deno.test("BRegAction pretty", () => {
    assertEquals(BRegAction.parse('INC B2').pretty(), "INC B2");
    assertEquals(BRegAction.parse('INC  B2').pretty(), "INC B2");
});

Deno.test("BRegAction extract", () => {
    assertEquals(BRegAction.parse('INC B2').extractBinaryRegisterNumbers(), [2]);
});
