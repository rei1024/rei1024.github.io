import {
    APGMExpr,
    ErrorWithLocation,
    formatLocationAt,
    FuncAPGMExpr,
    Macro,
    Main,
    VarAPGMExpr,
} from "../ast/mod.ts";
import { dups } from "./_dups.ts";

function argumentsMessage(num: number): string {
    return `${num} argument${num === 1 ? "" : "s"}`;
}

/**
 * macroのbodyに現れる変数を呼び出した引数で置き換え
 */
function replaceVarInBoby(macro: Macro, funcExpr: FuncAPGMExpr): APGMExpr {
    const exprs = funcExpr.args;
    if (exprs.length !== macro.args.length) {
        throw new ErrorWithLocation(
            `argument length mismatch: "${macro.name}"` +
                ` expect ${argumentsMessage(macro.args.length)} but given ${
                    argumentsMessage(exprs.length)
                }${formatLocationAt(funcExpr.span?.start)}`,
            funcExpr.span?.start,
            funcExpr.span,
        );
    }

    const nameToExpr: Map<string, APGMExpr> = new Map(
        macro.args.map((a, i) => [a.name, exprs[i]]),
    );

    return macro.body.transform((x) => {
        if (x instanceof VarAPGMExpr) {
            const expr = nameToExpr.get(x.name);
            if (expr === undefined) {
                throw new ErrorWithLocation(
                    `scope error: Unknown variable "${x.name}"${
                        formatLocationAt(x.span?.start)
                    }`,
                    x.span?.start,
                    x.span,
                );
            }
            return expr;
        } else {
            return x;
        }
    });
}

export class MacroExpander {
    private readonly macroMap: Map<string, Macro>;
    private count = 0;
    private readonly maxCount: number = 100000;
    public readonly main: Main;
    constructor(main: Main) {
        this.main = main;
        this.macroMap = new Map(main.macros.map((m) => [m.name, m]));
        if (this.macroMap.size < main.macros.length) {
            const ds = dups(main.macros.map((x) => x.name));
            const d = ds[0];
            const span = main.macros.slice().reverse().find((x) => x.name === d)
                ?.span;
            const location = span?.start;
            throw new ErrorWithLocation(
                `There is a macro with the same name: "${d}"` +
                    formatLocationAt(location),
                location,
                span,
            );
        }
    }

    expand(): APGMExpr {
        return this.expandExpr(this.main.seqExpr);
    }

    private expandExpr(expr: APGMExpr): APGMExpr {
        if (this.maxCount < this.count) {
            throw Error("too many macro expansion");
        }
        this.count++;
        return expr.transform((x) => this.expandOnce(x));
    }

    private expandOnce(x: APGMExpr): APGMExpr {
        if (x instanceof FuncAPGMExpr) {
            return this.expandFuncAPGMExpr(x);
        } else {
            return x;
        }
    }

    private expandFuncAPGMExpr(funcExpr: FuncAPGMExpr): APGMExpr {
        const macro = this.macroMap.get(funcExpr.name);
        if (macro !== undefined) {
            const expanded = replaceVarInBoby(macro, funcExpr);
            return this.expandExpr(expanded);
        } else {
            return funcExpr;
        }
    }
}

export function expand(main: Main): APGMExpr {
    return new MacroExpander(main).expand();
}
