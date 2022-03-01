import { APGLExpr } from "./core.ts";

export class BreakAPGLExpr extends APGLExpr {
    private kind: string = "break";
    constructor(public readonly level: number | undefined) {
        super();
        if (level !== undefined && level < 1) {
            throw Error("break level is less than 1");
        }
    }
}
