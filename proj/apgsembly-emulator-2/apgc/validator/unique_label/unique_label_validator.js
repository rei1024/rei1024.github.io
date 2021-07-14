// @ts-check

import {
    APGCProgram,
} from "../../types/apgc_types.js";

import { extractLabelFromAPGCProgram } from "../extract_label.js";

/**
 * labelがユニークであることを検証する
 * @param {APGCProgram} program 
 * @returns {"OK" | { error: string }}
 */
export function validateUniqueLabel(program) {
    const labels = extractLabelFromAPGCProgram(program);
    const set = new Set(labels);
    if (set.size === labels.length) {
        return "OK";
    } else {
        labels.sort();
        for (let i = 0; i < labels.length - 1; i++) {
            const a = labels[i];
            const b = labels[i + 1];
            if (a === b) {
                return {
                    error: `label("${a}") is not unique`
                };
            }
        }
        throw Error('validateUniqueLabel: internal error');
    }
}
