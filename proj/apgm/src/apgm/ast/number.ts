import { APGMExpr } from "./core.ts";

export class NumberAPGMExpr extends APGMExpr {
    constructor(public readonly value: number) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(this);
    }
}
