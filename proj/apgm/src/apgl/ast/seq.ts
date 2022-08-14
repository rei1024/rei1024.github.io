import { APGLExpr } from "./core.ts";

/**
 * Sequential expression
 */
export class SeqAPGLExpr extends APGLExpr {
    constructor(public readonly exprs: APGLExpr[]) {
        super();
    }

    override transform(f: (_: APGLExpr) => APGLExpr): APGLExpr {
        return f(new SeqAPGLExpr(this.exprs.map((x) => x.transform(f))));
    }
}

export function isEmptyExpr(expr: APGLExpr): boolean {
    return expr instanceof SeqAPGLExpr &&
        expr.exprs.every((e) => isEmptyExpr(e));
}
