// @ts-check

import { Command, Action } from "../../apgc_deps.js";
import { FunctionCallExpression } from "../../types/apgc_types.js";
import { APGCCompiler } from "../apgc_compiler.js";

/**
 * @param {APGCCompiler} ctx 
 * @param {string} inputState
 * @param {FunctionCallExpression} callExpr 
 * @param {Action[]} actions
 * @returns {string} outputState
 */
export function compileEmptyArgumentFunction(ctx, inputState, callExpr, actions) {
    if (callExpr.args.length !== 0) {
        throw Error(`${callExpr.name} arguments is not empty`);
    }
    const nextState = ctx.generateState();
    const command = new Command({
        state: inputState,
        input: "*",
        nextState: nextState,
        actions: actions
    });
    ctx.addCommand(command);
    return nextState;
}
