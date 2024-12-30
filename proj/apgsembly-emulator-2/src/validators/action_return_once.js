// @ts-check

import { HaltOutAction } from "../actions/HaltOutAction.js";
import { addLineNumber, Command, commandWithLineNumber } from "../Command.js";

/**
 * アクションが値を一度だけ返すか検査する
 * エラーメッセージを返却する
 * @param {Command} command
 * @returns {string | undefined}
 */
export const validateActionReturnOnceCommand = (command) => {
    // FIXME: HALT_OUTが含まれる場合は一旦無視
    const actions = command.actions;
    if (actions.some((x) => x instanceof HaltOutAction)) {
        return undefined;
    }

    const valueReturnActions = actions.filter((x) => x.doesReturnValue());
    if (valueReturnActions.length === 1) {
        return undefined;
    } else if (valueReturnActions.length === 0) {
        return `Does not return a value in ${commandWithLineNumber(command)}`;
    } else {
        return `Does not contain exactly one action that returns a value in "${command.pretty()}": Actions that produce value are ${
            valueReturnActions.map((x) => `"${x.pretty()}"`).join(", ")
        }${addLineNumber(command)}`;
    }
};
