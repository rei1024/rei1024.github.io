import { APGLExpr } from "./core.ts";

export class SeqAPGLExpr extends APGLExpr {
    constructor(public readonly exprs: APGLExpr[]) {
        super();
    }
}
