// @ts-check

import { Command } from "./Command.js";

import { validateNextStateIsNotINITIALCommand } from "./validators/next_state_is_not_initial.js";
import { validateNoDuplicatedActionCommand } from "./validators/no_dup_action.js";
import { validateActionReturnOnceCommand } from "./validators/action_return_once.js";
import { validateNoSameComponentCommand } from "./validators/no_same_component.js";
import { validateZAndNZ } from "./validators/z_and_nz.js";

/**
 * 全てのバリデーションを通す
 * @param {ReadonlyArray<Command>} commands
 * @returns {undefined | string} string is error
 */
export function validateAll(commands) {
    /** @type {string[]} */
    let errors = [];

    /**
     * @type {((_: Command) => string | undefined)[]}
     */
    const singleCommandValidators = [
        validateNoDuplicatedActionCommand,
        validateActionReturnOnceCommand,
        validateNoSameComponentCommand,
        validateNextStateIsNotINITIALCommand,
    ];

    for (const command of commands) {
        for (const validator of singleCommandValidators) {
            const errorOrUndefined = validator(command);
            if (typeof errorOrUndefined === "string") {
                errors.push(errorOrUndefined);
            }
        }
    }

    /**
     * @type {((_: ReadonlyArray<Command>) => string[] | undefined)[]}
     */
    const validators = [validateZAndNZ];

    for (const validator of validators) {
        const errorsOrUndefined = validator(commands);
        if (errorsOrUndefined !== undefined) {
            errors = errors.concat(errorsOrUndefined);
        }
    }

    if (errors.length > 0) {
        return errors.join("\n");
    }

    return undefined;
}
