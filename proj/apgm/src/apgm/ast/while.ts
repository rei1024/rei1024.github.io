import { APGMExpr } from "./core.ts";

export class WhileAPGMExpr extends APGMExpr {
    constructor(
        public modifier: "Z" | "NZ",
        public cond: APGMExpr,
        public body: APGMExpr,
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new WhileAPGMExpr(
                this.modifier,
                this.cond.transform(f),
                this.body.transform(f),
            ),
        );
    }
}
