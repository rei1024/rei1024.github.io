import { APGMExpr } from "./core.ts";

export class IfAPGMExpr extends APGMExpr {
    constructor(
        public readonly modifier: "Z" | "NZ",
        public readonly cond: APGMExpr,
        public readonly thenBody: APGMExpr,
        public readonly elseBody: APGMExpr | undefined,
    ) {
        super();
    }

    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new IfAPGMExpr(
                this.modifier,
                this.cond.transform(f),
                this.thenBody.transform(f),
                this.elseBody !== undefined
                    ? this.elseBody.transform(f)
                    : undefined,
            ),
        );
    }

    pretty(): string {
        return `if_${
                        this.modifier === "Z" ? "z" : "nz"
                    }(${this.cond.pretty()}) ${this.thenBody.pretty()}` +
                    this.elseBody === undefined
            ? ``
            : ` else ${this.elseBody?.pretty()}`;
    }
}
