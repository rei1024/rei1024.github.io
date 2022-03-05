import {
    ActionAPGLExpr,
    APGLExpr,
    BreakAPGLExpr,
    IfAPGLExpr,
    LoopAPGLExpr,
    SeqAPGLExpr,
    WhileAPGLExpr,
} from "../apgl/ast/mod.ts";

function isEmptyExpr(expr: APGLExpr) {
    return expr instanceof SeqAPGLExpr && expr.exprs.length === 0;
}

export interface TranspilerOptions {
    prefix?: string;
}

class Context {
    constructor(
        public readonly input: string,
        public readonly output?: string | undefined,
    ) {}
}

export class Transpiler {
    private lines: string[] = [];
    private id: number = 0;
    private loopFinalStates: string[] = [];
    private prefix: string;

    constructor(options: TranspilerOptions = {}) {
        this.prefix = options.prefix ?? "STATE_";
    }

    getFreshName(): string {
        this.id++;
        return `${this.prefix}${this.id}`;
    }

    emitLine(
        { currentState, prevOutput, nextState, actions }: {
            currentState: string;
            prevOutput: "Z" | "NZ" | "*" | "ZZ";
            nextState: string;
            actions: string[];
        },
    ) {
        if (actions.length === 0) {
            throw Error("action must be nonempty");
        }
        this.lines.push(
            `${currentState}; ${prevOutput}; ${nextState}; ${
                actions.join(", ")
            }`,
        );
    }

    emitTransition(current: string, next: string) {
        this.emitLine({
            currentState: current,
            prevOutput: "*",
            nextState: next,
            actions: ["NOP"],
        });
    }

    transpile(expr: APGLExpr): string[] {
        const initialState = "INITIAL";
        const secondState = this.getFreshName() + "_INITIAL";
        this.emitTransition(initialState, secondState);

        const maybeEndState = this.prefix + "END";

        const endState = this.transpileExpr(
            new Context(secondState, maybeEndState),
            expr,
        );
        this.emitLine({
            currentState: endState,
            prevOutput: "*",
            nextState: endState,
            actions: ["HALT_OUT"],
        });

        return this.lines;
    }

    transpileExpr(ctx: Context, expr: APGLExpr): string {
        if (expr instanceof ActionAPGLExpr) {
            return this.transpileActionAPGLExpr(ctx, expr);
        } else if (expr instanceof SeqAPGLExpr) {
            return this.transpileSeqAPGLExpr(ctx, expr);
        } else if (expr instanceof IfAPGLExpr) {
            return this.transpileIfAPGLExpr(ctx, expr);
        } else if (expr instanceof LoopAPGLExpr) {
            return this.transpileLoopAPGLExpr(ctx, expr);
        } else if (expr instanceof WhileAPGLExpr) {
            return this.transpileWhileAPGLExpr(ctx, expr);
        } else if (expr instanceof BreakAPGLExpr) {
            return this.transpileBreakAPGLExpr(ctx, expr);
        }
        throw Error("error");
    }

    transpileActionAPGLExpr(ctx: Context, actionExpr: ActionAPGLExpr): string {
        const nextState = ctx.output ?? this.getFreshName();
        this.emitLine({
            currentState: ctx.input,
            prevOutput: "*",
            nextState: nextState,
            actions: actionExpr.actions,
        });
        return nextState;
    }

    transpileSeqAPGLExpr(ctx: Context, seqExpr: SeqAPGLExpr): string {
        if (seqExpr.exprs.length === 0) {
            if (ctx.output !== undefined) {
                if (ctx.output !== ctx.input) {
                    this.emitTransition(ctx.input, ctx.output);
                }
                return ctx.output;
            } else {
                return ctx.input;
            }
        }

        let state = ctx.input;
        for (const [i, expr] of seqExpr.exprs.entries()) {
            if (ctx.output && i === seqExpr.exprs.length - 1) {
                // 最後はoutput
                state = this.transpileExpr(
                    new Context(state, ctx.output),
                    expr,
                );
            } else {
                state = this.transpileExpr(new Context(state), expr);
            }
        }
        return state;
    }

