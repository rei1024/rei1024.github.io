// @ts-check

import { Command, INITIAL_STATE, addLineNumber } from "../Command.js";

/**
 * 次の状態が初期状態でないか検査する
 * エラーメッセージを返却する
 * @param {Command} command
 * @returns {string | undefined}
 */
export function validateNextStateIsNotINITIALCommand(command) {
    if (command.nextState === INITIAL_STATE) {
        return `Return to initial state in "${command.pretty()}"${addLineNumber(command)}`;
    }
    return undefined;
}
