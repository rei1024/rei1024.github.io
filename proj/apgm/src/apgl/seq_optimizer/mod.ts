import { APGLExpr, SeqAPGLExpr } from "../ast/mod.ts";

/**
 * SeqAPGLExprの平坦化による最適化
 */
export function optimizeSeq(expr: APGLExpr): APGLExpr {
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

    for (const expr of seqExpr.exprs) {
        if (expr instanceof SeqAPGLExpr) {
            newExprs = newExprs.concat(expr.exprs);
        } else {
            newExprs.push(expr);
        }
    }

    return new SeqAPGLExpr(newExprs);
}
