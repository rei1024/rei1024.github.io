import { APGMExpr, type APGMSourceLocation } from "./core.ts";

/**
 * Function call
 */
export class FuncAPGMExpr extends APGMExpr {
    constructor(
        public readonly name: string,
        public readonly args: APGMExpr[],
        public readonly location: APGMSourceLocation | undefined,
    ) {
        super();
    }

    override transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new FuncAPGMExpr(
                this.name,
                this.args.map((x) => x.transform(f)),
                this.location,
            ),
        );
    }

    override pretty(): string {
        return `${this.name}(${this.args.map((x) => x.pretty()).join(", ")})`;
    }
}
