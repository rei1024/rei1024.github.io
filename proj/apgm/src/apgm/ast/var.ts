import { APGMExpr, type APGMSourceLocation } from "./core.ts";

export class VarAPGMExpr extends APGMExpr {
    constructor(
        public readonly name: string,
        public readonly location: APGMSourceLocation | undefined,
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(this);
    }

    pretty(): string {
        return this.name;
    }
}
