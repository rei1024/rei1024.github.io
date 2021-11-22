import { tryParseMain } from "../apgm/parser.ts";
import { transpileAPGMExpr } from "../apgm_to_apgl/transpiler.ts";
import { transpileAPGL } from "../apgl_to_apgsembly/mod.ts";
import { expand } from "../apgm/macro/expander.ts";

export function integration(str: string, log: boolean = false): string[] {
    const apgm = tryParseMain(str);
    if (log) {
        console.log("apgm", JSON.stringify(apgm, null, "  "));
    }

    const expanded = expand(apgm);
    if (log) {
        console.log("apgm expaned", JSON.stringify(expanded, null, "  "));
    }

    const apgl = transpileAPGMExpr(expanded);
    if (log) {
        console.log("apgl", JSON.stringify(apgl, null, "  "));
    }

    const apgs = transpileAPGL(apgl);
    const comment = [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
    ];
    const head = apgm.headers.map((x) => x.toString());
    return head.concat(comment, apgs);
}
