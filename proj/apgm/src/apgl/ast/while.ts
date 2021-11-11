import { APGLExpr } from "./core.ts";

export class WhileAPGLExpr extends APGLExpr {
    constructor(
        public readonly modifier: "Z" | "NZ",
        public readonly cond: APGLExpr,
        public readonly body: APGLExpr,
    ) {
        super();
    }
}
