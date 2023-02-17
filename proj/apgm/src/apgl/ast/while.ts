import { APGLExpr } from "./core.ts";

export class WhileAPGLExpr extends APGLExpr {
    constructor(
        public readonly modifier: "Z" | "NZ",
        public readonly cond: APGLExpr,
        public readonly body: APGLExpr,
    ) {
        super();
    }

    override transform(f: (expr: APGLExpr) => APGLExpr): APGLExpr {
        return f(
            new WhileAPGLExpr(
                this.modifier,
                this.cond.transform(f),
                this.body.transform(f),
            ),
        );
    }
}
