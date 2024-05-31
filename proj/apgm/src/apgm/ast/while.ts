import { APGMExpr, APGMSourceSpan } from "./core.ts";

export class WhileAPGMExpr extends APGMExpr {
    constructor(
        public readonly modifier: "Z" | "NZ",
        public readonly cond: APGMExpr,
        public readonly body: APGMExpr,
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new WhileAPGMExpr(
                this.modifier,
                this.cond.transform(f),
                this.body.transform(f),
            ),
        );
    }

    pretty(): string {
        return `while_${
            this.modifier === "Z" ? "z" : "nz"
        }(${this.cond.pretty()}) ${this.body.pretty()}`;
    }

    override getSpan(): APGMSourceSpan | undefined {
        return undefined;
    }
}
