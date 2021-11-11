import { APGMExpr } from "./core.ts";

export class FuncAPGMExpr extends APGMExpr {
    transform(f: (_: APGMExpr) => APGMExpr): APGMExpr {
        return f(
            new FuncAPGMExpr(this.name, this.args.map((x) => x.transform(f))),
        );
    }

    constructor(public name: string, public args: APGMExpr[]) {
        super();
    }
}
