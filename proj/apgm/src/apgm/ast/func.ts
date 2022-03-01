import { APGMExpr, type APGMSourceLocation } from "./core.ts";

/**
 * Function call
 */
export class FuncAPGMExpr extends APGMExpr {
    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new FuncAPGMExpr(
                this.name,
                this.args.map((x) => x.transform(f)),
                this.location,
            ),
        );
    }

    constructor(
        public readonly name: string,
        public readonly args: APGMExpr[],
        public readonly location: APGMSourceLocation | undefined,
    ) {
        super();
    }
}
