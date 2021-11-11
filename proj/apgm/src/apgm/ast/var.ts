import { APGMExpr } from "./core.ts";

export class VarAPGMExpr extends APGMExpr {
    constructor(public name: string) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(new VarAPGMExpr(this.name));
    }
}
