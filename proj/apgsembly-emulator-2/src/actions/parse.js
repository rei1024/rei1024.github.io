// @ts-check

import { Action } from "./Action.js";
import { AddAction } from "./AddAction.js";
import { B2DAction } from "./B2DAction.js";
import { BRegAction } from "./BRegAction.js";
import { HaltOutAction } from "./HaltOutAction.js";
import { MulAction } from "./MulAction.js";
import { NopAction } from "./NopAction.js";
import { OutputAction } from "./OutputAction.js";
import { SubAction } from "./SubAction.js";
import { URegAction } from "./URegAction.js";
import { LegacyTRegAction } from "./LegacyTRegAction.js";

/**
 * アクションをパースする
 * @param {string} str
 * @returns {Action | undefined}
 */
export function parseAction(str) {
    /**
     * @type {((str: string) => Action | undefined)[]}
     */
    const parsers = [
        BRegAction.parse,
        URegAction.parse,
        B2DAction.parse,
        AddAction.parse,
        MulAction.parse,
        SubAction.parse,
        NopAction.parse,
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
}
