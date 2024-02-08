// @ts-check

import { Action } from "./actions/Action.js";
import { AddAction } from "./actions/AddAction.js";
import { B2DAction } from "./actions/B2DAction.js";
import { BRegAction } from "./actions/BRegAction.js";
import { HaltOutAction } from "./actions/HaltOutAction.js";
import { MulAction } from "./actions/MulAction.js";
import { NopAction } from "./actions/NopAction.js";
import { OutputAction } from "./actions/OutputAction.js";
import { SubAction } from "./actions/SubAction.js";
import { URegAction } from "./actions/URegAction.js";
import { LegacyTRegAction } from "./actions/LegacyTRegAction.js";

/**
 * アクションをパースする
 * @param {string} str
 * @returns {Action | undefined}
 */
export const parseAction = (str) => {
    /**
     * @type {((str: string) => Action | undefined)[]}
     */
    const parsers = [
        BRegAction.parse,
        URegAction.parse,
        B2DAction.parse,
        NopAction.parse,
        AddAction.parse,
        MulAction.parse,
        SubAction.parse,
        OutputAction.parse,
        HaltOutAction.parse,
        LegacyTRegAction.parse,
    ];

    for (const parser of parsers) {
        const result = parser(str);
        if (result !== undefined) {
            return result;
        }
    }

    return undefined;
};
