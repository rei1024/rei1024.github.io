// @ts-check

import { APGCProgram } from "../types/apgc_types.js";
import { validateGotoLabel } from "./goto_label/goto_label_validator.js";
import { validateUniqueLabel } from "./unique_label/unique_label_validator.js";

/**
 * 検証
 * @param {APGCProgram} apgcProgram
 * @throws
 */
 export function validate(apgcProgram) {
    const uniquelabelMsg = validateUniqueLabel(apgcProgram);
    if (uniquelabelMsg !== 'OK') {
        throw Error(uniquelabelMsg.error);
    }
    const gotoLabelMsg = validateGotoLabel(apgcProgram);
    if (gotoLabelMsg !== 'OK') {
        throw Error(gotoLabelMsg.error);
    }
}
