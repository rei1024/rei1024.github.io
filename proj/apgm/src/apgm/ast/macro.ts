import { APGMExpr, type APGMSourceLocation } from "./core.ts";
import { VarAPGMExpr } from "./var.ts";

/**
 * Macro declaration
 */
export class Macro {
    /**
     * @param name include !
     */
    constructor(
        public readonly name: string,
        public readonly args: VarAPGMExpr[],
        public readonly body: APGMExpr,
        public readonly location: APGMSourceLocation | undefined,
    ) {
    }

    pretty(): string {
        return `macro ${this.name}(${
            this.args.map((x) => x.pretty()).join(", ")
        }) ${this.body.pretty()}`;
    }
}
