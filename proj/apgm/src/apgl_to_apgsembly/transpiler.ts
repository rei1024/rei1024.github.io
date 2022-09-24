import {
    ActionAPGLExpr,
    APGLExpr,
    BreakAPGLExpr,
    IfAPGLExpr,
    isEmptyExpr,
    LoopAPGLExpr,
    SeqAPGLExpr,
    WhileAPGLExpr,
} from "../apgl/ast/mod.ts";

export interface TranspilerOptions {
    prefix?: string;
}

export class Context {
    constructor(
        /**
         * inputから始まるコマンドを出力する
         */
        public readonly input: string,
        /**
         * 出力状態
         */
        public readonly output: string,
        /**
         * inputのコマンドの入力
         * Z、NZの場合は最初の要素に分岐のコマンドを出力すること
         */
        public readonly inputZNZ: "*" | "Z" | "NZ",
    ) {}
}

type Line = string;

export class Transpiler {
    private id = 0;
    private loopFinalStates: string[] = [];
    private readonly prefix: string;

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
    ): Line[] {
        if (actions.length === 0) {
            throw Error("action must be nonempty");
        }

        return [
            `${currentState}; ${prevOutput}; ${nextState}; ${
                actions.join(", ")
            }`,
        ];
    }

    emitTransition(
        current: string,
        next: string,
        inputZNZ: "*" | "Z" | "NZ" | "ZZ" = "*",
    ): Line[] {
        return this.emitLine({
            currentState: current,
            prevOutput: inputZNZ,
            nextState: next,
            actions: ["NOP"],
        });
    }

    transpile(expr: APGLExpr): Line[] {
        const initialState = "INITIAL";
        const secondState = this.getFreshName() + "_INITIAL";
        const initial = this.emitTransition(initialState, secondState, "ZZ");

        const endState = this.prefix + "END";

        const body = this.transpileExpr(
            new Context(secondState, endState, "*"),
            expr,
        );

        const end = this.emitLine({
            currentState: endState,
            prevOutput: "*",
            nextState: endState,
            actions: ["HALT_OUT"],
        });

        return [...initial, ...body, ...end];
    }

    transpileExpr(ctx: Context, expr: APGLExpr): Line[] {
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
        } else {
            throw Error("unknown expr");
        }
    }

    transpileActionAPGLExpr(
        ctx: Context,
        actionExpr: ActionAPGLExpr,
    ): Line[] {
        return this.emitLine({
            currentState: ctx.input,
            prevOutput: ctx.inputZNZ,
            nextState: ctx.output,
            actions: actionExpr.actions,
        });
    }

    transpileSeqAPGLExpr(ctx: Context, seqExpr: SeqAPGLExpr): Line[] {
        // length === 0
        if (isEmptyExpr(seqExpr)) {
            return this.emitTransition(ctx.input, ctx.output, ctx.inputZNZ);
        }

        if (seqExpr.exprs.length === 1) {
            const expr = seqExpr.exprs[0];
            return this.transpileExpr(
                ctx,
                expr,
            );
        }

        let seq: Line[] = [];
        let state = ctx.input;
        for (const [i, expr] of seqExpr.exprs.entries()) {
            if (i === 0) {
                const outputState = this.getFreshName();
                seq = seq.concat(this.transpileExpr(
                    new Context(state, outputState, ctx.inputZNZ),
                    expr,
                ));
                state = outputState;
            } else if (i === seqExpr.exprs.length - 1) {
                // 最後はoutput
                seq = seq.concat(this.transpileExpr(
                    new Context(state, ctx.output, "*"),
                    expr,
                ));
            } else {
                const outputState = this.getFreshName();
                seq = seq.concat(
                    this.transpileExpr(
                        new Context(state, outputState, "*"),
                        expr,
                    ),
                );
                state = outputState;
            }
        }

        return seq;
    }

    transpileIfAPGLExpr(ctx: Context, ifExpr: IfAPGLExpr): Line[] {
        if (isEmptyExpr(ifExpr.thenBody) && isEmptyExpr(ifExpr.elseBody)) {
            return this.transpileExpr(ctx, ifExpr.cond);
        }

        const condEndState = this.getFreshName();
        const cond = this.transpileExpr(
            new Context(ctx.input, condEndState, ctx.inputZNZ),
            ifExpr.cond,
        );
        const [z, ...then] = this.transpileExpr(
            new Context(condEndState, ctx.output, "Z"),
            ifExpr.thenBody,
        );
        const [nz, ...el] = this.transpileExpr(
            new Context(condEndState, ctx.output, "NZ"),
            ifExpr.elseBody,
        );

        // ZとNZを隣にする
        return [...cond, z, nz, ...then, ...el];
    }

    transpileLoopAPGLExpr(ctx: Context, loopExpr: LoopAPGLExpr): Line[] {
        const loopState = ctx.inputZNZ === "*"
            ? ctx.input
            : this.getFreshName();
        const fromZOrNZ: Line[] = ctx.inputZNZ === "*"
            ? []
            : this.emitTransition(ctx.input, loopState, ctx.inputZNZ);

        this.loopFinalStates.push(ctx.output);

        const body = this.transpileExpr(
            new Context(loopState, loopState, "*"),
            loopExpr.body,
        );

        this.loopFinalStates.pop();

        return [...fromZOrNZ, ...body];
    }

    /**
     * 中身が空のwhileについて最適化
     */
    transpileWhileAPGLExprBodyEmpty(
        ctx: Context,
        cond: APGLExpr,
        modifier: "Z" | "NZ",
    ): Line[] {
        const condStartState = ctx.inputZNZ === "*"
            ? ctx.input
            : this.getFreshName();
        const fromZOrNZ: Line[] = ctx.inputZNZ === "*"
            ? []
            : this.emitTransition(ctx.input, condStartState, ctx.inputZNZ);

        const condEndState = this.getFreshName();
        const condRes = this.transpileExpr(
            new Context(condStartState, condEndState, "*"),
            cond,
        );

        const zRes = this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: modifier === "Z" ? condStartState : ctx.output,
            actions: ["NOP"],
        });

        const nzRes = this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: modifier === "Z" ? ctx.output : condStartState,
            actions: ["NOP"],
        });

        // zResとnzResは1行
        return [...fromZOrNZ, ...condRes, ...zRes, ...nzRes];
    }

    transpileWhileAPGLExpr(ctx: Context, whileExpr: WhileAPGLExpr): Line[] {
        if (isEmptyExpr(whileExpr.body)) {
            return this.transpileWhileAPGLExprBodyEmpty(
                ctx,
                whileExpr.cond,
                whileExpr.modifier,
            );
        }

        let cond: Line[] = [];
        const condStartState = ctx.inputZNZ === "*"
            ? ctx.input
            : this.getFreshName();
        if (ctx.inputZNZ !== "*") {
            cond = cond.concat(
                this.emitTransition(ctx.input, condStartState, ctx.inputZNZ),
            );
        }

        const condEndState = this.getFreshName();
        cond = cond.concat(this.transpileExpr(
            new Context(condStartState, condEndState, "*"),
            whileExpr.cond,
        ));

        const bodyStartState = this.getFreshName() + "_WHILE_BODY";

        const zRes = this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: whileExpr.modifier === "Z" ? bodyStartState : ctx.output,
            actions: ["NOP"],
        });

        const nzRes = this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: whileExpr.modifier === "Z" ? ctx.output : bodyStartState,
            actions: ["NOP"],
        });

        this.loopFinalStates.push(ctx.output);

        const body = this.transpileExpr(
            new Context(bodyStartState, condStartState, "*"),
            whileExpr.body,
        );

        this.loopFinalStates.pop();

        // zResとnzResは1行
        return [...cond, ...zRes, ...nzRes, ...body];
    }

    transpileBreakAPGLExpr(ctx: Context, breakExpr: BreakAPGLExpr): Line[] {
        const level = breakExpr.level ?? 1;

        if (level < 1) {
            throw Error("break level is less than 1");
        }

        const finalState =
            this.loopFinalStates[this.loopFinalStates.length - level];

        if (finalState === undefined) {
            if (level === 1) {
                throw Error("break outside while or loop");
            } else {
                throw Error(
                    "break level is greater than number of nests of while or loop",
                );
            }
        }

        return this.emitTransition(ctx.input, finalState, ctx.inputZNZ);
    }
}

export function transpileAPGL(
    expr: APGLExpr,
    options: TranspilerOptions = {},
): Line[] {
    return new Transpiler(options).transpile(expr);
}
