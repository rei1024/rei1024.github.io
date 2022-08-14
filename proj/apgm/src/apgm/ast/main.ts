import { SeqAPGMExpr } from "./seq.ts";
import { Macro } from "./macro.ts";
import { Header } from "./header.ts";

export class Main {
    constructor(
        public readonly macros: Macro[],
        public readonly headers: Header[],
        public readonly seqExpr: SeqAPGMExpr,
    ) {
    }

    pretty() {
        return this.macros.map((m) => m.pretty()).join("\n") + "\n" +
            this.headers.map((h) => h.toString()).join("\n") + "\n" +
            this.seqExpr.prettyInner();
    }
}
