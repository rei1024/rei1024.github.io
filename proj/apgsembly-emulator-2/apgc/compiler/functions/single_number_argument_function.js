// @ts-check

import { Command, Action } from "../../apgc_deps.js";
import { FunctionCallExpression, NumberExpression } from "../../types/apgc_types.js";
import { APGCCompiler } from "../apgc_compiler.js";

/**
 * @param {APGCCompiler} ctx 
 * @param {string} inputState
 * @param {FunctionCallExpression} callExpr 
 * @param {(_: number) => Action[]} actions
 * @returns {string} outputState
 */
export function compileSingleNumberArgumentFunction(ctx, inputState, callExpr, actions) {
    if (callExpr.args.length !== 1) {
        throw Error(`${callExpr.name} arguments length is not 1`);
    }
    const arg = callExpr.args[0];
    if (!(arg instanceof NumberExpression)) {
        throw Error(`${callExpr.name} accepts only numbers`);
    }
    if (arg.value < 0) {
        throw Error(`${callExpr.name} argument is negtive`);
    }
    const nextState = ctx.generateState();
    const command = new Command({
        state: inputState,
        input: "*",
        nextState: nextState,
        actions: actions(arg.value)
    });
    ctx.addCommand(command);
    return nextState;
}
