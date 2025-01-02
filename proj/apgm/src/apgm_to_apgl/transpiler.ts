import {
    APGMExpr,
    ErrorWithSpan,
    formatLocationAt,
    FuncAPGMExpr,
    IfAPGMExpr,
    LoopAPGMExpr,
    NumberAPGMExpr,
    SeqAPGMExpr,
    StringAPGMExpr,
    VarAPGMExpr,
    WhileAPGMExpr,
} from "../apgm/ast/mod.ts";

import {
    APGLExpr,
    BreakAPGLExpr,
    IfAPGLExpr,
    LoopAPGLExpr,
    SeqAPGLExpr,
    WhileAPGLExpr,
} from "../apgl/ast/mod.ts";
import { A } from "../apgl/actions.ts";

function transpileEmptyArgFunc(funcExpr: FuncAPGMExpr, expr: APGLExpr) {
    if (funcExpr.args.length !== 0) {
        throw new ErrorWithSpan(
            `"${funcExpr.name}" expects empty arguments${
                formatLocationAt(funcExpr.span?.start)
            }`,
            funcExpr.span,
        );
    }
    return expr;
}

function transpileNumArgFunc(
    funcExpr: FuncAPGMExpr,
    expr: (_: number) => APGLExpr,
) {
    if (funcExpr.args.length !== 1) {
        throw new ErrorWithSpan(
            `number of arguments is not 1:"${funcExpr.name}"${
                formatLocationAt(funcExpr.span?.start)
            }`,
            funcExpr.span,
        );
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof NumberAPGMExpr)) {
        throw new ErrorWithSpan(
            `argument is not a number: "${funcExpr.name}"${
                formatLocationAt(funcExpr.span?.start)
            }`,
            arg.getSpan() ?? funcExpr.span,
        );
    }
    return expr(arg.value);
}

function transpileStringArgFunc(
    funcExpr: FuncAPGMExpr,
    expr: (_: string) => APGLExpr,
) {
    if (funcExpr.args.length !== 1) {
        throw new ErrorWithSpan(
            `number of arguments is not 1: "${funcExpr.name}"${
                formatLocationAt(funcExpr.span?.start)
            }`,
            funcExpr.span,
        );
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof StringAPGMExpr)) {
        throw new ErrorWithSpan(
            `argument is not a string: "${funcExpr.name}"${
                formatLocationAt(funcExpr.span?.start)
            }`,
            arg.getSpan() ?? funcExpr.span,
        );
    }
    return expr(arg.value);
}

// desription from  "Conway's Game of Life: Mathematics and Construction" (2022)

export const emptyArgFuncs: Map<string, { expr: APGLExpr; desc: string }> =
    new Map([
        // NOP
        ["nop", { expr: A.nop(), desc: "returns Z and does nothing else" }],

        // B2D
        ["inc_b2dx", {
            expr: A.incB2DX(),
            desc: "increases the X position of the read head",
        }],
        ["inc_b2dy", {
            expr: A.incB2DY(),
            desc: "increases the Y position of the read head",
        }],
        ["tdec_b2dx", {
            expr: A.tdecB2DX(),
            desc:
                "returns Z if X read head is at least significant bit and NZ otherwise, and then decreases X position by 1 if NZ",
        }],
        ["tdec_b2dy", {
            expr: A.tdecB2DY(),
            desc:
                "returns Z if Y read head is at least significant bit and NZ otherwise, and then decreases Y position by 1 if NZ",
        }],
        ["read_b2d", {
            expr: A.readB2D(),
            desc:
                "returns the bit (Z = 0 or NZ = 1) at the read head, and then sets it equal to 0",
        }],
        ["set_b2d", {
            expr: A.setB2D(),
            desc:
                "set the bit at the read head to 1, breaks if that bit already equals 1",
        }],

        // ADD
        ["add_a1", { expr: A.addA1(), desc: "binary adder" }],
        ["add_b0", { expr: A.addB0(), desc: "binary adder" }],
        ["add_b1", { expr: A.addB1(), desc: "binary adder" }],

        // SUB
        ["sub_a1", { expr: A.subA1(), desc: "binary subtractor" }],
        ["sub_b0", { expr: A.subB0(), desc: "binary subtractor" }],
        ["sub_b1", { expr: A.subB1(), desc: "binary subtractor" }],

        // MUL
        ["mul_0", { expr: A.mul0(), desc: "binary multiplier" }],
        ["mul_1", { expr: A.mul1(), desc: "binary multiplier" }],

        // HALT_OUT
        ["halt_out", {
            expr: A.haltOUT(),
            desc: "halts the entire computation and emits a glider",
        }],

        // HALT
        ["halt", {
            expr: A.halt(),
            desc: "halts the entire computation",
        }],
    ]);

export const numArgFuncs: Map<
    string,
    { expr: (_: number) => APGLExpr; desc: string }
