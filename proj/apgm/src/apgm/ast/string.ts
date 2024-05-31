import { APGMExpr, type APGMSourceSpan } from "./core.ts";

export class StringAPGMExpr extends APGMExpr {
    constructor(
        public readonly value: string,
        public readonly span?: APGMSourceSpan | undefined,
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(this);
    }

    pretty() {
        // TODO: escape
        return `"` + this.value + `"`;
    }

    override getSpan(): APGMSourceSpan | undefined {
        return this.span;
    }
}
