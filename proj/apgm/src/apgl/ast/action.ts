import { APGLExpr } from "./core.ts";

export class ActionAPGLExpr extends APGLExpr {
    constructor(public readonly actions: string[]) {
        super();
    }

    override transform(f: (_: APGLExpr) => APGLExpr): APGLExpr {
        return f(this);
    }
}
