// @ts-check

import { Command } from "./Command.js";

/**
 * 同じアクションが複数含まれていないか検査する
 * エラーメッセージを返却する
 * @param {Command[]} commands
 * @returns {string | undefined}
 */
export function validateNoDuplicatedAction(commands) {
    for (const command of commands) {
        const err = validateNoDuplicatedActionCommand(command);
        if (typeof err === 'string') {
            return err;
        }   
    }
    return undefined;
}

/**
 * 
 * @param {Command} command 
 * @returns {string | undefined}
 */
function validateNoDuplicatedActionCommand(command) {
    if (command.actions.length <= 1) {
        return undefined;
    }
    const actionStrs = command.actions.map(x => x.pretty());
    actionStrs.sort();
    for (let i = 0; i < actionStrs.length - 1; i++) {
        const act1 = actionStrs[i];
        const act2 = actionStrs[i + 1];
        if (act1 === act2) {
            return `Duplicated actions "${act1}" in "${command.pretty()}"`;
        }
    }
    return undefined;
}
