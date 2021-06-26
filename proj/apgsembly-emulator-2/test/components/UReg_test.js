import { URegAction } from "../../src/actions/URegAction.js";
import { UReg } from "../../src/components/UReg.js"
import { assertEquals } from "../deps.js";

Deno.test("UReg tdec", () => {
    const x = new UReg();
    assertEquals(x.getValue(), 0);
    assertEquals(x.tdec(), 0);
    assertEquals(x.getValue(), 0);
    assertEquals(x.tdec(), 0);
    assertEquals(x.getValue(), 0);
});

Deno.test("UReg inc", () => {
    const x = new UReg();
    assertEquals(x.getValue(), 0);
    x.inc();
    assertEquals(x.getValue(), 1);
    assertEquals(x.tdec(), 1);
    assertEquals(x.getValue(), 0);
    assertEquals(x.tdec(), 0);
    assertEquals(x.getValue(), 0);
});

Deno.test("UReg inc twice", () => {
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
Deno.test("UReg action INC", () => {
    const x = new UReg();
    x.action(URegAction.parse("INC U0"));
    assertEquals(x.getValue(), 1);
});

Deno.test("UReg action TDEC", () => {
    const x = new UReg();
    const res = x.action(URegAction.parse("TDEC U0"));
    assertEquals(x.getValue(), 0);
    assertEquals(res, 0);
});
