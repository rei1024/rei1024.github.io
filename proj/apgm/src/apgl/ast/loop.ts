import { APGLExpr } from "./core.ts";

export class LoopAPGLExpr extends APGLExpr {
    private kind = "loop";
    constructor(
        public readonly body: APGLExpr,
    ) {
        super();
    }

    override transform(f: (expr: APGLExpr) => APGLExpr): APGLExpr {
        return f(new LoopAPGLExpr(this.body.transform(f)));
    }
}
