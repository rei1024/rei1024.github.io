// @ts-check

import { ActionExecutor } from "./ActionExecutor.js";
import { Command } from "./Command.js";
import { Program } from "./Program.js";

const INITIAL_STATE = "INITIAL";

/**
 * @typedef {"Z" | "NZ" | "ZZ" | "*"} Input
 */

/**
 * @param {Command[]} commands 
 * @returns {Map<string, Map<Input, Command>>} // previous state, input => command
 */
function commandsToTableMap(commands) {
    /** @type {Map<string, Map<Input, Command>>} */
    const map = new Map();
    for (const command of commands) {
        const childMap = map.get(command.state) ?? new Map();
        childMap.set(command.input, command);
        map.set(command.state, childMap);
    }
    return map;
}

export class Machine {
    /**
     * 
     * @param {Program} program 
     * @throws
     */
    constructor(program) {
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
                throw Error('Invalid #REGISTERS');
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
     * @returns {Command}
     */
    getNextCommand() {
        const childMap = this.tableMap.get(this.currentState);
        // console.log(this.tableMap);
        if (childMap === undefined) {
            throw Error('Next state not found: current state: ' + this.currentState);
        }
        if (childMap.has('*')) {
            return childMap.get('*') ?? this.error();
        }
        if (this.prevOutput === 0) {
            if (childMap.has('Z')) {
                return childMap.get('Z') ?? this.error();
            } else if (childMap.has('ZZ')) {
                return childMap.get('ZZ') ?? this.error();
            } else if (childMap.has('*')) {
                return childMap.get('*') ?? this.error();
            }
        } else {
            if (childMap.has('NZ')) {
                return childMap.get('NZ') ?? this.error();
            }
        }
        throw Error('Next Command not found');
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
                    throw Error('return value twice');
                }
            }
        }
        if (result === undefined) {
            throw Error('no return value');
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
