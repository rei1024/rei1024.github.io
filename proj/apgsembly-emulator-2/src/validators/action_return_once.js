// @ts-check

import { HaltOutAction } from "../actions/HaltOutAction.js";
import { Command } from "../Command.js";

/**
 *
 * @param {Command} command
 * @returns {string | undefined}
 */
function validateActionReturnOnceCommand(command) {
    // HALT_OUTの場合は一旦無視
    // FIXME
    if (command.actions.find(x => x instanceof HaltOutAction) !== undefined) {
        return undefined;
    }
    const valueReturnActions = command.actions.filter(x => x.doesReturnValue());
    if (valueReturnActions.length === 1) {
        return undefined;
    } else if (valueReturnActions.length === 0) {
        return `Does not produce the return value in "${command.pretty()}"`;
    } else {
        return `Does not contain exactly one action that produces a return value in "${
            command.pretty()
        }": Actions that produce value are ${
            valueReturnActions.map(x => `"${x.pretty()}"`).join(', ')
        }`;
    }
}

/**
 * アクションが値を一度だけ返すか検査する
 * エラーメッセージを返却する
 * @param {Command[]} commands
 * @returns {string[] | undefined}
 */
export function validateActionReturnOnce(commands) {
    /** @type {string[]} */
    const errors = [];
    for (const command of commands) {
        const err = validateActionReturnOnceCommand(command);
        if (typeof err === 'string') {
            errors.push(err);
        }
    }
    if (errors.length > 0) {
        return errors;
    }
    return undefined;
}
