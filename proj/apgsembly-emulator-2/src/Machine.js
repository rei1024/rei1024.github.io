// @ts-check

import { ActionExecutor } from "./ActionExecutor.js";
import { commandsToLookupTable, CompiledCommandWithNextState } from "./compile.js";
import { Program } from "./Program.js";

/**
 * 初期状態
 */
const INITIAL_STATE = "INITIAL";

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
        })() ;

        const regHeader = program.registersHeader;
        if (regHeader !== undefined) {
            /** @type {string} */
            const str = regHeader.content

            /** @type {import("./ActionExecutor.js").RegistersInit} */
            let parsed = {};
            try {
                parsed = JSON.parse(str);
            } catch (e) {
                throw Error('Invalid #REGISTERS: ' + str);
            }
            try {
                this.actionExecutor.setByRegistersInit(parsed);
            } catch (e) {
               throw e;
            }
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
        return this.stateMap
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
     * @throws
     * @returns {CompiledCommandWithNextState}
     */
    getNextCompiledCommandWithNextState() {
        const compiledCommand = this.lookup[this.currentStateIndex];

        if (compiledCommand === undefined) {
            throw Error('Internal Error: Next command is not found: Current state: ' + this.currentState);
        }

        if (this.prevOutput === 0) {
            const z = compiledCommand.z;
            if (z !== undefined) {
                return z;
            }
        } else {
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
     * @returns {"HALT_OUT" | undefined}
     * @throws
     */
    execCommand() {
        const compiledCommand = this.getNextCompiledCommandWithNextState();

        const command = compiledCommand.command;

        /** @type {0 | 1 | undefined} */
        let result = undefined;

        const actionExecutor = this.actionExecutor;
        for (const action of command.actions) {
            const res = actionExecutor.execAction(action);
            if (res === -1) {
                return "HALT_OUT";
            }
            if (res !== undefined) { // res === 1 || res ==== 0
                if (result === undefined) {
                    result = res;
                } else {
                    throw Error('Return value twice: command = ' + command.pretty());
                }
            }
        }
        if (result === undefined) {
            throw Error(`No return value: command = ${compiledCommand.command.pretty()}`);
        }

        // INITIALに返ってくることは禁止
        if (command.nextState === INITIAL_STATE) {
            throw Error('INITIAL is return in execution: command = ' + command.pretty());
        }
        this.currentStateIndex = compiledCommand.nextState;
        this.prevOutput = result;
        return undefined;
    }
}
