import { APGLExpr } from "./core.ts";

export class SeqAPGLExpr extends APGLExpr {
    constructor(public readonly exprs: APGLExpr[]) {
        super();
    }

    override transform(f: (_: APGLExpr) => APGLExpr): APGLExpr {
        return f(new SeqAPGLExpr(this.exprs.map((x) => x.transform(f))));
    }
}
