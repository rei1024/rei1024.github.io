// @ts-check

import { Action } from "./actions/Action.js";
import {} from "./actions/AddAction.js";
import {} from "./actions/B2DAction.js";
import {} from "./actions/BRegAction.js";
import { HaltOutAction } from "./actions/HaltOutAction.js";
import {} from "./actions/MulAction.js";
import { NopAction } from "./actions/NopAction.js";
import {} from "./actions/OutputAction.js";
import { parseAction } from "./parser/parseAction.js";
import {} from "./actions/SubAction.js";
import {} from "./actions/URegAction.js";
import {} from "./actions/LegacyTRegAction.js";

import {} from "./components/ADD.js";
import {} from "./components/B2D.js";
import {} from "./components/BReg.js";
import {} from "./components/MUL.js";
import {} from "./components/NOP.js";
import {} from "./components/OUTPUT.js";
import {} from "./components/SUB.js";
import {} from "./components/UReg.js";
import {} from "./components/LegacyTReg.js";

import {} from "./validators/action_return_once.js";
import {} from "./validators/next_state_is_not_initial.js";
import {} from "./validators/no_dup_action.js";
import {} from "./validators/no_same_component.js";
import {} from "./validators/z_and_nz.js";

import {} from "./ActionExecutor.js";
import {} from "./Command.js";
import {} from "./compile.js";
import { Machine } from "./Machine.js";
import {} from "./Program.js";
import { format, ProgramLines } from "./ProgramLines.js";
import {} from "./validate.js";

// for APGM
export { Action, HaltOutAction, NopAction, parseAction };

/**
 * used by APGM testing
 * @param {string} src
 * @returns {Machine}
 */
export function runAPGsembly(src) {
    const machine = Machine.fromString(src);
    while (true) {
        const res = machine.execCommand();
        if (res === -1) {
            break;
        }
    }

    return machine;
}

/**
 * APGsemblyをフォーマットする
 * APGMの出力に使用する
 * TODO: テンプレートには未対応
 * @param {string} src
 * @returns {string}
 * @throws パース不可
 */
export function formatAPGsembly(src) {
    const lines = ProgramLines.parse(src);
    if (typeof lines === "string") {
        throw new Error(lines);
    }
    return format(lines);
}