> = new Map([
    // U
    ["inc_u", {
        expr: A.incU,
        desc: "increases the value of the register by 1",
    }],
    ["tdec_u", {
        expr: A.tdecU,
        desc:
            "returns Z if Un = 0 and NZ otherwise, and then decreases the value of the register by 1 if NZ",
    }],

    // B
    ["inc_b", {
        expr: A.incB,
        desc: "increases the position of the read head",
    }],
    ["tdec_b", {
        expr: A.tdecB,
        desc:
            "returns Z if read head is at least significant bit and NZ otherwise, and then decreases position by 1 if NZ",
    }],
    ["read_b", {
        expr: A.readB,
        desc:
            "returns the bit (Z = 0 or NZ = 1) at the read head, and then sets it equal to 0",
    }],
    ["set_b", {
        expr: A.setB,
        desc:
            "set the bit at the read head to 1, breaks if that bit already equals 1",
    }],
]);

export const strArgFuncs: Map<
    string,
    { expr: (_: string) => APGLExpr; desc: string }
> = new Map([
    // OUTPUT
    ["output", {
        expr: A.output,
        desc:
            "prints x in a font made up of blocks, x must be one of 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, or.",
    }],
]);

function transpileFuncAPGMExpr(funcExpr: FuncAPGMExpr): APGLExpr {
    const emptyOrUndefined = emptyArgFuncs.get(funcExpr.name);
    if (emptyOrUndefined !== undefined) {
        return transpileEmptyArgFunc(funcExpr, emptyOrUndefined.expr);
    }

    const numArgOrUndefined = numArgFuncs.get(funcExpr.name);
    if (numArgOrUndefined !== undefined) {
        return transpileNumArgFunc(funcExpr, numArgOrUndefined.expr);
    }

    const strArgOrUndefined = strArgFuncs.get(funcExpr.name);
    if (strArgOrUndefined !== undefined) {
        return transpileStringArgFunc(funcExpr, strArgOrUndefined.expr);
    }

    switch (funcExpr.name) {
        // break
        case "break": {
            if (funcExpr.args.length === 0) {
                return new BreakAPGLExpr(undefined, funcExpr.span);
            } else {
                return transpileNumArgFunc(
                    funcExpr,
                    (x) => new BreakAPGLExpr(x, funcExpr.span),
                );
            }
        }

        // macro

        case "repeat": {
            if (funcExpr.args.length !== 2) {
                throw new ErrorWithSpan(
                    `"repeat" takes two arguments${
                        formatLocationAt(funcExpr.span?.start)
                    }`,
                    funcExpr.span,
                );
            }
            const n = funcExpr.args[0];
            if (!(n instanceof NumberAPGMExpr)) {
                throw new ErrorWithSpan(
                    `first argument of "repeat" must be a number${
                        formatLocationAt(funcExpr.span?.start)
                    }`,
                    n.getSpan() ?? funcExpr.span,
                );
            }

            const expr = funcExpr.args[1];
            if (expr === undefined) {
                throw new Error("internal error");
            }
            const apgl = transpileAPGMExpr(expr);
            return new SeqAPGLExpr(Array(n.value).fill(0).map(() => apgl));
        }
    }

    throw new ErrorWithSpan(
        `Unknown ${
            funcExpr.name.endsWith("!") ? "macro" : "function"
        }: "${funcExpr.name}"${formatLocationAt(funcExpr.span?.start)}`,
        funcExpr.span,
    );
}

export function transpileAPGMExpr(e: APGMExpr): APGLExpr {
    const t = transpileAPGMExpr;
    if (e instanceof FuncAPGMExpr) {
        return transpileFuncAPGMExpr(e);
    } else if (e instanceof IfAPGMExpr) {
        if (e.modifier === "Z") {
            return new IfAPGLExpr(
                t(e.cond),
                t(e.thenBody),
                e.elseBody === undefined ? new SeqAPGLExpr([]) : t(e.elseBody),
            );
        } else {
            return new IfAPGLExpr(
                t(e.cond),
                e.elseBody === undefined ? new SeqAPGLExpr([]) : t(e.elseBody),
                t(e.thenBody),
            );
        }
    } else if (e instanceof LoopAPGMExpr) {
        return new LoopAPGLExpr(t(e.body));
    } else if (e instanceof NumberAPGMExpr) {
        throw new ErrorWithSpan(
            `number is not allowed: ${e.raw ?? e.value}${
                formatLocationAt(e.span?.start)
            }`,
            e.span,
        );
    } else if (e instanceof SeqAPGMExpr) {
        return new SeqAPGLExpr(e.exprs.map((x) => t(x)));
    } else if (e instanceof StringAPGMExpr) {
        throw new ErrorWithSpan(
            `string is not allowed: ${e.pretty()}${
                formatLocationAt(e.span?.start)
            }`,
            e.span,
        );
    } else if (e instanceof WhileAPGMExpr) {
        return new WhileAPGLExpr(e.modifier, t(e.cond), t(e.body));
    } else if (e instanceof VarAPGMExpr) {
        throw new ErrorWithSpan(
            `macro variable is not allowed: variable "${e.name}"${
                formatLocationAt(e.span?.start)
            }`,
            e.span,
        );
    }

    throw Error("internal error");
}
