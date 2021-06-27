// @ts-check

import { ActionExecutor } from "./ActionExecutor.js";
import { Command } from "./Command.js";
import { Program } from "./Program.js";

const INITIAL_STATE = "INITIAL";

/**
 * @typedef {"Z" | "NZ" | "ZZ" | "*"} Input
 */

/**
 * @throws
 * @param {Command[]} commands 
 * @returns {Map<string, Map<Input, Command>>} // previous state, input => command
 */
function commandsToTableMap(commands) {
    /** @type {Map<string, Map<Input, Command>>} */
    const map = new Map();
    for (const command of commands) {
        const childMap = map.get(command.state) ?? new Map();
        if (childMap.has(command.input)) {
            throw Error(`Duplicated command: "${childMap.get(command.input)?.pretty()}", "${command.pretty()}"`)
        }
        childMap.set(command.input, command);
        map.set(command.state, childMap);
    }
    return map;
}

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
        this.actionExecutor = new ActionExecutor({
            binaryRegisterNumbers: program.extractBinaryRegisterNumbers(),
            unaryRegisterNumbers: program.extractUnaryRegisterNumbers()
        });
        this.currentState = INITIAL_STATE;

        /** @type {0 | 1} */
        this.prevOutput = 0;
        this.program = program;

        /**
         * @private
         */
        this.tableMap = commandsToTableMap(program.commands);

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
     * @returns {Command}
     */
    getNextCommand() {
        const childMap = this.tableMap.get(this.currentState);
        // console.log(this.tableMap);
        if (childMap === undefined) {
            throw Error('Next state not found: current state: ' + this.currentState);
        }
        const wildcard = childMap.get('*');
        if (wildcard !== undefined) {
            return wildcard;
        }
        if (this.prevOutput === 0) {
            const z = childMap.get('Z');
            if (z !== undefined) {
                return z;
            }
            const zz = childMap.get('ZZ');
            if (zz !== undefined) {
                return zz;
            }
        } else {
            const nz = childMap.get('NZ');
            if (nz !== undefined) {
                return nz;
            }
        }
        throw Error('Next Command not found: Current state = ' + this.currentState + ', output = ' + this.getPreviousOutput());
    }

    /**
     * @returns {"HALT_OUT" | undefined}
     * @throws
     */
    execCommand() {
        const command = this.getNextCommand();

        /** @type {0 | 1 | undefined} */
        let result = undefined;

        for (const action of command.actions) {
            const res = this.actionExecutor.execAction(action);
            if (res === -1) {
                return "HALT_OUT";
            }
            if (res === 0 || res === 1) {
                if (result === undefined) {
                    result = res;
                } else {
                    throw Error('Return value twice: command = ' + command.pretty());
                }
            }
        }
        if (result === undefined) {
            throw Error('No return value');
        }

        // INITIALに返ってくることは禁止
        if (command.nextState === "INITIAL") {
            throw Error('INITIAL is return in execution: command = ' + command.pretty());
        }
        this.currentState = command.nextState;
        this.prevOutput = result;

        return undefined;
    }

    /**
     * @returns {never}
     */
    error() {
        throw Error('internal error');
    }
}
