// @ts-check

import { addLineNumber, Command } from "../Command.js";

/**
 * 同じアクションが複数含まれていないか検査する
 * エラーメッセージを返却する
 * @param {Command} command
 * @returns {string | undefined}
 */
export function validateNoDuplicatedActionCommand(command) {
    const actions = command.actions;
    if (actions.length <= 1) {
        return undefined;
    }
    const actionStrs = actions.map(x => x.pretty());
    actionStrs.sort();
    const maxIndex = actionStrs.length - 1;
    for (let i = 0; i < maxIndex; i++) {
        const act1 = actionStrs[i];
        const act2 = actionStrs[i + 1];
        if (act1 === act2) {
            return `Duplicated actions "${act1}" in "${command.pretty()}"${addLineNumber(command)}`;
        }
    }
    return undefined;
}
