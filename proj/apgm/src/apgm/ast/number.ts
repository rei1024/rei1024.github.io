import { APGMExpr, type APGMSourceLocation } from "./core.ts";

export class NumberAPGMExpr extends APGMExpr {
    constructor(
        public readonly value: number,
        public readonly location?: APGMSourceLocation | undefined,
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(this);
    }

    pretty() {
        return this.value.toString();
    }
}
