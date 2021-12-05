import { APGLExpr } from "./core.ts";

export class BreakAPGLExpr extends APGLExpr {
    private kind: string = "break";
    constructor(public readonly level: number | undefined) {
        super();
    }
}
