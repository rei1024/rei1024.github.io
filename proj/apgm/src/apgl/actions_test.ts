import { A } from "./actions.ts";
import { ActionAPGLExpr } from "./ast/mod.ts";
import { assertEquals, test } from "../deps_test.ts";

function actionAssert(action: ActionAPGLExpr, strs: string[]) {
    assertEquals(action.actions, strs);
}

test("actions A", () => {
    actionAssert(A.incU(1), ["INC U1", "NOP"]);
    actionAssert(A.incUMulti(1), ["INC U1", "NOP"]);

    actionAssert(A.addA1(), ["ADD A1", "NOP"]);
    actionAssert(A.addB0(), ["ADD B0"]);
    actionAssert(A.addB1(), ["ADD B1"]);

    actionAssert(A.incB2DX(), ["INC B2DX", "NOP"]);
    actionAssert(A.incB2DY(), ["INC B2DY", "NOP"]);
    actionAssert(A.tdecB2DX(), ["TDEC B2DX"]);
    actionAssert(A.tdecB2DY(), ["TDEC B2DY"]);
    actionAssert(A.readB2D(), ["READ B2D"]);
    actionAssert(A.setB2D(), ["SET B2D", "NOP"]);

    actionAssert(A.readB(1), ["READ B1"]);
    actionAssert(A.setB(1), ["SET B1", "NOP"]);

    actionAssert(A.haltOUT(), ["HALT_OUT"]);
    actionAssert(A.halt(), ["HALT"]);

    actionAssert(A.mul0(), ["MUL 0"]);
    actionAssert(A.mul1(), ["MUL 1"]);

    actionAssert(A.nop(), ["NOP"]);

    actionAssert(A.subA1(), ["SUB A1", "NOP"]);
    actionAssert(A.subB0(), ["SUB B0"]);
    actionAssert(A.subB1(), ["SUB B1"]);
});
