import { APGMExpr } from "./core.ts";

export class IfAPGMExpr extends APGMExpr {
    constructor(
        public modifier: "Z" | "NZ",
        public cond: APGMExpr,
        public thenBody: APGMExpr,
        public elseBody: APGMExpr | undefined,
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new IfAPGMExpr(
                this.modifier,
                this.cond.transform(f),
                this.thenBody.transform(f),
                this.elseBody !== undefined
                    ? this.elseBody.transform(f)
                    : undefined,
            ),
        );
    }
}
