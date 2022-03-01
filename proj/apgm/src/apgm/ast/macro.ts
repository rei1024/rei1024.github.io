import { APGMExpr, type APGMSourceLocation } from "./core.ts";
import { VarAPGMExpr } from "./var.ts";

/**
 * Macro declaration
 */
export class Macro {
    constructor(
        public readonly name: string,
        public readonly args: VarAPGMExpr[],
        public readonly body: APGMExpr,
        public readonly location: APGMSourceLocation | undefined,
    ) {
    }
}
