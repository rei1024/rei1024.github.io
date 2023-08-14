// @ts-check

import { LegacyTRegAction } from "../../src/actions/LegacyTRegAction.js";
import { LegacyTReg } from "../../src/components/LegacyTReg.js";
import { assertEquals, test, throwError } from "../deps.js";

test("LegacyTReg action", () => {
    const x = new LegacyTReg();
    x.action(LegacyTRegAction.parse("INC T0") ?? throwError());
    assertEquals(x.getPointer(), 1);
});
