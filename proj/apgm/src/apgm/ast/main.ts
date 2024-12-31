import { SeqAPGMExpr } from "./seq.ts";
import { Macro } from "./macro.ts";
import { Header } from "./header.ts";
import { FuncAPGMExpr } from "./mod.ts";
import { A } from "../../apgl/actions.ts";
import {
    emptyArgFuncs,
    numArgFuncs,
    strArgFuncs,
} from "../../apgm_to_apgl/transpiler.ts";

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

    describeFunc(func: FuncAPGMExpr): string | undefined {
        if (!(func instanceof FuncAPGMExpr)) {
            return undefined;
        }
        const emptyFunc = emptyArgFuncs.get(func.name);
        if (emptyFunc != null) {
            return emptyFunc.desc;
        }

        const numArgFunc = numArgFuncs.get(func.name);
        if (numArgFunc != null) {
            return numArgFunc.desc;
        }

        const strArgFunc = strArgFuncs.get(func.name);
        if (strArgFunc != null) {
            return strArgFunc.desc;
        }

        if (func.name.endsWith("!")) {
            const macro = this.macros.find((x) => func.name === x.name);
            if (macro) {
                return macro.prettyHead();
            }
        }

        return undefined;
    }
}
