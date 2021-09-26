import {
    LegacyTRegAction,
    T_INC,
    T_DEC,
    T_READ,
    T_SET,
    T_RESET
} from "../../src/actions/LegacyTRegAction.js";
import {
    LegacyTReg
} from "../../src/components/LegacyTReg.js";
import { assertEquals, test } from "../deps.js";

test("LegacyTReg action", () => {
    const x = new LegacyTReg();
    x.action(LegacyTRegAction.parse('INC T0'));
    assertEquals(x.getPointer(), 1);
});
