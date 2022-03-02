// @ts-check

import { Command } from "../Command.js";
import { HaltOutAction } from "../actions/HaltOutAction.js";

/**
 * @returns {never}
 */
function internalError() {
    throw Error('internal error');
}

/**
 * アクションが同じコンポーネントを使用していないか検査する
 * @param {Command} command
 * @returns {string | undefined}
 */
function validateNoSameComponentCommand(command) {
    // HALT_OUTの場合は一旦無視
    // FIXME
    if (command.actions.find(x => x instanceof HaltOutAction) !== undefined) {
        return undefined;
    }
    const actions = command.actions;
    const len = actions.length;

    if (len <= 1) {
        return undefined;
    }

    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            // if (i === j) {
            //     continue;
            // }
            const a = actions[i] ?? internalError();
            const b = actions[j] ?? internalError();
            if (a.isSameComponent(b)) {
                return `Actions "${
                    a.pretty()
                }" and "${
                    b.pretty()
                }" use same component in "${command.pretty()}"`;
            }
        }
    }
    return undefined;
}

/**
 * アクションが同じコンポーネントを使用していないか検査する
 * エラーメッセージを返却する
 * @param {Command[]} commands
 * @returns {string[] | undefined}
 */
export function validateNoSameComponent(commands) {
    /** @type {string[]} */
    const errors = [];
    for (const command of commands) {
        const err = validateNoSameComponentCommand(command);
        if (typeof err === 'string') {
            errors.push(err);
        }
    }
    if (errors.length > 0) {
        return errors;
    }
    return undefined;
}
