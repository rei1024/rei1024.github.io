// @ts-check

import { format, ProgramLines } from "../../src/ProgramLines.js";
// import { ProgramLines } from "../src/ProgramLines.js";
// import { Command, ProgramLine } from "../src/Command.js";
// import { LegacyTRegAction, T_DEC, T_INC, T_READ, T_RESET, T_SET } from "../src/actions/LegacyTRegAction.js";
// import { Action, HaltOutAction, NopAction } from "../src/exports.js";
// import { BRegAction, B_INC, B_READ, B_SET, B_TDEC } from "../src/actions/BRegAction.js";
// import { validateActionReturnOnceCommand } from "../src/validators/action_return_once.js";
// import { validateNoSameComponentCommand } from "../src/validators/no_same_component.js";

// function transpileT(program) {
//     const oldLines = program.programLines.getArray().slice();

//     /**
//      * @type {ProgramLine[]}
//      */
//     const lines = [];

//     /**
//      * @type {ProgramLine[]}
//      */
//     const tempLines = [];
//     for (const [lineNum, line] of oldLines.entries()) {
//         if (line instanceof Command) {
//             const oldActions = line.actions.slice();

//             /**
//              * @type {Action[]}
//              */
//             const actions = [];

//             for (const action of oldActions) {
//                 if (action instanceof LegacyTRegAction) {
//                     switch (action.op) {
//                         case T_DEC: {
//                             actions.push(new BRegAction(B_TDEC, action.regNumber));
//                             break;
//                         }
//                         case T_INC: {
//                             actions.push(new BRegAction(B_INC, action.regNumber));
//                             break;
//                         }
//                         case T_SET: {
//                             actions.push(new BRegAction(B_SET, action.regNumber));
//                             break;
//                         }
//                         case T_READ: {
//                             actions.push(new BRegAction(B_READ, action.regNumber));
//                             break;
//                         }
//                         case T_RESET: {
//                             actions.push(new BRegAction(B_READ, action.regNumber));
//                             break;
//                         }
//                     }
//                 } else {
//                     actions.push(action);
//                 }
//             }

//             if (!actions.some(a => a instanceof HaltOutAction) &&
//                 actions.every(a => !a.doesReturnValue())) {
//                 actions.push(new NopAction());
//             }

//             if (actions.some(a => a instanceof HaltOutAction)) {
//                 lines.push(new Command({
//                     state: line.state,
//                     nextState: line.nextState,
//                     input: line.input,
//                     actions: actions
//                 }));
//             } else {
//                 const tempCommand = new Command({
//                     state: line.state,
//                     nextState: line.nextState,
//                     input: line.input,
//                     actions: actions
//                 });
//                 if (validateActionReturnOnceCommand(tempCommand) !== undefined ||
//                     validateNoSameComponentCommand(tempCommand) !== undefined) {
//                     for (const [i, action] of actions.entries()) {
//                         const newCommand = new Command({
//                             state: i === 0 ? line.state : `${line.state}__${i - 1}__${lineNum}`,
//                             nextState: i === actions.length - 1 ? line.nextState : `${line.state}__${i}__${lineNum}`,
//                             input: i === 0 ? line.input : '*',
//                             actions: action.doesReturnValue() ? [action] : [action, new NopAction()],
//                         });
//                         if (i === 0 && (line.input === "Z" || line.input === "NZ")) {
//                             lines.push(newCommand);
//                         } else {
//                             tempLines.push(newCommand);
//                         }
//                     }
//                 } else {
//                     lines.push(tempCommand);
//                 }
//             }
//         } else {
//             lines.push(line);
//         }
//     }

//     lines.push(...tempLines);

//     return new Program(new ProgramLines(lines));
// }

/**
 * @param {string} input
 * @returns {string | Error}
 */
export function transpile(input) {
    const program = ProgramLines.parse(input);
    if (program instanceof ProgramLines) {
        return format(program);
    } else {
        return new Error(program);
    }
}
