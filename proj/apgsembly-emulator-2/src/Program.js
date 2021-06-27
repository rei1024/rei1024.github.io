// @ts-check

import { Command, Comment, ComponentsHeader, EmptyLine, RegistersHeader } from "./Command.js";

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
                // エラーメッセージ
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
            } else if (res instanceof EmptyLine) {

            } else {
                throw Error('Program.parse: internal error ' + line);
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
        const array = this.commands.flatMap(command => command.actions)
            .flatMap(action => action.extractUnaryRegisterNumbers());
        return sortNub(array);
    }

    /**
     * @returns {number[]}
     */
    extractBinaryRegisterNumbers() {
        const array = this.commands.flatMap(command => command.actions)
            .flatMap(action => action.extractBinaryRegisterNumbers());
        return sortNub(array);
    }

    /**
     * 文字列化する
     * @returns {string}
     */
    pretty() {
        let str = "";
        if (this.componentsHeader !== undefined) {
            str += this.componentsHeader.pretty() + "\n";
        }
        if (this.registersHeader !== undefined) {
            str += this.registersHeader.pretty() + "\n";
        }
        str += this.commands.map(command => command.pretty()).join('\n');

        return str.trim();
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
