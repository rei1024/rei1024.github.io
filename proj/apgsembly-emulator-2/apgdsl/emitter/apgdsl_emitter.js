// @ts-check

import {
    Command,
    Action,
    URegAction,
    U_INC,
    U_TDEC,
    NopAction,
    BRegAction,
    B_INC,
    B_TDEC,
    B_SET,
    B_READ,
    B2DAction,
    B2D_INC,
    B2D_TDEC,
    B2D_B2D,
    B2D_B2DX,
    B2D_B2DY,
    B2D_READ,
    B2D_SET,
    AddAction,
    ADD_A1,
    ADD_B0,
    ADD_B1,
    SubAction,
    SUB_A1,
    SUB_B0,
    SUB_B1,
    MulAction,
    MUL_0,
    MUL_1,
    HaltOutAction,
    OutputAction,
    INITIAL_STATE,
} from "../apgdsl_deps.js";

/**
 * @typedef { { kind: 'function', name: string, args: Expr[] } } CallExpr
 */

/**
 * @typedef { { kind: 'sequence', exprs: Expr[] } } SeqExpr
 */

/**
 * @typedef { { kind: 'string', value: string } } StrExpr
 */

/**
 * @typedef { { kind: 'number', value: number } } NumExpr
 */

/**
 * @typedef {CallExpr | SeqExpr | StrExpr | NumExpr} Expr
 */

/**
 * @typedef {string} StateName
 */

/**
 * 
 * @param {never} _never
 * @returns {never}
 */
function unreachable(_never) {
    throw Error('unreachable');
}

export class Emitter {
    constructor() {
        /**
         * @readonly
         * @private
         * @type {Command[]}
         */
        this.commands = [];

        /**
         * @private
         */
        this.id = 0;

        /**
         * @private
         * @readonly
         */
        this.statePrefix = "STATE";
    }

    /**
     * 
     * @param {Expr} expr 
     */
    emitExprWrapped(expr) {
        const nextState = this.getNextState();
        this.emitCommand(new Command({
            state: INITIAL_STATE,
            input: 'ZZ',
            nextState: nextState,
            actions: [new NopAction()]
        }));
        const exprOutputState = this.emitExpr(nextState, expr);
        this.emitCommand(new Command({
            state: exprOutputState,
            input: '*',
            nextState: exprOutputState,
            actions: [new HaltOutAction()]
        }));
    }

    /**
     * 
     * @returns {string}
     */
    getNextState() {
        const state = `${this.statePrefix}${this.id}`;
        this.id++;
        return state;
    }

    getCommands() {
        return this.commands;
    }

    /**
     * 
     * @param {Command} command 
     */
    emitCommand(command) {
        this.commands.push(command);
    }

    /**
     * 
     * @param {StateName} input 
     * @param {Expr} expr
     * @returns {StateName}
     */
    emitExpr(input, expr) {
        switch (expr.kind) {
            case 'function': return this.emitFunction(input, expr);
            case 'sequence': return this.emitSequence(input, expr);
            case 'number': throw Error('number is not compilable');
            case 'string': throw Error('string is not compilable');
            default: return unreachable(expr);
        }
    }

    /**
     *
     * @param {StateName} input 
     * @param {CallExpr} expr
     * @returns {StateName}
     */
    emitFunction(input, expr) {
        if (expr.kind !== 'function') {
            throw Error('kind is not a function');
        }
        const __this__ = this;
        /**
         * 
         * @param {(_: number) => Action[]} fn 
         * @returns {StateName}
         */
        function single(fn) {
            return __this__.emitSingleNumberFunction(input, expr, fn);
        }

        /**
         * 
         * @param {Action[]} actions 
         * @returns {StateName}
         */
        function empty(actions) {
            return __this__.emitEmptyFunction(input, expr, actions);
        }

        switch (expr.name) {
            case "output": return this.emitOutput(input, expr);

            case "if_zero": return this.emitIf(input, true, expr);
            case "if_non_zero": return this.emitIf(input, false, expr);

            case "while_zero": return this.emitWhile(input, true, expr);
            case "while_non_zero": return this.emitWhile(input, false, expr);

            // U
            case "inc_u": return single(n => [new URegAction(U_INC, n), new NopAction()]);
            case "tdec_u": return single(n => [new URegAction(U_TDEC, n)]);
            // B
            case "inc_b": return single(n => [new BRegAction(B_INC, n), new NopAction()]);
            case "tdec_b": return single(n => [new BRegAction(B_TDEC, n)]);
            case "read_b": return single(n => [new BRegAction(B_READ, n)]);
            case "set_b": return single(n => [new BRegAction(B_SET, n), new NopAction()]);
            // B2D
            case "inc_b2dx": return empty([new B2DAction(B2D_INC, B2D_B2DX), new NopAction()]);
            case "inc_b2dy": return empty([new B2DAction(B2D_INC, B2D_B2DY), new NopAction()]);
            case "tdec_b2dx": return empty([new B2DAction(B2D_TDEC, B2D_B2DX)]);
            case "tdec_b2dy": return empty([new B2DAction(B2D_TDEC, B2D_B2DY)]);
            case "read_b2d": return empty([new B2DAction(B2D_READ, B2D_B2D)]);
            case "set_b2d": return empty([new B2DAction(B2D_SET, B2D_B2D), new NopAction()]);
            // ADD
            case "add_a1": return empty([new AddAction(ADD_A1), new NopAction()]);
            case "add_b0": return empty([new AddAction(ADD_B0)]);
            case "add_b1": return empty([new AddAction(ADD_B1)]);
            // SUB
            case "sub_a1": return empty([new SubAction(SUB_A1), new NopAction()]);
            case "sub_b0": return empty([new SubAction(SUB_B0)]);
            case "sub_b1": return empty([new SubAction(SUB_B1)]);
            // MUL
            case "mul_0": return empty([new MulAction(MUL_0)]);
            case "mul_1": return empty([new MulAction(MUL_1)]);
            // NOP
            case "nop": return empty([new NopAction()]);
            // HALT_OUT
            case "halt_out": return empty([new HaltOutAction()]);
            default: throw Error(`Unknown function ${expr.name}`);
        }
    }

