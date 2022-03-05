import { APGLExpr } from "./core.ts";

export class IfAPGLExpr extends APGLExpr {
    constructor(
        public readonly cond: APGLExpr,
        public readonly thenBody: APGLExpr, // Z
        public readonly elseBody: APGLExpr, // NZ
    ) {
        super();
    }

    override transform(f: (_: APGLExpr) => APGLExpr): APGLExpr {
        return f(
            new IfAPGLExpr(
                this.cond.transform(f),
                this.thenBody.transform(f),
                this.elseBody.transform(f),
            ),
        );
    }
}
