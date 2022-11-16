import { APGLExpr } from "./core.ts";
import { ActionAPGLExpr } from "./mod.ts";

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

export function extractSingleActionExpr(
    expr: APGLExpr,
): ActionAPGLExpr | undefined {
    if (expr instanceof ActionAPGLExpr) {
        return expr;
    }

    if (expr instanceof SeqAPGLExpr && expr.exprs.length === 1) {
        const expr0 = expr.exprs[0];
        return extractSingleActionExpr(expr0);
    }

    return undefined;
}
