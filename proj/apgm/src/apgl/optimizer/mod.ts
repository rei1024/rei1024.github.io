import { ActionAPGLExpr, APGLExpr, SeqAPGLExpr } from "../ast/mod.ts";
import { Action, HaltOutAction, NopAction, parseAction } from "../../deps.ts";

/**
 * 最適化
 */
export function optimize(expr: APGLExpr): APGLExpr {
    return expr.transform(optimizeOnce);
}

function optimizeOnce(expr: APGLExpr): APGLExpr {
    if (expr instanceof SeqAPGLExpr) {
        return optimizeSeqAPGLExpr(expr);
    }
    return expr;
}

function merge(as: Action[], bs: Action[]): Action[] | undefined {
    if (as.length === 0) {
        return bs;
    }

    if (bs.length === 0) {
        return as;
    }

    if (as.some((x) => x instanceof HaltOutAction)) {
        return undefined;
    }

    if (bs.some((x) => x instanceof HaltOutAction)) {
        return undefined;
    }

    const asWithoutNOP = as.filter((x) => !(x instanceof NopAction));
    const bsWithoutNOP = bs.filter((x) => !(x instanceof NopAction));

    if (
        asWithoutNOP.every((a) => !a.doesReturnValue()) &&
        bsWithoutNOP.every((b) => !b.doesReturnValue())
    ) {
        const distinctComponent = asWithoutNOP.every((a) => {
            return bsWithoutNOP.every((b) => {
                return !a.isSameComponent(b);
            });
        });

        if (distinctComponent) {
            const merged = asWithoutNOP.concat(bsWithoutNOP);
            merged.push(new NopAction());
            return merged;
        }
    }

    return undefined;
}

function toActions(actionExpr: ActionAPGLExpr): Action[] {
    return actionExpr.actions.flatMap((x) => {
        const a = parseAction(x);
        return a !== undefined ? [a] : [];
    });
}

function optimizeSeqAPGLExpr(seqExpr: SeqAPGLExpr): SeqAPGLExpr {
    const newExprs: APGLExpr[] = [];

    let items: Action[] = [];

    const putItems = () => {
        if (items.length !== 0) {
            newExprs.push(new ActionAPGLExpr(items.map((x) => x.pretty())));
            items = [];
        }
    };

    for (const expr of seqExpr.exprs) {
        if (expr instanceof ActionAPGLExpr) {
            const actions: Action[] = toActions(expr);
            const merged = merge(items, actions);
            if (merged === undefined) {
                putItems();
                items = actions;
            } else {
                items = merged;
            }
        } else {
            putItems();
            newExprs.push(expr);
        }
    }
    putItems();
    return new SeqAPGLExpr(newExprs);
}
