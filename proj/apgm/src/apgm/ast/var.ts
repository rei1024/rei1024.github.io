import { APGMExpr } from "./core.ts";

export class VarAPGMExpr extends APGMExpr {
    constructor(public readonly name: string) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(this);
    }
}
