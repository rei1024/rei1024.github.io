import {
    APGMExpr,
    FuncAPGMExpr,
    IfAPGMExpr,
    LoopAPGMExpr,
    Main,
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
        throw Error(`argment given to "${funcExpr.name}"`);
    }
    return expr;
}

function transpileNumArgFunc(
    funcExpr: FuncAPGMExpr,
    expr: (_: number) => APGLExpr,
) {
    if (funcExpr.args.length !== 1) {
        throw Error(`number of argment is not 1: "${funcExpr.name}"`);
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof NumberAPGMExpr)) {
        throw Error(`argment is not a number: "${funcExpr.name}"`);
    }
    return expr(arg.value);
}

function transpileStringArgFunc(
    funcExpr: FuncAPGMExpr,
    expr: (_: string) => APGLExpr,
) {
    if (funcExpr.args.length !== 1) {
        throw Error(`number of argment is not 1: "${funcExpr.name}"`);
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof StringAPGMExpr)) {
        throw Error(`argment is not a number: "${funcExpr.name}"`);
    }
    return expr(arg.value);
}

export function transpileExpandedMain(expandedMain: Main): APGLExpr {
    return transpileAPGMExpr(expandedMain.seqExpr);
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
        case "break": {
            if (funcExpr.args.length === 0) {
                return e(new BreakAPGLExpr(undefined));
            } else {
                return n((x) => new BreakAPGLExpr(x));
            }
        }
    }

    throw Error(`Unknown function: "${funcExpr.name}"`);
}

export function transpileAPGMExpr(expr: APGMExpr): APGLExpr {
    const t = transpileAPGMExpr;
    if (expr instanceof FuncAPGMExpr) {
        return transpileFuncAPGMExpr(expr);
    } else if (expr instanceof IfAPGMExpr) {
        if (expr.modifier === "Z") {
            return new IfAPGLExpr(
                t(expr.cond),
                t(expr.thenBody),
                expr.elseBody === undefined
                    ? new SeqAPGLExpr([])
                    : t(expr.elseBody),
            );
        } else {
            return new IfAPGLExpr(
                t(expr.cond),
                expr.elseBody === undefined
                    ? new SeqAPGLExpr([])
                    : t(expr.elseBody),
                t(expr.thenBody),
            );
        }
    } else if (expr instanceof LoopAPGMExpr) {
        return new LoopAPGLExpr(t(expr.body));
    } else if (expr instanceof NumberAPGMExpr) {
        throw Error(`number is not allowed: ${expr.value}`);
    } else if (expr instanceof SeqAPGMExpr) {
        return new SeqAPGLExpr(expr.exprs.map((x) => t(x)));
    } else if (expr instanceof StringAPGMExpr) {
        throw Error(`string is not allowed: ${expr.value}`);
    } else if (expr instanceof VarAPGMExpr) {
        throw Error(`macro variable is not allowed: ${expr.name}`);
    } else if (expr instanceof WhileAPGMExpr) {
        return new WhileAPGLExpr(expr.modifier, t(expr.cond), t(expr.body));
    }

    throw Error("internal error");
}