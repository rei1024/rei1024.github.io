import { APGMExpr } from "./core.ts";

export class StringAPGMExpr extends APGMExpr {
    constructor(public readonly value: string) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(this);
    }

    pretty() {
        // TODO: escape
        return this.value;
    }
}
