import { APGMExpr, type APGMSourceSpan } from "./core.ts";

/**
 * Function call
 */
export class FuncAPGMExpr extends APGMExpr {
    constructor(
        public readonly name: string,
        public readonly args: APGMExpr[],
        public readonly span: APGMSourceSpan | undefined,
    ) {
        super();
    }

    override transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new FuncAPGMExpr(
                this.name,
                this.args.map((x) => x.transform(f)),
                this.span,
            ),
        );
    }

    override pretty(): string {
        return `${this.name}(${this.args.map((x) => x.pretty()).join(", ")})`;
    }
}
