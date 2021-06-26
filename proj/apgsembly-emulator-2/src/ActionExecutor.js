// @ts-check

import { Action } from "./actions/Action.js";
import { AddAction } from "./actions/AddAction.js";
import { B2DAction } from "./actions/B2DAction.js";
import { BRegAction } from "./actions/BRegAction.js";
import { HaltOutAction } from "./actions/HaltOutAction.js";
import { MulAction } from "./actions/MulAction.js";
import { NopAction } from "./actions/NopAction.js";
import { OutputAction } from "./actions/OutputAction.js";
import { SubAction } from "./actions/SubAction.js";
import { URegAction } from "./actions/URegAction.js";
import { ADD } from "./components/ADD.js";
import { B2D } from "./components/B2D.js";
import { BReg } from "./components/BReg.js";
// import { HALTOUT } from "./components/HALT_OUT.js";
import { MUL } from "./components/MUL.js";
import { NOP } from "./components/NOP.js";
import { OUTPUT } from "./components/OUTPUT.js";
import { SUB } from "./components/SUB.js";
import { UReg } from "./components/UReg.js";

/**
 * #REGISTERSのJSON
 * @typedef {{ [reg: string]: number | [number, string] }} RegistersInit
 */

/**
 * 
 * @param {string} str '01011101'
 * @returns {(0 | 1)[]}
 * @throws
 */
function parseBits(str) {
    return [...str].map(c => {
        if (c === '0') {
            return 0;
        } else if (c === '1') {
            return 1;
        } else {
            throw Error('Invalid #REGISTERS: ' + str);
        }
    });
}

export class ActionExecutor {
    /**
     * 
     * @param {{
     *    unaryRegisterNumbers: number[];
     *    binaryRegisterNumbers: number[];
     * }} param0 
     */
    constructor({ unaryRegisterNumbers, binaryRegisterNumbers }) {
        this.unaryRegisterNumbers = unaryRegisterNumbers;
        this.binaryRegisterNumbers = binaryRegisterNumbers;

        this.uRegMap = new Map(this.unaryRegisterNumbers.map(n => [n, new UReg()]));

        this.bRegMap = new Map(this.binaryRegisterNumbers.map(n => [n, new BReg()]));

        this.add = new ADD();

        this.sub = new SUB();

        this.mul = new MUL();

        this.b2d = new B2D();

        this.output = new OUTPUT();

        this.nop = new NOP();

        // this.haltOut = new HALTOUT();
    }

    /**
     * 
     * @param {RegistersInit} regInit 
     * @throws
     */
    setByRegistersInit(regInit) {
        for (const [key, value] of Object.entries(regInit)) {
            const debugStr = `"${key}": ${JSON.stringify(value)}`
            if (key.startsWith('U')) {
                const n = parseInt(key.slice(1), 10);
                if (isNaN(n)) {
                    throw Error('Invalid #REGISTERS ' + debugStr);
                }
                if (typeof value !== "number") {
                    throw Error('Invalid #REGISTERS ' + debugStr);
                }
                const reg = this.uRegMap.get(n);
                if (reg === undefined) {
                    throw Error(`U${n} does not exist`);
                }
                reg.setValue(value);
            } else if (key.startsWith('B')) {
               const n = parseInt(key.slice(1), 10);
                if (isNaN(n)) {
                    throw Error('Invalid #REGISTERS ' + debugStr);
                }
                const reg = this.bRegMap.get(n);
                if (reg === undefined) {
                    throw Error(`B${n} does not exist`);
                }
                // 数字の場合の処理は数字をバイナリにして配置する
                if (typeof value === 'number') {
                    reg.setBits(parseBits(value.toString(2)).reverse());
                    reg.extend();
                    continue;
                }
                if (!Array.isArray(value)) {
                    throw Error('Invalid #REGISTERS ' + debugStr);
                }
                if (value.length !== 2) {
                    throw Error('Invalid #REGISTERS ' + debugStr);
                }
                reg.pointer = value[0];
                reg.setBits(parseBits(value[1]));
            } else {
                throw Error('Invalid #REGISTERS ' + debugStr);
            }
        }
    }

    /**
     * `-1`が正常終了
     * @param {Action} action 
     * @returns {0 | 1 | -1 | void}
     * @throws
     */
    execAction(action) {
        if (action instanceof BRegAction) {
            return this.bRegMap.get(action.regNumber)?.action(action);
        } else if (action instanceof URegAction) {
            return this.uRegMap.get(action.regNumber)?.action(action);
        } else if (action instanceof B2DAction) {
            return this.b2d.action(action);
        } else if (action instanceof AddAction) {
            return this.add.action(action);
        } else if (action instanceof MulAction) {
            return this.mul.action(action);
        } else if (action instanceof SubAction) {
            return this.sub.action(action);
        } else if (action instanceof NopAction) {
            return this.nop.action(action);
        } else if (action instanceof OutputAction) {
            return this.output.action(action);
        } else if (action instanceof HaltOutAction) {
            return -1;
        }
        throw Error('execAction: unkown action ' + action.pretty());
    }
}