    /**
     * 
     * @param {StateName} input 
     * @param {boolean} isZero 
     * @param {CallExpr} expr
     * @returns {StateName}
     */
    emitIf(input, isZero, expr) {
        if (expr.args.length !== 3) {
            throw Error('if need 3 argments');
        }
        const condExpr = expr.args[0];
        const ifState = this.emitExpr(input, condExpr);
        const zeroExpr = isZero ? expr.args[1] : expr.args[2];
        const nonZeroExpr = isZero ? expr.args[2] : expr.args[1];
        const zeroState = this.getNextState();
        const nonZeroState = this.getNextState();
        this.emitCommand(new Command({
            state: ifState,
            input: 'Z',
            nextState: zeroState,
            actions: [new NopAction()]
        }));
        this.emitCommand(new Command({
            state: ifState,
            input: 'NZ',
            nextState: nonZeroState,
            actions: [new NopAction()]
        }));
        const zeroOutputState = this.emitExpr(zeroState, zeroExpr);
        const nonZeroOutputState = this.emitExpr(nonZeroState, nonZeroExpr);
        const mergeState = this.getNextState();
        this.emitCommand(new Command({
            state: zeroOutputState,
            input: '*',
            nextState: mergeState,
            actions: [new NopAction()]
        }));
        this.emitCommand(new Command({
            state: nonZeroOutputState,
            input: '*',
            nextState: mergeState,
            actions: [new NopAction()]
        }));
        return mergeState;
    }

    /**
     * 
     * @param {StateName} input 
     * @param {boolean} isZero 
     * @param {CallExpr} expr 
     * @returns {StateName}
     */
    emitWhile(input, isZero, expr) {
        if (expr.args.length !== 2) {
            throw Error('while need 2 argments');
        }
        const condExpr = expr.args[0];
        const innerExpr = expr.args[1];
        const condOutputState = this.emitExpr(input, condExpr);

        const continueState = this.getNextState();
        const finalState = this.getNextState();
        this.emitCommand(new Command({
            state: condOutputState,
            input: 'Z',
            nextState: isZero ? continueState : finalState,
            actions: [new NopAction()]
        }));
        this.emitCommand(new Command({
            state: condOutputState,
            input: 'NZ',
            nextState: isZero ? finalState : continueState,
            actions: [new NopAction()]
        }));
        const innerOutputState = this.emitExpr(continueState, innerExpr);
        this.emitCommand(new Command({
            state: innerOutputState,
            input: '*',
            nextState: input,
            actions: [new NopAction()]
        }));
        return finalState;
    }

    /**
     * 
     * @param {StateName} input 
     * @param {CallExpr} expr
     * @returns {StateName}
     */
    emitOutput(input, expr) {
        if (expr.args.length !== 1) {
            throw Error('output argment length is not 1');
        }
        const arg = expr.args[0];
        if (arg.kind !== 'string') {
            throw Error('output argment is not a string');
        }
        const nextState = this.getNextState();
        this.emitCommand(new Command({
            state: input,
            input: '*',
            nextState: nextState,
            actions: [new OutputAction(arg.value), new NopAction()]
        }));
        return nextState;
    }

    /**
     * 
     * @param {StateName} input 
     * @param {CallExpr} expr 
     * @param {(_: number) => Action[] | undefined} fn 
     */
    emitSingleNumberFunction(input, expr, fn) {
        if (expr.args.length !== 1) {
            throw Error(`${expr.name} arguments length is not 1`);
        }
        const arg = expr.args[0];
        if (arg.kind !== 'number') {
            throw Error(`${expr.name} accepts only numbers`);
        }
        const actions = fn(arg.value);
        if (actions === undefined) {
            throw Error(`${expr.name} argment is not supported`);
        }
        const nextState = this.getNextState();
        this.emitCommand(new Command({
            state: input,
            nextState: nextState,
            actions: actions,
            input: '*'
        }));
        return nextState;
    }

    /**
     * 
     * @param {StateName} input 
     * @param {CallExpr} expr 
     * @param {Action[]} actions
     * @returns {StateName}
     */
    emitEmptyFunction(input, expr, actions) {
        if (expr.args.length !== 0) {
            throw Error(`${expr.name} should not take argments`);
        }
        const nextState = this.getNextState();
        this.emitCommand(new Command({
            state: input,
            nextState: nextState,
            actions: actions,
            input: '*'
        }));
        return nextState;
    }

    /**
     * 
     * @param {StateName} input 
     * @param {SeqExpr} expr 
     * @returns {StateName}
     */
    emitSequence(input, expr) {
        for (const e of expr.exprs) {
            input = this.emitExpr(input, e);
        }
        return input;
    }
}