    transpileIfAPGLExpr(ctx: Context, ifExpr: IfAPGLExpr): string {
        if (isEmptyExpr(ifExpr.elseBody)) {
            return this.transpileIfAPGLExprOnlyZ(
                ctx,
                ifExpr.cond,
                ifExpr.thenBody,
            );
        }
        if (isEmptyExpr(ifExpr.thenBody)) {
            return this.transpileIfAPGLExprOnlyNZ(
                ctx,
                ifExpr.cond,
                ifExpr.elseBody,
            );
        }

        const condEndState = this.transpileExpr(
            new Context(ctx.input),
            ifExpr.cond,
        );
        const thenStartState = this.getFreshName() + "_IF_Z";
        const elseStartState = this.getFreshName() + "_IF_NZ";

        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: thenStartState,
            actions: ["NOP"],
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: elseStartState,
            actions: ["NOP"],
        });

        const thenEndState = this.transpileExpr(
            new Context(thenStartState, ctx.output),
            ifExpr.thenBody,
        );
        const elseEndState = this.transpileExpr(
            new Context(elseStartState, ctx.output),
            ifExpr.elseBody,
        );

        // elseにまとめる
        if (thenEndState !== elseEndState) {
            this.emitTransition(thenEndState, elseEndState);
        }

        return elseEndState;
    }

    transpileIfAPGLExprOnlyZ(
        ctx: Context,
        cond: APGLExpr,
        body: APGLExpr,
    ): string {
        const condEndState = this.transpileExpr(new Context(ctx.input), cond);
        const thenStartState = this.getFreshName() + "_IF_Z";
        const endState = this.transpileExpr(
            new Context(thenStartState, ctx.output),
            body,
        );
        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: thenStartState,
            actions: ["NOP"],
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: endState,
            actions: ["NOP"],
        });
        return endState;
    }

    transpileIfAPGLExprOnlyNZ(
        ctx: Context,
        cond: APGLExpr,
        body: APGLExpr,
    ): string {
        const condEndState = this.transpileExpr(new Context(ctx.input), cond);
        const bodyStartState = this.getFreshName() + "_IF_NZ";
        const endState = this.transpileExpr(
            new Context(bodyStartState, ctx.output),
            body,
        );
        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: endState,
            actions: ["NOP"],
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: bodyStartState,
            actions: ["NOP"],
        });
        return endState;
    }

    transpileLoopAPGLExpr(ctx: Context, loopExpr: LoopAPGLExpr): string {
        const breakState = ctx.output ?? (this.getFreshName() + "_LOOP_BREAK");
        this.loopFinalStates.push(breakState);
        const nextState = this.transpileExpr(
            new Context(ctx.input, ctx.input),
            loopExpr.body,
        );
        this.loopFinalStates.pop();

        if (nextState !== ctx.input) {
            this.emitTransition(nextState, ctx.input);
        }
        return breakState;
    }

    /**
     * 中身が空のwhileについて最適化
     */
    transpileWhileAPGLExprBodyEmpty(
        ctx: Context,
        cond: APGLExpr,
        modifier: "Z" | "NZ",
    ): string {
        const condEndState = this.transpileExpr(new Context(ctx.input), cond);
        const finalState = ctx.output ?? (this.getFreshName() + "_WHILE_END");

        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: modifier === "Z" ? ctx.input : finalState,
            actions: ["NOP"],
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: modifier === "Z" ? finalState : ctx.input,
            actions: ["NOP"],
        });

        return finalState;
    }

    transpileWhileAPGLExpr(ctx: Context, whileExpr: WhileAPGLExpr): string {
        if (isEmptyExpr(whileExpr.body)) {
            return this.transpileWhileAPGLExprBodyEmpty(
                ctx,
                whileExpr.cond,
                whileExpr.modifier,
            );
        }
        const condEndState = this.transpileExpr(
            new Context(ctx.input),
            whileExpr.cond,
        );
        const bodyStartState = this.getFreshName() + "_WHILE_BODY";

        const finalState = ctx.output ?? (this.getFreshName() + "_WHILE_END");

        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: whileExpr.modifier === "Z" ? bodyStartState : finalState,
            actions: ["NOP"],
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: whileExpr.modifier === "Z" ? finalState : bodyStartState,
            actions: ["NOP"],
        });

        this.loopFinalStates.push(finalState);
        const bodyEndState = this.transpileExpr(
            new Context(bodyStartState, ctx.input),
            whileExpr.body,
        );
        this.loopFinalStates.pop();

        if (bodyEndState !== ctx.input) {
            this.emitTransition(bodyEndState, ctx.input);
        }

        return finalState;
    }

    transpileBreakAPGLExpr(ctx: Context, breakExpr: BreakAPGLExpr): string {
        if (breakExpr.level !== undefined && breakExpr.level < 1) {
            throw Error("break level is less than 1");
        }
        if (breakExpr.level === undefined || breakExpr.level === 1) {
            const breakState =
                this.loopFinalStates[this.loopFinalStates.length - 1];
            if (breakState === undefined) {
                throw Error("break outside while or loop");
            }
            if (ctx.input !== breakState) {
                this.emitTransition(ctx.input, breakState);
            }
        } else {
            const breakState = this.loopFinalStates[
                this.loopFinalStates.length - breakExpr.level
            ];
            if (breakState === undefined) {
                throw Error(
                    "break level is greater than number of nests of while or loop",
                );
            }
            if (ctx.input !== breakState) {
                this.emitTransition(ctx.input, breakState);
            }
        }
        return ctx.output ?? (this.getFreshName() + "_BREAK_UNUSED");
    }
}

export function transpileAPGL(
    expr: APGLExpr,
    options: TranspilerOptions = {},
): string[] {
    return new Transpiler(options).transpile(expr);
}
