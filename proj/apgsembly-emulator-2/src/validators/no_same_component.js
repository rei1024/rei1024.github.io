// @ts-check

import { Command, commandWithLineNumber } from "../Command.js";
import { HaltOutAction } from "../actions/HaltOutAction.js";
import { internalError } from "../internalError.js";

/**
 * アクションが同じコンポーネントを使用していないか検査する
 * エラーメッセージを返却する
 * @param {Command} command
 * @returns {string | undefined}
 */
export const validateNoSameComponentCommand = (command) => {
    const actions = command.actions;

    // HALT_OUTの場合は一旦無視
    // FIXME
    if (actions.find((x) => x instanceof HaltOutAction) !== undefined) {
        return undefined;
    }

    const len = actions.length;

    if (len <= 1) {
        return undefined;
    }

    for (let i = 0; i < len; i++) {
        const a = actions[i] ?? internalError();
        for (let j = i + 1; j < len; j++) {
            const b = actions[j] ?? internalError();
            if (a.isSameComponent(b)) {
                return `Actions "${a.pretty()}" and "${b.pretty()}" use same component in ${
                    commandWithLineNumber(command)
                }`;
            }
        }
    }
    return undefined;
};
