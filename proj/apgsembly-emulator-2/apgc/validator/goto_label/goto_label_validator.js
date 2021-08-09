// @ts-check

import {
    APGCProgram,
} from "../../types/apgc_types.js";

import { extractLabelFromAPGCProgram, extractGotoLabelFromAPGCProgram } from "../extract_label.js";

/**
 * gotoの行き先が存在することを検証する
 * @param {APGCProgram} program
 * @returns {"OK" | { error: string }}
 */
export function validateGotoLabel(program) {
    const labels = extractLabelFromAPGCProgram(program);
    const labelsSet = new Set(labels);
    const gotoLabels = extractGotoLabelFromAPGCProgram(program);

    for (const gotoLabel of gotoLabels) {
        if (!labelsSet.has(gotoLabel)) {
            return {
                error: `goto("${gotoLabel}"): label does not exist`
            };
        }
    }
    return "OK";
}
