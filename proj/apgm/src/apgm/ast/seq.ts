import { APGMExpr } from "./core.ts";
import { IfAPGMExpr } from "./if.ts";
import { LoopAPGMExpr } from "./loop.ts";
import { WhileAPGMExpr } from "./mod.ts";

export class SeqAPGMExpr extends APGMExpr {
    constructor(
        public readonly exprs: APGMExpr[],
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(new SeqAPGMExpr(this.exprs.map((x) => x.transform(f))));
    }

    pretty(): string {
        return `{${this.prettyInner()}}`;
    }

    /**
     * 山括弧なし
     */
    prettyInner(): string {
        return this.exprs.map((x) => {
            if (x instanceof IfAPGMExpr) {
                return x.pretty();
            } else if (x instanceof LoopAPGMExpr) {
                return x.pretty();
            } else if (x instanceof WhileAPGMExpr) {
                return x.pretty();
            } else {
                return x.pretty() + ";";
            }
        }).join("\n");
    }
}
