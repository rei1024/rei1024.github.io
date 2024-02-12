import { mergeActionAPGLExpr } from "../apgl/action_optimizer/mod.ts";
import {
    ActionAPGLExpr,
    APGLExpr,
    BreakAPGLExpr,
    extractSingleActionExpr,
    IfAPGLExpr,
    isEmptyExpr,
    LoopAPGLExpr,
    SeqAPGLExpr,
    WhileAPGLExpr,
} from "../apgl/ast/mod.ts";
import { ErrorWithSpan } from "../apgm/ast/core.ts";

export interface TranspilerOptions {
    prefix?: string;
    noOptimize?: boolean;
}

class Context {
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

type LineInner = {
    readonly currentState: string;
    readonly prevOutput: "Z" | "NZ" | "*" | "ZZ";
    readonly nextState: string;
    readonly actions: string[];
};

function fromatLineInner(inner: LineInner): string {
    const prevOutput = inner.prevOutput;
    let prevOutputWithSpace: string = prevOutput;

    // 見た目を整えるため
    if (prevOutput === "*" || prevOutput === "Z") {
        prevOutputWithSpace = " " + prevOutput;
    }

    return `${inner.currentState}; ${prevOutputWithSpace}; ${inner.nextState}; ${
        inner.actions.join(", ")
    }`;
}

export class Line {
    constructor(
        readonly inner: LineInner,
    ) {
        if (this.inner.actions.length === 0) {
            throw Error("actions must be nonempty");
        }
    }
}

export class Transpiler {
    #id = 0;
    readonly #loopFinalStates: string[] = [];
    readonly #prefix: string;
    readonly #optimize: boolean;

    constructor(options: TranspilerOptions = {}) {
        this.#prefix = options.prefix ?? "STATE_";
        this.#optimize = !(options.noOptimize ?? false);
    }

    #getFreshName(): string {
        this.#id++;
        return `${this.#prefix}${this.#id}`;
    }

