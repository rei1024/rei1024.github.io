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
export { formatAPGsembly } from "../deps.ts";

function logged<T extends unknown[], S>(
    logMessage: string | undefined = undefined,
    f: (...args: T) => S,
    ...args: T
): S {
    logMessage && console.log(logMessage + " Start", performance.now());
    const y = f(...args);
    logMessage && console.log(logMessage + " End", performance.now());
    // logMessage && console.log(logMessage, JSON.stringify(y, null, "  "));
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
        log ? "optimize apgl seq" : undefined,
        optimizeSeq,
        apgl,
    );
    const optimizedAPGL = logged(
        log ? "optimize apgl action" : undefined,
        optimize,
        seqOptimizedAPGL,
    );

    return optimizedAPGL;
}

export type IntegrationOptions = TranspilerOptions & { log?: boolean };

export function integration(
    str: string,
    options: IntegrationOptions = {},
): string[] {
    const log = options.log ?? false;
    const apgm = logged(log ? "apgm parse" : undefined, parseMain, str);

    try {
        const expanded = logged(
            log ? "apgm macro expand" : undefined,
            expand,
            apgm,
        );
        const apgl = logged(
            log ? "apgm to apgl" : undefined,
            transpileAPGMExpr,
            expanded,
        );
        const optimizedAPGL = optimizeAPGL(apgl, {
            log,
            noOptimize: options.noOptimize,
        });
        const apgs = logged(
            log ? "apgl to apgsembly" : undefined,
            transpileAPGL,
            optimizedAPGL,
            options,
        );

        const comment = [
            "# State    Input    Next state    Actions",
            "# ---------------------------------------",
        ];
        const head = apgm.headers.map((x) => x.toString());
        return head.concat(comment, apgs);
    } catch (error) {
        if (error instanceof ErrorWithSpan && error.apgmSpan) {
            throw new ErrorWithSpan(
                [
                    error.message,
                    ...createErrorLines(
                        str,
                        error.apgmSpan.start,
                        error.apgmSpan.end,
                    ),
                ]
                    .join("\n"),
                error.apgmSpan,
                { cause: error.cause },
            );
        }

        throw error;
    }
}
