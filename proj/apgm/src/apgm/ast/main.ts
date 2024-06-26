import { SeqAPGMExpr } from "./seq.ts";
import { Macro } from "./macro.ts";
import { Header } from "./header.ts";

export class Main {
    constructor(
        public readonly macros: readonly Macro[],
        public readonly headers: readonly Header[],
        public readonly seqExpr: SeqAPGMExpr,
    ) {
    }

    pretty(): string {
        return [
            this.macros.map((m) => m.pretty()).join("\n"),
            this.headers.map((h) => h.toString()).join("\n"),
            this.seqExpr.prettyInner(),
        ].join("\n");
    }
}
