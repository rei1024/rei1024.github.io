import {
    APGMExpr,
    FuncAPGMExpr,
    Macro,
    Main,
    VarAPGMExpr,
} from "../ast/mod.ts";

export class MacroExpander {
    private macroMap: Map<string, Macro>;
    private count: number = 0;
    private maxCount: number = 100000;
    public main: Main;
    constructor(main: Main) {
        this.main = main;
        this.macroMap = new Map(main.macros.map((m) => [m.name, m]));
    }

    expand(): APGMExpr {
        return this.expandExpr(this.main.seqExpr);
    }

    expandExpr(expr: APGMExpr): APGMExpr {
        if (this.maxCount < this.count) {
            throw Error("too many macro expansion");
        }
        this.count++;

        try {
            return expr.transform((x) => this.expandOnce(x));
        } catch (e) {
            throw e;
        }
    }

    expandOnce(x: APGMExpr): APGMExpr {
        if (x instanceof FuncAPGMExpr) {
            return this.expandFuncAPGMExpr(x);
        } else {
            return x;
        }
    }

    expandFuncAPGMExpr(funcExpr: FuncAPGMExpr): APGMExpr {
        if (this.macroMap.has(funcExpr.name)) {
            const macro = this.macroMap.get(funcExpr.name);
            if (macro === undefined) throw Error("internal error");
            const expanded = this.replaceVarInBoby(macro, funcExpr.args);
            return this.expandExpr(expanded);
        } else {
            return funcExpr;
        }
    }

    error() {
        throw Error("Internal error");
    }

    replaceVarInBoby(macro: Macro, exprs: APGMExpr[]): APGMExpr {
        if (exprs.length !== macro.args.length) {
            throw Error(`argment length mismatch: "${macro.name}"`);
        }
        const map = new Map(
            macro.args.map((a, i) => [a.name, exprs[i] ?? this.error()]),
        );
        return macro.body.transform((x) => {
            if (x instanceof VarAPGMExpr) {
                const expr = map.get(x.name);
                if (expr !== undefined) {
                    return expr;
                }
                throw Error(`scope error "${x.name}"`);
            } else {
                return x;
            }
        });
    }
}

export function expand(main: Main): APGMExpr {
    return new MacroExpander(main).expand();
}
