// @ts-check

import { addLineNumber, Command } from "./Command.js";
import { Action, internalError } from "./actions/Action.js";
import { BRegAction } from "./actions/BRegAction.js";
import { B_INC, B_TDEC } from "./action_consts/BReg_consts.js";
import { URegAction } from "./actions/URegAction.js";
import { U_TDEC } from "./action_consts/UReg_consts.js";
import { HaltOutAction } from "./exports.js";

/**
 * @param {Action} action
 * @returns {boolean}
 */
const isBInc = (action) => {
    return action instanceof BRegAction && action.op === B_INC;
};

/**
 * @param {Action} action
 * @returns {boolean}
 */
const isUTdec = (action) => {
    return action instanceof URegAction && action.op === U_TDEC;
};

/**
 * @param {Command} command
 * @returns {undefined | { readonly tdecU: URegAction }}
 */
const getOptimizedTdecU = (command) => {
    // - 前の入力がNZであること
    // - 次の状態が自分自身であること
    // - HALT_OUTを含まないこと
    // - ActionはUまたはB_INCのみであること
    if (
        command.input === "NZ" &&
        command.state === command.nextState &&
        command.actions.every((action) => !(action instanceof HaltOutAction)) &&
        command.actions.every((action) =>
            action instanceof URegAction ||
            isBInc(action)
        )
    ) {
        // TDECは2つ以上入らないため最初を取得でよい
        const tdecU = command.actions.find(isUTdec);
        if (tdecU && tdecU instanceof URegAction) {
            return { tdecU };
        }
    }

    return undefined;
};

/**
 * @param {Command} command
 * @returns {undefined | { readonly tdecB: BRegAction }}
 */
const getOptimizedTdecB = (command) => {
    // - 前の入力がNZであること
    // - 次の状態が自分自身であること
    // - HALT_OUTを含まないこと
    // - ActionはTDEC Bのみであること
    if (
        command.input === "NZ" &&
        command.state === command.nextState &&
        command.actions.every((action) => !(action instanceof HaltOutAction)) &&
        command.actions.length === 1 &&
        command.actions.every((action) => action instanceof BRegAction)
    ) {
        // TDECは2つ以上入らないため最初を取得でよい
        const tdecB = command.actions.find((action) =>
            action instanceof BRegAction && action.op === B_TDEC
        );
        if (tdecB && tdecB instanceof BRegAction) {
            return { tdecB };
        }
    }

    return undefined;
};

/**
 * コマンドと次の状態
 */
export class CompiledCommandWithNextState {
    /**
     * @param {Command} command
     * @param {number} nextState
     */
    constructor(command, nextState) {
        /**
         * @readonly
         */
        this.command = command;

        /**
         * 次の状態の添字
         * @readonly
         */
        this.nextState = nextState;

        this.tdecuOptimize = getOptimizedTdecU(command);
        this.tdecbOptimize = getOptimizedTdecB(command);
    }
}

export class CompiledCommand {
    /**
     * @param {CompiledCommandWithNextState | undefined} z Zの場合
     * @param {CompiledCommandWithNextState | undefined} nz NZの場合
     */
    constructor(z, nz) {
        /**
         * Zの場合
         */
        this.z = z;

        /**
         * NZの場合
         */
        this.nz = nz;
    }
}

/**
 * @param {Command} oldCommand
 * @param {Command} command
 */
const throwDuplicated = (oldCommand, command) => {
    throw Error(
        `Duplicated command: "${oldCommand.pretty()}" and "${command.pretty()}"${
            addLineNumber(command)
        }`,
    );
};

/**
 * 速く実行できる形式へ変換する
 * @param {ReadonlyArray<Command>} commands
 * @returns {{
 *   readonly states: string[];
 *   readonly stateMap: Map<string, number>;
 *   readonly lookup: CompiledCommand[];
 * }}
 */
export const commandsToLookupTable = (commands) => {
    /**
     * 状態名から添字へのMap
     * @type {Map<string, number>}
     */
    const stateMap = new Map();

    /** @type {CompiledCommand[]} */
    const lookup = [];

    // lookupを初期化
    for (const command of commands) {
        // 記録されていない場合追加
        if (!stateMap.has(command.state)) {
            stateMap.set(command.state, stateMap.size);
            lookup.push(new CompiledCommand(undefined, undefined));
        }
    }

    for (const command of commands) {
        const compiledCommand =
            lookup[stateMap.get(command.state) ?? internalError()] ??
                internalError();
        const nextState = stateMap.get(command.nextState);
        // 次の状態が見つからない場合はエラー
        if (nextState === undefined) {
            throw Error(
                `Unknown state: "${command.nextState}" at "${command.pretty()}"${
                    addLineNumber(command)
                }`,
            );
        }

        switch (command.input) {
            case "Z": {
                if (compiledCommand.z === undefined) {
                    // 新しく作成する
                    compiledCommand.z = new CompiledCommandWithNextState(
                        command,
                        nextState,
                    );
                } else {
                    throwDuplicated(compiledCommand.z.command, command);
                }
                break;
            }
            case "NZ": {
                if (compiledCommand.nz === undefined) {
                    // 新しく作成する
                    compiledCommand.nz = new CompiledCommandWithNextState(
                        command,
                        nextState,
                    );
                } else {
                    throwDuplicated(compiledCommand.nz.command, command);
                }
                break;
            }
            case "ZZ": {
                if (compiledCommand.nz !== undefined) {
                    throw Error(
                        `Invalid input: ZZ with NZ or *: "${command.pretty()}" and "${compiledCommand.nz.command.pretty()}"${
                            addLineNumber(command)
                        }`,
                    );
                } else if (compiledCommand.z === undefined) {
                    compiledCommand.z = new CompiledCommandWithNextState(
                        command,
                        nextState,
                    );
                } else {
                    throwDuplicated(compiledCommand.z.command, command);
                }
                break;
            }
            case "*": {
                if (compiledCommand.nz !== undefined) {
                    throw Error(
                        `Invalid input: * "${command.pretty()}" and "${compiledCommand.nz.command.pretty()}"${
                            addLineNumber(command)
                        }`,
                    );
                } else if (compiledCommand.z !== undefined) {
                    throw Error(
                        `Invalid input: * "${command.pretty()}" and "${compiledCommand.z.command.pretty()}"${
                            addLineNumber(command)
                        }`,
                    );
                } else {
                    const c = new CompiledCommandWithNextState(
                        command,
                        nextState,
                    );
                    compiledCommand.z = c;
                    compiledCommand.nz = c;
                }
                break;
            }
            default: {
                // type-check
                /** @type {Error} */
                const _ = command.input;
                internalError();
            }
        }
    }

    return {
        states: [...stateMap.keys()],
        stateMap,
        lookup,
    };
};
