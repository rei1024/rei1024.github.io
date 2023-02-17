import { APGLExpr } from "./core.ts";

/**
 * if expression
 */
export class IfAPGLExpr extends APGLExpr {
    constructor(
        public readonly cond: APGLExpr,
        /** Z */
        public readonly thenBody: APGLExpr,
        /** NZ */
        public readonly elseBody: APGLExpr,
    ) {
        super();
    }

    override transform(f: (expr: APGLExpr) => APGLExpr): APGLExpr {
        return f(
            new IfAPGLExpr(
                this.cond.transform(f),
                this.thenBody.transform(f),
                this.elseBody.transform(f),
            ),
        );
    }
}
