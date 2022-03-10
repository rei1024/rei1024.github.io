import { APGLExpr } from "./core.ts";

export class BreakAPGLExpr extends APGLExpr {
    private kind: string = "break";
    /**
     * @param level default is 1
     */
    constructor(public readonly level: number | undefined) {
        super();
    }

    override transform(f: (_: APGLExpr) => APGLExpr): APGLExpr {
        return f(this);
    }
}
