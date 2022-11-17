import { ActionAPGLExpr, APGLExpr, SeqAPGLExpr } from "../ast/mod.ts";
import { Action, HaltOutAction, NopAction, parseAction } from "../../deps.ts";

/**
 * アクションの統合による最適化
 */
export function optimize(expr: APGLExpr): APGLExpr {
    return expr.transform(optimizeOnce);
}

function optimizeOnce(expr: APGLExpr): APGLExpr {
    return expr instanceof SeqAPGLExpr ? optimizeSeqAPGLExpr(expr) : expr;
}

export function mergeActionAPGLExpr(
    a: ActionAPGLExpr,
    b: ActionAPGLExpr,
): ActionAPGLExpr | undefined {
    const mergedActions = merge(toActions(a), toActions(b));
    return mergedActions === undefined
        ? undefined
        : new ActionAPGLExpr(mergedActions.map((action) => action.pretty()));
}

function merge(
    as: readonly Action[],
    bs: readonly Action[],
): Action[] | undefined {
    if (as.length === 0) {
        return bs.slice();
    }

    if (bs.length === 0) {
        return as.slice();
    }

    if (as.some((x) => x instanceof HaltOutAction)) {
        return undefined;
    }

    if (bs.some((x) => x instanceof HaltOutAction)) {
        return undefined;
    }

    const asWithoutNOP = as.filter((x) => !(x instanceof NopAction));
    const bsWithoutNOP = bs.filter((x) => !(x instanceof NopAction));

    const asWithoutNOPNonReturn = asWithoutNOP.every((a) =>
        !a.doesReturnValue()
    );

    const bsWithoutNOPNonReturn = bsWithoutNOP.every((b) =>
        !b.doesReturnValue()
    );

    if (!asWithoutNOPNonReturn && !bsWithoutNOPNonReturn) {
        // 両方とも値を返していればマージ不可
        return undefined;
    }

    const distinctComponent = asWithoutNOP.every((a) => {
        return bsWithoutNOP.every((b) => {
            return !a.isSameComponent(b);
        });
    });

    if (!distinctComponent) {
        // 同じコンポーネントがあればマージ不可
        return undefined;
    }

    const merged = asWithoutNOP.concat(bsWithoutNOP);
    if (asWithoutNOPNonReturn && bsWithoutNOPNonReturn) {
        // 両方とも値を返さなければNOPを追加
        merged.push(new NopAction());
    }

    return merged;
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
