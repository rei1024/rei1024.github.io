import { APGMExpr } from "./core.ts";

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
        return `{${this.exprs.map((x) => x.pretty() + "; ").join("")}}`;
    }
}
