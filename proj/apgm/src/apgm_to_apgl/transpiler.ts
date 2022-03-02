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
            `number of argument is not 1: "${funcExpr.name}"${
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
            `number of argument is not 1: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
        );
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof StringAPGMExpr)) {
        throw Error(
            `argument is not a number: "${funcExpr.name}"${
                formatLocationAt(funcExpr.location)
            }`,
        );
    }
    return expr(arg.value);
}

export function transpileFuncAPGMExpr(funcExpr: FuncAPGMExpr): APGLExpr {
    const e = (a: APGLExpr) => transpileEmptyArgFunc(funcExpr, a);
    const n = (a: (_: number) => APGLExpr) => transpileNumArgFunc(funcExpr, a);
    const s = (a: (_: string) => APGLExpr) =>
        transpileStringArgFunc(funcExpr, a);
    switch (funcExpr.name) {
        // U
        case "inc_u":
            return n((x) => A.incU(x));
        case "tdec_u":
            return n((x) => A.tdecU(x));
        // B
        case "inc_b":
            return n((x) => A.incB(x));
        case "tdec_b":
            return n((x) => A.tdecB(x));
        case "read_b":
            return n((x) => A.readB(x));
        case "set_b":
            return n((x) => A.setB(x));
        // B2D
        case "inc_b2dx":
            return e(A.incB2DX());
        case "inc_b2dy":
            return e(A.incB2DY());
        case "tdec_b2dx":
            return e(A.tdecB2DX());
        case "tdec_b2dy":
            return e(A.tdecB2DY());
        case "read_b2d":
            return e(A.readB2D());
        case "set_b2d":
            return e(A.setB2D());
        // ADD
        case "add_a1":
            return e(A.addA1());
        case "add_b0":
            return e(A.addB0());
        case "add_b1":
            return e(A.addB1());
        // SUB
        case "sub_a1":
            return e(A.subA1());
        case "sub_b0":
            return e(A.subB0());
        case "sub_b1":
            return e(A.subB1());
        // MUL
        case "mul_0":
            return e(A.mul0());
        case "mul_1":
            return e(A.mul1());
        // NOP
        case "nop":
            return e(A.nop());
        // HALT_OUT
        case "halt_out":
            return e(A.haltOUT());
        // OUTPUT
        case "output":
            return s((x) => A.output(x));
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
        throw Error(`macro variable is not allowed: ${e.name}`);
    } else if (e instanceof WhileAPGMExpr) {
        return new WhileAPGLExpr(e.modifier, t(e.cond), t(e.body));
    }

    throw Error("internal error");
}
