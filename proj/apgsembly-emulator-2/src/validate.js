// @ts-check

import { Command } from "./Command.js";

import { validateNextStateIsNotINITIAL } from "./validators/next_state_is_not_initial.js";
import { validateNoDuplicatedAction } from "./validators/no_dup_action.js";
import { validateActionReturnOnce } from "./validators/action_return_once.js";
import { validateNoSameComponent } from "./validators/no_same_component.js";
import { validateZAndNZ } from "./validators/z_and_nz.js";

/**
 * 全てのバリデーションを通す
 * @param {Command[]} commands
 * @returns {undefined | string} string is error
 */
export function validateAll(commands) {
    /**
     * @type {((_: Command[]) => string[] | undefined)[]}
     */
    const validators = [
        validateNoDuplicatedAction,
        validateActionReturnOnce,
        validateNoSameComponent,
        validateNextStateIsNotINITIAL,
        validateZAndNZ
    ];

    /** @type {string[]} */
    let errors = [];
    for (const validator of validators) {
        const errorsOrUndefined = validator(commands);
        if (Array.isArray(errorsOrUndefined)) {
            errors = errors.concat(errorsOrUndefined);
        }
    }

    if (errors.length > 0) {
        return errors.join('\n');
    }
    return undefined;
}
