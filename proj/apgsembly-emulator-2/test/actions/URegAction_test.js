import { URegAction } from "../../src/actions/URegAction.js"
import { assertEquals } from "../deps.js";

Deno.test("URegAction parse", () => {
    assertEquals(URegAction.parse("INC U0"), { op: "INC", regNumber: 0 });
    assertEquals(URegAction.parse("INC U7"), { op: "INC", regNumber: 7 });

    assertEquals(URegAction.parse(" INC U0"), { op: "INC", regNumber: 0 });
    assertEquals(URegAction.parse("INC U0 "), { op: "INC", regNumber: 0 });
    assertEquals(URegAction.parse("INC     U0"), { op: "INC", regNumber: 0 });

    assertEquals(URegAction.parse("TDEC U0"), { op: "TDEC", regNumber: 0 });

    assertEquals(URegAction.parse("TDEC U5"), { op: "TDEC", regNumber: 5 });

    assertEquals(URegAction.parse("TDEC U12"), { op: "TDEC", regNumber: 12 });
});

Deno.test("URegAction parse fail", () => {
    assertEquals(URegAction.parse("INC U_0"), undefined);

    assertEquals(URegAction.parse("INC U"), undefined);

    assertEquals(URegAction.parse("INC"), undefined);

    assertEquals(URegAction.parse("TDEC U12 aaa"), undefined);

    assertEquals(URegAction.parse("DEC U0"), undefined);
});

Deno.test("URegAction pretty", () => {
    assertEquals(URegAction.parse("INC U0").pretty(), "INC U0");
    assertEquals(URegAction.parse("INC U7").pretty(), "INC U7");

    assertEquals(URegAction.parse("TDEC U0").pretty(), "TDEC U0");
    assertEquals(URegAction.parse("TDEC U7").pretty(), "TDEC U7");
});

Deno.test("URegAction extract", () => {
    assertEquals(URegAction.parse("TDEC U7").extractUnaryRegisterNumbers(), [7]);
});
