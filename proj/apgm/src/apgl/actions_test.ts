import { A } from "./actions.ts";
import { assertEquals, test } from "../deps_test.ts";

test("acitons", () => {
    assertEquals(A.incU(1).actions, ["INC U1", "NOP"]);
});
