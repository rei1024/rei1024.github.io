import { APGMExpr } from "./core.ts";

export class StringAPGMExpr extends APGMExpr {
    constructor(public value: string) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(new StringAPGMExpr(this.value));
    }
}
