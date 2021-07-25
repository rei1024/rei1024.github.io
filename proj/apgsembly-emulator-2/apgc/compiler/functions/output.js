// @ts-check
import { NopAction, OutputAction, Command } from "../../apgc_deps.js";

import { FunctionCallExpression, StringExpression } from "../../types/apgc_types.js";
import { APGCCompiler } from "../apgc_compiler.js";

/**
 * 
 * @param {APGCCompiler} ctx 
 * @param {string} inputState
 * @param {FunctionCallExpression} callExpr 
 * @returns {string}
 */
export function compileOutput(ctx, inputState, callExpr) {
    if (callExpr.args.length !== 1) {
        throw Error('output arguments length is not 1');
    }
    const arg = callExpr.args[0];
    if (arg instanceof StringExpression) {
        const nextState = ctx.generateState();
        const command = new Command({
            state: inputState,
            input: "*",
            nextState: nextState,
            actions: [new OutputAction(arg.string), new NopAction()]
        });
        ctx.addCommand(command);
        return nextState;
    } else {
        throw Error('output accepts only string');
    }
}
