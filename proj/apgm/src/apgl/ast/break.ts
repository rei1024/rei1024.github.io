import { APGMSourceSpan } from "../../apgm/ast/core.ts";
import { APGLExpr } from "./core.ts";

export class BreakAPGLExpr extends APGLExpr {
    private kind = "break";
    /**
     * @param level default is 1
     */
    constructor(
        public readonly level: number | undefined,
        public readonly span?: APGMSourceSpan,
    ) {
        super();
    }

    override transform(f: (_: APGLExpr) => APGLExpr): APGLExpr {
        return f(this);
    }
}
