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
import { LegacyTRegAction } from "./actions/LegacyTRegAction.js";
import { ADD } from "./components/ADD.js";
import { B2D } from "./components/B2D.js";
import { BReg } from "./components/BReg.js";
// import { HALTOUT } from "./components/HALT_OUT.js";
import { MUL } from "./components/MUL.js";
import { NOP } from "./components/NOP.js";
import { OUTPUT } from "./components/OUTPUT.js";
import { SUB } from "./components/SUB.js";
import { UReg } from "./components/UReg.js";
import { LegacyTReg } from "./components/LegacyTReg.js";

/**
 * @param {string} type
 * @param {number} regNum
 * @returns {never}
 */
function throwNotFound(type, regNum) {
    throw new Error(`Register ${type}${regNum} is not found.`);
}

/**
 * #REGISTERSのJSON
 * Uの場合はnumberのみ
 * Bのときはポインタとバイナリの文字列の配列である場合はそのまま設定する。
 * 数字である場合は二進数に変換してそれを逆さまにして配列へ設定する。ポインタは0とする。TODO コンパイラを確認
 * @typedef {{ [reg: string]: unknown }} RegistersInit
 */

/**
 * Execute an action
 */
export class ActionExecutor {
    /**
     * 使用するレジスタ番号を引数に取る
     * @param {{
     *    unaryRegisterNumbers: number[];
     *    binaryRegisterNumbers: number[];
     *    legacyTRegisterNumbers: number[];
     * }} param0
     */
    constructor({ unaryRegisterNumbers, binaryRegisterNumbers, legacyTRegisterNumbers }) {
        /**
         * @readonly
         */
        this.unaryRegisterNumbers = unaryRegisterNumbers;

        /**
         * @readonly
         */
        this.binaryRegisterNumbers = binaryRegisterNumbers;

        /**
         * @readonly
         */
        this.uRegMap = new Map(this.unaryRegisterNumbers.map(n => [n, new UReg()]));

        /**
         * @readonly
         */
        this.bRegMap = new Map(this.binaryRegisterNumbers.map(n => [n, new BReg()]));

        /**
         * @readonly
         */
        this.legecyTRegMap = new Map(legacyTRegisterNumbers.map(n => [n, new LegacyTReg()]));

        /**
         * @readonly
         */
        this.add = new ADD();

        /**
         * @readonly
         */
        this.sub = new SUB();

        /**
         * @readonly
         */
        this.mul = new MUL();

        /**
         * @readonly
         */
        this.b2d = new B2D();

        /**
         * @readonly
         */
        this.output = new OUTPUT();

        /**
         * @readonly
         */
        this.nop = new NOP();

        // this.haltOut = new HALTOUT();
    }

    /**
     * `#REGISTERS`による初期化
     * @param {RegistersInit} regInit オブジェクト
     * @throws 不正な形式の場合
     */
    setByRegistersInit(regInit) {
        for (const [key, value] of Object.entries(regInit)) {
            this.setKeyValue(key, value);
        }
    }

    /**
     * @private
     * @param {string} key
     * @param {unknown} value
     * @throws
     */
    setKeyValue(key, value) {
        if (key.startsWith('U')) {
            const n = parseInt(key.slice(1), 10);
            if (isNaN(n)) {
                const debugStr = `"${key}": ${JSON.stringify(value)}`;
                throw Error(`Invalid #REGISTERS ${debugStr}`);
            }
            const reg = this.getUReg(n);
            if (reg === undefined) {
                throw Error(`Invalid #REGISTERS: U${n} isn't used in the program`);
            }
            reg.setByRegistersInit(key, value);
        } else if (key.startsWith('B')) {
           const n = parseInt(key.slice(1), 10);
            if (isNaN(n)) {
                const debugStr = `"${key}": ${JSON.stringify(value)}`;
                throw Error(`Invalid #REGISTERS ${debugStr}`);
            }
            const reg = this.getBReg(n);
            if (reg === undefined) {
                throw Error(`Invalid #REGISTERS: B${n} isn't used in the program`);
            }
            reg.setByRegistersInit(key, value);
        } else {
            const debugStr = `"${key}": ${JSON.stringify(value)}`;
            throw Error(`Invalid #REGISTERS ${debugStr}`);
        }
    }

    /**
     * `-1`が正常終了
     * `-1` is success
     * @param {Action} action
     * @returns {0 | 1 | -1 | void}
     * @throws
     */
    execAction(action) {
        // pi calculator
        // B   316273800
        // U   311341639
        // ADD  49761893
        // MUL    407820
        // SUB   2251968
        // NOP   3771596
        if (action instanceof BRegAction) {
            const bReg = this.bRegMap.get(action.regNumber) ?? throwNotFound("B", action.regNumber);
            return bReg.action(action);
        } else if (action instanceof URegAction) {
            const uReg = this.uRegMap.get(action.regNumber) ?? throwNotFound("U", action.regNumber);
            return uReg.action(action);
        } else if (action instanceof AddAction) {
            return this.add.action(action);
        } else if (action instanceof NopAction) {
            return this.nop.action();
        } else if (action instanceof SubAction) {
            return this.sub.action(action);
        } else if (action instanceof MulAction) {
            return this.mul.action(action);
        } else if (action instanceof B2DAction) {
            return this.b2d.action(action);
        } else if (action instanceof OutputAction) {
            return this.output.action(action);
        } else if (action instanceof HaltOutAction) {
            return -1;
        } else if (action instanceof LegacyTRegAction) {
            const tReg = this.legecyTRegMap.get(action.regNumber) ?? throwNotFound("T", action.regNumber);
            return tReg.action(action);
        }
        throw Error(`execAction: unknown action ${action.pretty()}`);
    }

    /**
     *
     * @param {number} n
     * @returns {UReg | undefined}
     */
    getUReg(n) {
        return this.uRegMap.get(n);
    }

    /**
     *
     * @param {number} n
     * @returns {BReg | undefined}
     */
    getBReg(n) {
        return this.bRegMap.get(n);
    }
}
