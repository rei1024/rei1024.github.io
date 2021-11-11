import { APGMExpr } from "./core.ts";
import { VarAPGMExpr } from "./var.ts";

export class Macro {
    constructor(
        public name: string,
        public args: VarAPGMExpr[],
        public body: APGMExpr,
    ) {
    }
}
