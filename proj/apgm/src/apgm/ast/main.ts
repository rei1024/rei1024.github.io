import { SeqAPGMExpr } from "./seq.ts";
import { Macro } from "./macro.ts";
import { Header } from "./header.ts";

export class Main {
    constructor(
        public headers: Header[],
        public macros: Macro[],
        public seqExpr: SeqAPGMExpr,
    ) {
    }
}
