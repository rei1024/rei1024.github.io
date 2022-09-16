import { APGMExpr, type APGMSourceSpan } from "./core.ts";

export class VarAPGMExpr extends APGMExpr {
    constructor(
        public readonly name: string,
        public readonly span: APGMSourceSpan | undefined,
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
