import { APGMExpr } from "./core.ts";

/**
 * Function call
 */
export class FuncAPGMExpr extends APGMExpr {
    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new FuncAPGMExpr(this.name, this.args.map((x) => x.transform(f))),
        );
    }

    constructor(
        public readonly name: string,
        public readonly args: APGMExpr[],
    ) {
        super();
    }
}
