// @ts-check

import { Command, addLineNumber } from "./Command.js";

/**
 * コマンドと次の状態
 */
export class CompiledCommandWithNextState {
    /**
     *
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
    }
}

export class CompiledCommand {
    /**
     *
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
 *
 * @param {Command} oldCommand
 * @param {Command} command
 */
function throwDuplicated(oldCommand, command) {
    throw Error(`Duplicated command: "${oldCommand.pretty()}" and "${command.pretty()}"${addLineNumber(command)}`);
}

/**
 * 速く実行できる形式へ変換する
 * @param {ReadonlyArray<Command>} commands
 * @returns {{
 *   states: string[];
 *   stateMap: Map<string, number>;
 *   lookup: CompiledCommand[];
 * }}
 */
export function commandsToLookupTable(commands) {
    /** @type {Map<string, number>} */
    const stateMap = new Map();

    /** @type {CompiledCommand[]} */
    const lookup = [];

    /**
     * @returns {never}
     */
    function error() {
        throw Error("commandsToLookupTable internal error");
    }

    // lookupを初期化
    for (const command of commands) {
        // 記録されていない場合追加
        if (!stateMap.has(command.state)) {
            const n = stateMap.size;
            stateMap.set(command.state, n);
            lookup.push(new CompiledCommand(undefined, undefined));
        }
    }

    for (const command of commands) {
        const compiledCommand = lookup[stateMap.get(command.state) ?? error()] ?? error();
        const nextState = stateMap.get(command.nextState);
        // 次の状態が見つからない場合はエラー
        if (nextState === undefined) {
            throw Error(`Unknown state: "${command.nextState}" at "${command.pretty()}"${addLineNumber(command)}`);
        }
        switch (command.input) {
            case "Z": {
                if (compiledCommand.z === undefined) {
                    // 新しく作成する
                    compiledCommand.z = new CompiledCommandWithNextState(command, nextState);
                } else {
                    throwDuplicated(compiledCommand.z.command, command);
                }
                break;
            }
            case "NZ": {
                if (compiledCommand.nz === undefined) {
                    // 新しく作成する
                    compiledCommand.nz = new CompiledCommandWithNextState(command, nextState);
                } else {
                    throwDuplicated(compiledCommand.nz.command, command);
                }
                break;
            }
            case "ZZ": {
                if (compiledCommand.nz !== undefined) {
                    throw Error(`Invalid input: ZZ with NZ or *: "${command.pretty()}" and "${compiledCommand.nz.command.pretty()}"${addLineNumber(command)}`);
                } else if (compiledCommand.z === undefined) {
                    compiledCommand.z = new CompiledCommandWithNextState(command, nextState);
                } else {
                    throwDuplicated(compiledCommand.z.command, command);
                }
                break;
            }
            case "*": {
                if (compiledCommand.nz !== undefined) {
                    throw Error(`Invalid input: * "${command.pretty()}" and "${compiledCommand.nz.command.pretty()}"${addLineNumber(command)}`);
                } else if (compiledCommand.z !== undefined) {
                    throw Error(`Invalid input: * "${command.pretty()}" and "${compiledCommand.z.command.pretty()}"${addLineNumber(command)}`);
                } else {
                    const c = new CompiledCommandWithNextState(command, nextState);
                    compiledCommand.z = c;
                    compiledCommand.nz = c;
                }
                break;
            }
            default: {
                // type-check
                /** @type {Error} */
                const inputNever = command.input;
                console.error(inputNever);
                error();
            }
        }
    }

    return {
        states: [...stateMap.keys()],
        stateMap,
        lookup
    };
}
