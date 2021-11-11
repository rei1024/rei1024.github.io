import { APGLExpr } from "./core.ts";

export class LoopAPGLExpr extends APGLExpr {
    private kind: string = "loop";
    constructor(
        public readonly body: APGLExpr,
    ) {
        super();
    }
}
