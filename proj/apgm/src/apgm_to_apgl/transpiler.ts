import {
    APGMExpr,
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
        throw Error(
            `argument given to "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
        );
    }
    return expr;
}

function transpileNumArgFunc(
    funcExpr: FuncAPGMExpr,
    expr: (_: number) => APGLExpr,
) {
    if (funcExpr.args.length !== 1) {
        throw Error(
            `number of arguments is not 1: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
        );
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof NumberAPGMExpr)) {
        throw Error(
            `argument is not a number: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
        );
    }
    return expr(arg.value);
}

function transpileStringArgFunc(
    funcExpr: FuncAPGMExpr,
    expr: (_: string) => APGLExpr,
) {
    if (funcExpr.args.length !== 1) {
        throw Error(
            `number of arguments is not 1: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
        );
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof StringAPGMExpr)) {
        throw Error(
            `argument is not a string: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
        );
    }
    return expr(arg.value);
}

export const emptyArgFuncs: Map<string, APGLExpr> = new Map([
    ["nop", A.nop()],
    // B2D
    ["inc_b2dx", A.incB2DX()],
    ["inc_b2dy", A.incB2DY()],
    ["tdec_b2dx", A.tdecB2DX()],
    ["tdec_b2dy", A.tdecB2DY()],
    ["read_b2d", A.readB2D()],
    ["set_b2d", A.setB2D()],
    // ADD
    ["add_a1", A.addA1()],
    ["add_b0", A.addB0()],
    ["add_b1", A.addB1()],
    // SUB
    ["sub_a1", A.subA1()],
    ["sub_b0", A.subB0()],
    ["sub_b1", A.subB1()],
    // MUL
    ["mul_0", A.mul0()],
    ["mul_1", A.mul1()],
    // HALT_OUT
    ["halt_out", A.haltOUT()],
]);

export const numArgFuncs: Map<string, (_: number) => APGLExpr> = new Map([
    // U
    ["inc_u", A.incU],
    ["tdec_u", A.tdecU],
    // B
    ["inc_b", A.incB],
    ["tdec_b", A.tdecB],
    ["read_b", A.readB],
    ["set_b", A.setB],
]);

export const strArgFuncs: Map<string, (_: string) => APGLExpr> = new Map([
    // OUTPUT
    ["output", A.output],
]);

function transpileFuncAPGMExpr(funcExpr: FuncAPGMExpr): APGLExpr {
    const e = (a: APGLExpr) => transpileEmptyArgFunc(funcExpr, a);
    const n = (a: (_: number) => APGLExpr) => transpileNumArgFunc(funcExpr, a);
    const s = (a: (_: string) => APGLExpr) =>
        transpileStringArgFunc(funcExpr, a);

    const emptyOrUndefined = emptyArgFuncs.get(funcExpr.name);
    if (emptyOrUndefined !== undefined) {
        return e(emptyOrUndefined);
    }

    const numArgOrUndefined = numArgFuncs.get(funcExpr.name);
    if (numArgOrUndefined !== undefined) {
        return n(numArgOrUndefined);
    }

    const strArgOrUndefined = strArgFuncs.get(funcExpr.name);
    if (strArgOrUndefined !== undefined) {
        return s(strArgOrUndefined);
    }

    switch (funcExpr.name) {
        // break
        case "break": {
            if (funcExpr.args.length === 0) {
                return e(new BreakAPGLExpr(undefined));
            } else {
                return n((x) => new BreakAPGLExpr(x));
            }
        }
        // macro
        case "repeat": {
            if (funcExpr.args.length !== 2) {
                throw Error(
                    `"repeat" takes two arguments${
                        formatLocationAt(funcExpr.location)
                    }`,
                );
            }
            const n = funcExpr.args[0];
            if (!(n instanceof NumberAPGMExpr)) {
                throw Error(
                    `first argument of "repeat" must be a number${
                        formatLocationAt(funcExpr.location)
                    }`,
                );
            }
            const expr = funcExpr.args[1];
            const apgl = transpileAPGMExpr(expr);
            return new SeqAPGLExpr(Array(n.value).fill(0).map(() => apgl));
        }
    }

    throw Error(
        `Unknown function: "${funcExpr.name}"${
            formatLocationAt(funcExpr.location)
        }`,
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
        throw Error(`number is not allowed: ${e.value}`);
    } else if (e instanceof SeqAPGMExpr) {
        return new SeqAPGLExpr(e.exprs.map((x) => t(x)));
    } else if (e instanceof StringAPGMExpr) {
        throw Error(`string is not allowed: ${e.value}`);
    } else if (e instanceof VarAPGMExpr) {
        throw Error(
            `macro variable is not allowed: variable "${e.name}"${
                formatLocationAt(e.location)
            }`,
        );
    } else if (e instanceof WhileAPGMExpr) {
        return new WhileAPGLExpr(e.modifier, t(e.cond), t(e.body));
    }

    throw Error("internal error");
}
