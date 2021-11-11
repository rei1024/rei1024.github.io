import { transpileAPGL } from "./transpiler.ts";
import { ActionAPGLExpr } from "../apgl/ast/mod.ts";

import { assertEquals, test } from "../deps_test.ts";

test("transpileAPGL", () => {
    const expr = new ActionAPGLExpr(["NOP"]);
    assertEquals(transpileAPGL(expr), [
        "INITIAL; *; STATE_1_INITIAL; NOP",
        "STATE_1_INITIAL; *; STATE_2; NOP",
        "STATE_2; *; STATE_2; HALT_OUT",
    ]);
});
