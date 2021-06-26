// @ts-check

import { Command, Comment, ComponentsHeader, RegistersHeader } from "./Command.js";

/**
 * APGsembly program
 */
export class Program {
    /**
     * 
     * @param {{
     *   commands: Command[];
     *   componentsHeader: ComponentsHeader | undefined;
     *   registersHeader: RegistersHeader | undefined;
     * }} param0 
     */
    constructor({
        commands,
        componentsHeader,
        registersHeader,
    }) {
        this.commands = commands;
        this.componentsHeader = componentsHeader;
        this.registersHeader = registersHeader;
    }

    /**
     * プログラムまたはエラーメッセージ
     * Program or error message
     * @param {string} str
     * @returns {Program | string}
     */
    static parse(str) {
        const lines = str.split(/\r\n|\n|\r/);
        const commands = [];
        /** @type {undefined | RegistersHeader} */
        let registersHeader = undefined;
        /** @type {undefined | ComponentsHeader} */
        let componentsHeader = undefined;
        for (const line of lines) {
            const res = Command.parse(line);
            if (typeof res === 'string') {
                return res;
            } else if (res instanceof Command) {
                commands.push(res);
            } else if (res instanceof Comment || res === undefined) {
                // nothing
            } else if (res instanceof RegistersHeader) {
                if (registersHeader !== undefined) {
                    return 'Multiple #REGISTER';
                }
                registersHeader = res;
            } else if (res instanceof ComponentsHeader) {
                if (componentsHeader !== undefined) {
                    return 'Multiple #COMPONENTS';
                }
                componentsHeader = res;
            }
        }

        if (commands.length === 0) {
            return 'Program is empty';
        }

        return new Program({
            commands: commands,
            registersHeader: registersHeader,
            componentsHeader: componentsHeader
        });
    }

    /**
     * @returns {number[]}
     */
    extractUnaryRegisterNumbers() {
        const array = this.commands.flatMap(command => command.actions).flatMap(action => action.extractUnaryRegisterNumbers());
        return sortNub(array);
    }

    /**
     * @returns {number[]}
     */
    extractBinaryRegisterNumbers() {
        const array = this.commands.flatMap(command => command.actions).flatMap(action => action.extractBinaryRegisterNumbers());
        return sortNub(array);
    }
}

/**
 * 要素を一意にしてソートする
 * @param {number[]} array 
 * @returns {number[]}
 */
function sortNub(array) {
    return [...new Set(array)].sort((a, b) => a - b);
}
