import {
    APGMExpr,
    ErrorWithLocation,
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
        throw new ErrorWithLocation(
            `argument given to "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
            funcExpr.location,
        );
    }
    return expr;
}

function transpileNumArgFunc(
    funcExpr: FuncAPGMExpr,
    expr: (_: number) => APGLExpr,
) {
    if (funcExpr.args.length !== 1) {
        throw new ErrorWithLocation(
            `number of arguments is not 1: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
            funcExpr.location,
        );
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof NumberAPGMExpr)) {
        throw new ErrorWithLocation(
            `argument is not a number: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
            funcExpr.location,
        );
    }
    return expr(arg.value);
}

function transpileStringArgFunc(
    funcExpr: FuncAPGMExpr,
    expr: (_: string) => APGLExpr,
) {
    if (funcExpr.args.length !== 1) {
        throw new ErrorWithLocation(
            `number of arguments is not 1: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
            funcExpr.location,
        );
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof StringAPGMExpr)) {
        throw new ErrorWithLocation(
            `argument is not a string: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
            funcExpr.location,
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
    const emptyOrUndefined = emptyArgFuncs.get(funcExpr.name);
    if (emptyOrUndefined !== undefined) {
        return transpileEmptyArgFunc(funcExpr, emptyOrUndefined);
    }

    const numArgOrUndefined = numArgFuncs.get(funcExpr.name);
    if (numArgOrUndefined !== undefined) {
        return transpileNumArgFunc(funcExpr, numArgOrUndefined);
    }

    const strArgOrUndefined = strArgFuncs.get(funcExpr.name);
    if (strArgOrUndefined !== undefined) {
        return transpileStringArgFunc(funcExpr, strArgOrUndefined);
    }

    switch (funcExpr.name) {
        // break
        case "break": {
            if (funcExpr.args.length === 0) {
                return transpileEmptyArgFunc(
                    funcExpr,
                    new BreakAPGLExpr(undefined),
                );
            } else {
                return transpileNumArgFunc(
                    funcExpr,
                    (x) => new BreakAPGLExpr(x),
                );
            }
        }

        // macro

        case "repeat": {
            if (funcExpr.args.length !== 2) {
                throw new ErrorWithLocation(
                    `"repeat" takes two arguments${
                        formatLocationAt(funcExpr.location)
                    }`,
                    funcExpr.location,
                );
            }
            const n = funcExpr.args[0];
            if (!(n instanceof NumberAPGMExpr)) {
                throw new ErrorWithLocation(
                    `first argument of "repeat" must be a number${
                        formatLocationAt(funcExpr.location)
                    }`,
                    funcExpr.location,
                );
            }
            const expr = funcExpr.args[1];
            const apgl = transpileAPGMExpr(expr);
            return new SeqAPGLExpr(Array(n.value).fill(0).map(() => apgl));
        }
    }

    throw new ErrorWithLocation(
        `Unknown function: "${funcExpr.name}"${
            formatLocationAt(funcExpr.location)
        }`,
        funcExpr.location,
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
        throw new ErrorWithLocation(
            `number is not allowed: ${e.value}${formatLocationAt(e.location)}`,
            e.location,
        );
    } else if (e instanceof SeqAPGMExpr) {
        return new SeqAPGLExpr(e.exprs.map((x) => t(x)));
    } else if (e instanceof StringAPGMExpr) {
        throw Error(`string is not allowed: ${e.pretty()}`);
    } else if (e instanceof VarAPGMExpr) {
        throw new ErrorWithLocation(
            `macro variable is not allowed: variable "${e.name}"${
                formatLocationAt(e.location)
            }`,
            e.location,
        );
    } else if (e instanceof WhileAPGMExpr) {
        return new WhileAPGLExpr(e.modifier, t(e.cond), t(e.body));
    }

    throw Error("internal error");
}
