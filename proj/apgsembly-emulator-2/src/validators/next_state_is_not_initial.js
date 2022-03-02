// @ts-check

import { Command, INITIAL_STATE } from "../Command.js";

/**
 *
 * @param {Command} command
 * @returns {string | undefined}
 */
function validateNextStateIsNotINITIALCommand(command) {
    if (command.nextState === INITIAL_STATE) {
        return `Return to initial state in "${command.pretty()}"`;
    }
    return undefined;
}

/**
 * 次の状態が初期状態でないか検査する
 * エラーメッセージを返却する
 * @param {Command[]} commands
 * @returns {string[] | undefined}
 */
export function validateNextStateIsNotINITIAL(commands) {
    /** @type {string[]} */
        const errors = [];
    for (const command of commands) {
        const err = validateNextStateIsNotINITIALCommand(command);
        if (typeof err === 'string') {
            errors.push(err);
        }
    }
    if (errors.length > 0) {
        return errors;
    }
    return undefined;
}
