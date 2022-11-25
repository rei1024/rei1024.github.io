import { APGLExpr, IfAPGLExpr, SeqAPGLExpr } from "../ast/mod.ts";

/**
 * ifのcondへのマージによる最適化
 */
export function optimizeIf(expr: APGLExpr): APGLExpr {
    return expr.transform(optimizeOnce);
}

function optimizeOnce(expr: APGLExpr): APGLExpr {
    if (expr instanceof SeqAPGLExpr) {
        return optimizeSeqAPGLExpr(expr);
    }
    return expr;
}

function optimizeSeqAPGLExpr(seqExpr: SeqAPGLExpr): SeqAPGLExpr {
    let newExprs: APGLExpr[] = [];

    let tempExprs: APGLExpr[] = [];

    for (const expr of seqExpr.exprs) {
        if (expr instanceof IfAPGLExpr && tempExprs.length !== 0) {
            tempExprs.push(expr.cond);
            newExprs.push(
                new IfAPGLExpr(
                    new SeqAPGLExpr(tempExprs),
                    expr.thenBody,
                    expr.elseBody,
                ),
            );
            tempExprs = [];
        } else {
            tempExprs.push(expr);
        }
    }

    newExprs = newExprs.concat(tempExprs);

    return new SeqAPGLExpr(newExprs);
}