    #createTransition(
        current: string,
        next: string,
        inputZNZ: "*" | "Z" | "NZ" | "ZZ" = "*",
    ): Line {
        return new Line({
            currentState: current,
            prevOutput: inputZNZ,
            nextState: next,
            actions: ["NOP"],
        });
    }

    transpile(expr: APGLExpr): string[] {
        const initialState = "INITIAL";
        const secondState = this.#getFreshName();
        const initial = this.#createTransition(initialState, secondState, "ZZ");

        const endState = this.#prefix + "END";

        const body = this.#transpileExpr(
            new Context(secondState, endState, "*"),
            expr,
        );

        const end = new Line({
            currentState: endState,
            prevOutput: "*",
            nextState: endState,
            actions: ["HALT_OUT"],
        });

        return [initial, ...body, end].map((line) =>
            fromatLineInner(line.inner)
        );
    }

    #transpileExpr(ctx: Context, expr: APGLExpr): Line[] {
        if (expr instanceof ActionAPGLExpr) {
            return [this.#transpileActionAPGLExpr(ctx, expr)];
        } else if (expr instanceof SeqAPGLExpr) {
            return this.#transpileSeqAPGLExpr(ctx, expr);
        } else if (expr instanceof IfAPGLExpr) {
            return this.#transpileIfAPGLExpr(ctx, expr);
        } else if (expr instanceof LoopAPGLExpr) {
            return this.#transpileLoopAPGLExpr(ctx, expr);
        } else if (expr instanceof WhileAPGLExpr) {
            return this.#transpileWhileAPGLExpr(ctx, expr);
        } else if (expr instanceof BreakAPGLExpr) {
            return this.#transpileBreakAPGLExpr(ctx, expr);
        } else {
            throw Error("unknown expr");
        }
    }

    #transpileActionAPGLExpr(
        ctx: Context,
        actionExpr: ActionAPGLExpr,
    ): Line {
        return new Line({
            currentState: ctx.input,
            prevOutput: ctx.inputZNZ,
            nextState: ctx.output,
            actions: actionExpr.actions,
        });
    }

    #transpileSeqAPGLExpr(ctx: Context, seqExpr: SeqAPGLExpr): Line[] {
        // length === 0
        if (isEmptyExpr(seqExpr)) {
            return [
                this.#createTransition(ctx.input, ctx.output, ctx.inputZNZ),
            ];
        }

        if (seqExpr.exprs.length === 1) {
            const expr = seqExpr.exprs[0];
            if (expr === undefined) {
                throw new Error("internal error");
            }
            return this.#transpileExpr(ctx, expr);
        }

        let seq: Line[] = [];
        let state = ctx.input;
        const lastIndex = seqExpr.exprs.length - 1;
        for (const [i, expr] of seqExpr.exprs.entries()) {
            if (i !== lastIndex) {
                const outputState = this.#getFreshName();
                seq = seq.concat(this.#transpileExpr(
                    new Context(
                        state,
                        outputState,
                        i === 0 ? ctx.inputZNZ : "*",
                    ),
                    expr,
                ));
                state = outputState;
            } else {
                // 最後はoutput
                seq = seq.concat(this.#transpileExpr(
                    new Context(state, ctx.output, "*"),
                    expr,
                ));
            }
        }

        return seq;
    }

    #transpileIfAPGLExpr(ctx: Context, ifExpr: IfAPGLExpr): Line[] {
        if (
            this.#optimize && isEmptyExpr(ifExpr.thenBody) &&
            isEmptyExpr(ifExpr.elseBody)
        ) {
            return this.#transpileExpr(ctx, ifExpr.cond);
        }

        const condEndState = this.#getFreshName();
        const cond = this.#transpileExpr(
            new Context(ctx.input, condEndState, ctx.inputZNZ),
            ifExpr.cond,
        );
        const [z, ...then] = this.#transpileExpr(
            new Context(condEndState, ctx.output, "Z"),
            ifExpr.thenBody,
        );
        const [nz, ...el] = this.#transpileExpr(
            new Context(condEndState, ctx.output, "NZ"),
            ifExpr.elseBody,
        );

        // ZとNZを隣にする
        return [...cond, z, nz, ...then, ...el];
    }

    #transpileLoopAPGLExpr(ctx: Context, loopExpr: LoopAPGLExpr): Line[] {
        const { startState: loopState, fromZOrNZ } = this.#normalizeInputState(
            ctx,
        );

        this.#loopFinalStates.push(ctx.output);

        const body = this.#transpileExpr(
            new Context(loopState, loopState, "*"),
            loopExpr.body,
        );

        this.#loopFinalStates.pop();

        return [...fromZOrNZ, ...body];
    }

    /**
     * 条件が1行かつ中身が空または1行
     * @param mergedCondBody 条件分岐先のActionAPGLExpr
     */
    #transpileWhileAPGLExprSimpleCond(
        ctx: Context,
        cond: ActionAPGLExpr,
        mergedCondBody: ActionAPGLExpr,
        modifier: "Z" | "NZ",
    ): Line[] {
        const { startState: condStartState, fromZOrNZ } = this
            .#normalizeInputState(ctx);

        const condEndState = this.#getFreshName();
        const condRes = this.#transpileActionAPGLExpr(
            new Context(condStartState, condEndState, "*"),
            cond,
        );

        const zRes = new Line({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: modifier === "Z" ? condEndState : ctx.output,
            actions: modifier === "Z" ? mergedCondBody.actions : ["NOP"],
        });

        const nzRes = new Line({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: modifier === "Z" ? ctx.output : condEndState,
            actions: modifier === "Z" ? ["NOP"] : mergedCondBody.actions,
        });

        return [...fromZOrNZ, condRes, zRes, nzRes];
    }

    /**
     * 中身が空のwhileについて最適化
     */
    #transpileWhileAPGLExprBodyEmpty(
        ctx: Context,
        cond: APGLExpr,
        modifier: "Z" | "NZ",
    ): Line[] {
        const { startState: condStartState, fromZOrNZ } = this
            .#normalizeInputState(ctx);

        const condEndState = this.#getFreshName();
        const condRes = this.#transpileExpr(
            new Context(condStartState, condEndState, "*"),
            cond,
        );

        const zRes = new Line({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: modifier === "Z" ? condStartState : ctx.output,
            actions: ["NOP"],
        });

        const nzRes = new Line({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: modifier === "Z" ? ctx.output : condStartState,
            actions: ["NOP"],
        });

        return [...fromZOrNZ, ...condRes, zRes, nzRes];
    }

    #transpileWhileAPGLExpr(ctx: Context, whileExpr: WhileAPGLExpr): Line[] {
        const optimize = this.#optimize;
        if (optimize && isEmptyExpr(whileExpr.body)) {
            const singleCondAction = extractSingleActionExpr(whileExpr.cond);
            if (singleCondAction !== undefined) {
                return this.#transpileWhileAPGLExprSimpleCond(
                    ctx,
                    singleCondAction,
                    singleCondAction, // bodyが空なのでcondのまま
                    whileExpr.modifier,
                );
            }

            return this.#transpileWhileAPGLExprBodyEmpty(
                ctx,
                whileExpr.cond,
                whileExpr.modifier,
            );
        }

        const singleBody = extractSingleActionExpr(whileExpr.body);
        const singleCondAction = extractSingleActionExpr(whileExpr.cond);
        if (
            optimize && singleCondAction !== undefined &&
            singleBody !== undefined
        ) {
            const merged = mergeActionAPGLExpr(singleBody, singleCondAction);
            if (merged !== undefined) {
                return this.#transpileWhileAPGLExprSimpleCond(
                    ctx,
                    singleCondAction,
                    merged,
                    whileExpr.modifier,
                );
            }
        }

        const { startState: condStartState, fromZOrNZ } = this
            .#normalizeInputState(ctx);

        const condEndState = this.#getFreshName();
        const cond = this.#transpileExpr(
            new Context(condStartState, condEndState, "*"),
            whileExpr.cond,
        );

        const bodyStartState = this.#getFreshName() + "_WHILE_BODY";

        const zRes = new Line({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: whileExpr.modifier === "Z" ? bodyStartState : ctx.output,
            actions: ["NOP"],
        });

        const nzRes = new Line({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: whileExpr.modifier === "Z" ? ctx.output : bodyStartState,
            actions: ["NOP"],
        });

        this.#loopFinalStates.push(ctx.output);

        const body = this.#transpileExpr(
            new Context(bodyStartState, condStartState, "*"),
            whileExpr.body,
        );

        this.#loopFinalStates.pop();

        return [...fromZOrNZ, ...cond, zRes, nzRes, ...body];
    }

    #normalizeInputState(
        ctx: Context,
    ): { startState: string; fromZOrNZ: Line[] } {
        const startState = ctx.inputZNZ === "*"
            ? ctx.input
            : this.#getFreshName();
        const fromZOrNZ: Line[] = ctx.inputZNZ === "*"
            ? []
            : [this.#createTransition(ctx.input, startState, ctx.inputZNZ)];

        return { startState, fromZOrNZ };
    }

    #transpileBreakAPGLExpr(ctx: Context, breakExpr: BreakAPGLExpr): Line[] {
        const level = breakExpr.level ?? 1;

        if (level < 1) {
            throw new ErrorWithSpan(
                "break level is less than 1",
                breakExpr.span,
            );
        }

        const finalState =
            this.#loopFinalStates[this.#loopFinalStates.length - level];

        if (finalState === undefined) {
            if (level === 1) {
                throw new ErrorWithSpan(
                    "break outside while or loop",
                    breakExpr.span,
                );
            } else {
                throw new ErrorWithSpan(
                    "break level is greater than number of nests of while or loop",
                    breakExpr.span,
                );
            }
        }

        return [this.#createTransition(ctx.input, finalState, ctx.inputZNZ)];
    }
}

/**
 * Transpile APGL to lines of APGsembly code
 */
export function transpileAPGL(
    expr: APGLExpr,
    options: TranspilerOptions = {},
): string[] {
    return new Transpiler(options).transpile(expr);
}
