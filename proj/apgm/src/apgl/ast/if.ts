import { APGLExpr } from "./core.ts";

export class IfAPGLExpr extends APGLExpr {
    constructor(
        public readonly cond: APGLExpr,
        public readonly thenBody: APGLExpr, // Z
        public readonly elseBody: APGLExpr, // NZ
    ) {
        super();
    }
}
