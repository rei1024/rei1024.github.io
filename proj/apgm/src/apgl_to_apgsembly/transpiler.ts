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

export class Transpiler {
    private lines: string[] = [];
    private id: number = 0;
    private loopFinalStates: string[] = [];
    private prefix = "STATE";
    constructor() {
    }

    getFreshName() {
        this.id++;
        return `${this.prefix}_${this.id}`;
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

    transition(current: string, next: string) {
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
        this.transition(initialState, secondState);
        const endState = this.transpileExpr(secondState, expr);
        this.emitLine({
            currentState: endState,
            prevOutput: "*",
            nextState: endState,
            actions: ["HALT_OUT"],
        });

        return this.lines;
    }

    transpileExpr(state: string, expr: APGLExpr): string {
        if (expr instanceof ActionAPGLExpr) {
            return this.transpileActionAPGLExpr(state, expr);
        } else if (expr instanceof SeqAPGLExpr) {
            return this.transpileSeqAPGLExpr(state, expr);
        } else if (expr instanceof IfAPGLExpr) {
            return this.transpileIfAPGLExpr(state, expr);
        } else if (expr instanceof LoopAPGLExpr) {
            return this.transpileLoopAPGLExpr(state, expr);
        } else if (expr instanceof WhileAPGLExpr) {
            return this.transpileWhileAPGLExpr(state, expr);
        } else if (expr instanceof BreakAPGLExpr) {
            return this.transpileBreakAPGLExpr(state, expr);
        }
        throw Error("error");
    }

    transpileActionAPGLExpr(state: string, actionExpr: ActionAPGLExpr): string {
        const nextState = this.getFreshName();
        this.emitLine({
            currentState: state,
            prevOutput: "*",
            nextState: nextState,
            actions: actionExpr.actions,
        });
        return nextState;
    }

    transpileSeqAPGLExpr(state: string, seqExpr: SeqAPGLExpr): string {
        for (const expr of seqExpr.exprs) {
            state = this.transpileExpr(state, expr);
        }
        return state;
    }

    transpileIfAPGLExpr(state: string, ifExpr: IfAPGLExpr): string {
        if (isEmptyExpr(ifExpr.elseBody)) {
            return this.transpileIfAPGLExprOnlyZ(
                state,
                ifExpr.cond,
                ifExpr.thenBody,
            );
        }
        if (isEmptyExpr(ifExpr.thenBody)) {
            return this.transpileIfAPGLExprOnlyNZ(
                state,
                ifExpr.cond,
                ifExpr.elseBody,
            );
        }
        const condEndState = this.transpileExpr(state, ifExpr.cond);
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
            thenStartState,
            ifExpr.thenBody,
        );
        const elseEndState = this.transpileExpr(
            elseStartState,
            ifExpr.elseBody,
        );

        // elseにまとめる
        this.transition(thenEndState, elseEndState);

        return elseEndState;
    }

    transpileIfAPGLExprOnlyZ(
        state: string,
        cond: APGLExpr,
        body: APGLExpr,
    ): string {
        const condEndState = this.transpileExpr(state, cond);
        const thenStartState = this.getFreshName() + "_IF_Z";
        const endState = this.transpileExpr(
            thenStartState,
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
        state: string,
        cond: APGLExpr,
        body: APGLExpr,
    ): string {
        const condEndState = this.transpileExpr(state, cond);
        const bodyStartState = this.getFreshName() + "_IF_NZ";
        const endState = this.transpileExpr(bodyStartState, body);
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

    transpileLoopAPGLExpr(state: string, loopExpr: LoopAPGLExpr): string {
        const breakState = this.getFreshName() + "_LOOP_BREAK";
        this.loopFinalStates.push(breakState);
        const nextState = this.transpileExpr(state, loopExpr.body);
        this.loopFinalStates.pop();
        this.emitLine({
            currentState: nextState,
            prevOutput: "*",
            nextState: state,
            actions: ["NOP"],
        });
        return breakState;
    }

    transpileWhileAPGLExpr(state: string, whileExpr: WhileAPGLExpr): string {
        const condEndState = this.transpileExpr(state, whileExpr.cond);
        const bodyStartState = this.getFreshName() + "_WHILE_BODY";

        const finalState = this.getFreshName() + "_WHILE_END";

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
        const bodyEndState = this.transpileExpr(bodyStartState, whileExpr.body);
        this.loopFinalStates.pop();
        this.emitLine({
            currentState: bodyEndState,
            prevOutput: "*",
            nextState: state,
            actions: ["NOP"],
        });

        return finalState;
    }

    transpileBreakAPGLExpr(state: string, breakExpr: BreakAPGLExpr): string {
        if (breakExpr.level !== undefined && breakExpr.level < 1) {
            throw Error("break level is less than 1");
        }
        if (breakExpr.level === undefined || breakExpr.level === 1) {
            const breakState =
                this.loopFinalStates[this.loopFinalStates.length - 1];
            if (breakState === undefined) {
                throw Error("break outside while or loop");
            }
            this.transition(state, breakState);
        } else {
            const breakState = this.loopFinalStates[
                this.loopFinalStates.length - breakExpr.level
            ];
            if (breakState === undefined) {
                throw Error(
                    "break level is greater than number of nest of while or loop",
                );
            }
            this.transition(state, breakState);
        }
        return this.getFreshName() + "_BREAK_UNUSED";
    }
}

export function transpileAPGL(expr: APGLExpr): string[] {
    return new Transpiler().transpile(expr);
}
