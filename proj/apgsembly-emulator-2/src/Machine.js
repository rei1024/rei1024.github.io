// @ts-check

import { ActionExecutor } from "./ActionExecutor.js";
import { commandsToLookupTable, CompiledCommandWithNextState } from "./compile.js";
import { Program } from "./Program.js";

/**
 * 初期状態
 */
export const INITIAL_STATE = "INITIAL";

/**
 * @typedef {"Z" | "NZ" | "ZZ" | "*"} Input
 */

/**
 * エミュレーター
 */
export class Machine {
    /**
     *
     * @param {Program} program
     * @throws {Error} #REGISTERSでの初期化に失敗
     */
    constructor(program) {
        if (!(program instanceof Program)) {
            throw TypeError('program is not a Program');
        }
        /**
         * @readonly
         */
        this.actionExecutor = new ActionExecutor({
            binaryRegisterNumbers: program.extractBinaryRegisterNumbers(),
            unaryRegisterNumbers: program.extractUnaryRegisterNumbers()
        });

        /** @type {0 | 1} */
        this.prevOutput = 0;

        /**
         * @readonly
         */
        this.program = program;

        const obj = commandsToLookupTable(program.commands);
        /**
         * @readonly
         */
        this.states = obj.states;
        /**
         * @readonly
         * @private
         */
        this.stateMap = obj.stateMap;
        /**
         * @readonly
         * @private
         */
        this.lookup = obj.lookup;

        /**
         * @private
         */
        this.currentStateIndex = this.stateMap.get(INITIAL_STATE) ?? (() => {
            throw Error('INITIAL state is not present');
        })();

        /**
         * @type {number}
         * @readonly
         * @private
         */
        this.initialIndex = this.currentStateIndex;

        /**
         * 統計
         * @type {{ z: number, nz: number }[]}
         */
        this.stateStats = this.lookup.map(() => ({ z: 0, nz: 0 }));

        const regHeader = program.registersHeader;
        if (regHeader !== undefined) {
            /** @type {string} */
            const str = regHeader.content;

            /** @type {import("./ActionExecutor.js").RegistersInit} */
            let parsed = {};
            try {
                parsed = JSON.parse(str);
            } catch (e) {
                throw Error(`Invalid #REGISTERS: is not a valid JSON: ${str}`);
            }
            if (parsed === null || typeof parsed !== 'object') {
                throw Error(`Invalid #REGISTERS: "${str}" is not an object`);
            }

            // throw if error is occurred
            this.actionExecutor.setByRegistersInit(parsed);
        }
    }

    /**
     * 現在の状態の名前
     * @returns {string}
     */
    get currentState() {
        const name = this.states[this.currentStateIndex];
        if (name === undefined) {
            throw Error('State name is not found');
        }
        return name;
    }

    /**
     * 現在の状態の添字を取得する
     * @returns {number}
     */
    getCurrentStateIndex() {
        return this.currentStateIndex;
    }

    /**
     * 状態の文字列から添字へのマップを取得する
     * @returns {Map<string, number>}
     */
    getStateMap() {
        return this.stateMap;
    }

    /**
     * 前回の出力を取得する
     * @returns {"Z" | "NZ"}
     */
    getPreviousOutput() {
        if (this.prevOutput === 0) {
            return "Z";
        } else {
            return "NZ";
        }
    }

    /**
     * @param {boolean} [logStats=false] 記録する
     * @throws
     * @returns {CompiledCommandWithNextState}
     */
    getNextCompiledCommandWithNextState(logStats = false) {
        const compiledCommand = this.lookup[this.currentStateIndex];

        if (compiledCommand === undefined) {
            throw Error(`Internal Error: Next command is not found: Current state: this.currentState`);
        }

        if (this.prevOutput === 0) {
            if (logStats) {
                const stat = this.stateStats[this.currentStateIndex];
                if (stat === undefined) { throw Error('Internal error'); }
                stat.z += 1;
            }
            const z = compiledCommand.z;
            if (z !== undefined) {
                return z;
            }
        } else {
            if (logStats) {
                const stat = this.stateStats[this.currentStateIndex];
                if (stat === undefined) { throw Error('Internal error'); }
                stat.nz += 1;
            }
            const nz = compiledCommand.nz;
            if (nz !== undefined) {
                return nz;
            }
        }
        throw Error('Next command is not found: Current state = ' + this.currentState + ', output = ' + this.getPreviousOutput());
    }

    /**
     * 次のコマンドを実行する
     * エラーが発生した場合は例外を投げる
     * -1はHALT_OUT
     * @returns {-1 | undefined}
     * @throws
     */
    execCommand() {
        const compiledCommand = this.getNextCompiledCommandWithNextState(true);

        /** @type {0 | 1 | undefined} */
        let result = undefined;

        const actionExecutor = this.actionExecutor;
        for (const action of compiledCommand.command.actions) {
            const actionResult = actionExecutor.execAction(action);
            if (actionResult === -1) {
                return -1;
            }
            if (actionResult !== undefined) { // res === 1 || res ==== 0
                if (result === undefined) {
                    result = actionResult;
                } else {
                    throw Error(`Return value twice: line = ${compiledCommand.command.pretty()}`);
                }
            }
        }
        if (result === undefined) {
            throw Error(`No return value: line = ${compiledCommand.command.pretty()}`);
        }

        // INITIALに返ってくることは禁止
        const nextStateIndex = compiledCommand.nextState;
        if (nextStateIndex === this.initialIndex) {
            throw Error(`Return to INITIAL state during execution: line = ${compiledCommand.command.pretty()}`);
        }
        this.currentStateIndex = nextStateIndex;
        this.prevOutput = result;
        return undefined;
    }
}
