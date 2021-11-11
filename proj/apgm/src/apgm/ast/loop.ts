import { APGMExpr } from "./core.ts";

export class LoopAPGMExpr extends APGMExpr {
    constructor(
        public body: APGMExpr,
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(new LoopAPGMExpr(this.body.transform(f)));
    }
}