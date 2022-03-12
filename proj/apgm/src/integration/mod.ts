import { parseMain } from "../apgm/parser/mod.ts";
import { transpileAPGMExpr } from "../apgm_to_apgl/transpiler.ts";
import {
    transpileAPGL,
    type TranspilerOptions,
} from "../apgl_to_apgsembly/mod.ts";
import { expand } from "../apgm/macro/expander.ts";
import { optimize } from "../apgl/action_optimizer/mod.ts";
import { optimizeSeq } from "../apgl/seq_optimizer/mod.ts";

function logged<T, S>(
    f: (_: T) => S,
    x: T,
    logMessage: string | undefined = undefined,
): S {
    const y = f(x);
    if (logMessage !== undefined) {
        console.log(logMessage, JSON.stringify(y, null, "  "));
    }

    return y;
}

export function integration(
    str: string,
    options: TranspilerOptions = {},
    log: boolean = false,
): string[] {
    const apgm = logged(parseMain, str, log ? "apgm" : undefined);
    const expanded = logged(expand, apgm, log ? "apgm expaned" : undefined);
    const apgl = logged(transpileAPGMExpr, expanded, log ? "apgl" : undefined);
    const seqOptimizedAPGL = logged(
        optimizeSeq,
        apgl,
        log ? "optimized apgl seq" : undefined,
    );
    const optimizedAPGL = logged(
        optimize,
        seqOptimizedAPGL,
        log ? "optimized apgl action" : undefined,
    );
    const apgs = transpileAPGL(optimizedAPGL, options);

    const comment = [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------",
    ];
    const head = apgm.headers.map((x) => x.toString());
    return head.concat(comment, apgs);
}
