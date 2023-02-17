import { APGLExpr } from "./core.ts";

export class ActionAPGLExpr extends APGLExpr {
    /**
     * @param actions `["INC U0", "INC U1", "NOP"]`
     */
    constructor(public readonly actions: string[]) {
        super();
    }

    override transform(f: (expr: APGLExpr) => APGLExpr): APGLExpr {
        return f(this);
    }
}
