import { URegAction, U_INC, U_TDEC } from "../../src/actions/URegAction.js";
import { assertEquals, test } from "../deps.js";

test("URegAction parse", () => {
    assertEquals(URegAction.parse("INC U0"), new URegAction(U_INC, 0));
    assertEquals(URegAction.parse("INC U7"), new URegAction(U_INC, 7));

    assertEquals(URegAction.parse(" INC U0"), new URegAction(U_INC, 0));
    assertEquals(URegAction.parse("INC U0 "), new URegAction(U_INC, 0));
    assertEquals(URegAction.parse("INC     U0"), new URegAction(U_INC, 0));

    assertEquals(URegAction.parse("TDEC U0"), new URegAction(U_TDEC, 0));

    assertEquals(URegAction.parse("TDEC U5"), new URegAction(U_TDEC, 5));

    assertEquals(URegAction.parse("TDEC U12"), new URegAction(U_TDEC, 12));
});

test('URegAction APGsembly 1.0', () => {
    assertEquals(URegAction.parse("TDEC R12"), new URegAction(U_TDEC, 12));
});

test("URegAction parse fail", () => {
    assertEquals(URegAction.parse("INC U_0"), undefined);

    assertEquals(URegAction.parse("INC U"), undefined);

    assertEquals(URegAction.parse("INC"), undefined);

    assertEquals(URegAction.parse("TDEC U12 aaa"), undefined);

    assertEquals(URegAction.parse("DEC U0"), undefined);
});

test("URegAction pretty", () => {
    assertEquals(URegAction.parse("INC U0").pretty(), "INC U0");
    assertEquals(URegAction.parse("INC U7").pretty(), "INC U7");

    assertEquals(URegAction.parse("TDEC U0").pretty(), "TDEC U0");
    assertEquals(URegAction.parse("TDEC U7").pretty(), "TDEC U7");
});

test("URegAction extract", () => {
    assertEquals(
        URegAction.parse("TDEC U7").extractUnaryRegisterNumbers(),
        [7]
    );
});

test("URegAction isSameComponent", () => {
    assertEquals(
        URegAction.parse('INC U2').isSameComponent(URegAction.parse('INC U2')),
        true
    );
    assertEquals(
        URegAction.parse('INC U1').isSameComponent(URegAction.parse('INC U2')),
        false
    );
});
