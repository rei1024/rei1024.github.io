import { APGMExpr, type APGMSourceLocation } from "./core.ts";

export class StringAPGMExpr extends APGMExpr {
    constructor(
        public readonly value: string,
        public readonly location?: APGMSourceLocation | undefined,
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
}
