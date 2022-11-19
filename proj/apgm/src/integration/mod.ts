import { createErrorLines, parseMain } from "../apgm/parser/mod.ts";
import {
    emptyArgFuncs,
    numArgFuncs,
    strArgFuncs,
    transpileAPGMExpr,
} from "../apgm_to_apgl/transpiler.ts";

// for editor
// deno-fmt-ignore
export { emptyArgFuncs, numArgFuncs, strArgFuncs }

export { completionParser } from "../apgm/parser/completion_parser.ts";

import {
    transpileAPGL,
    type TranspilerOptions,
} from "../apgl_to_apgsembly/mod.ts";
import { expand } from "../apgm/macro/expander.ts";
import { optimize } from "../apgl/action_optimizer/mod.ts";
import { optimizeSeq } from "../apgl/seq_optimizer/mod.ts";
import { APGLExpr } from "../apgl/ast/core.ts";
import { ErrorWithSpan } from "../apgm/ast/core.ts";

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

function optimizeAPGL(
    apgl: APGLExpr,
    { log, noOptimize }: { log: boolean; noOptimize: boolean | undefined },
): APGLExpr {
    if (noOptimize === true) {
        return apgl;
    }

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

    return optimizedAPGL;
}

export function integration(
    str: string,
    options: TranspilerOptions = {},
    log = false,
): string[] {
    const apgm = logged(parseMain, str, log ? "apgm" : undefined);

    try {
        const expanded = logged(expand, apgm, log ? "apgm expaned" : undefined);
        const apgl = logged(
            transpileAPGMExpr,
            expanded,
            log ? "apgl" : undefined,
        );
        const optimizedAPGL = optimizeAPGL(apgl, {
            log,
            noOptimize: options.noOptimize,
        });
        const apgs = transpileAPGL(optimizedAPGL, options);

        const comment = [
            "# State    Input    Next state    Actions",
            "# ---------------------------------------",
        ];
        const head = apgm.headers.map((x) => x.toString());
        return head.concat(comment, apgs);
    } catch (error) {
        if (error instanceof ErrorWithSpan && error.apgmSpan) {
            throw new ErrorWithSpan(
                [error.message, ...createErrorLines(error.apgmSpan.start, str)]
                    .join("\n"),
                error.apgmSpan,
                { cause: error.cause },
            );
        }

        throw error;
    }
}
