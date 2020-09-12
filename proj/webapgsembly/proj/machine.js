import * as Type from './type.js'
import * as Parse from './parse.js'
import * as Table from './lookup.js'
import { Memory } from './memory.js'
import { Tape } from './tape.js'
import { prettyActions } from './action.js'

export class Machine {
    /**
     * 
     * @param {{
    states: string[];
    array: {
        Z: {
            nextState: number;
            actions: Array<{kind: number}>;
        };
        NZ: {
            nextState: number;
            actions: Array<{kind: number}>;
        };
    }[];
}} param0 
     * @param {string} initialStateName 
     */
    constructor({ states, array }, initialStateName = "INITIAL") {
        const { r: maxR, t: maxT } = Parse.extractRegister(array);
        this.tapes = Array(maxT + 1).fill(0).map(v => new Tape());
        /** @type {Array<number>} */
        this.regs = Array(maxR + 1).fill(0);
        const initialId = states.findIndex(x => x === initialStateName);
        if (initialId === -1) {
            throw Error("Initialization failed: Can't find " + initialStateName);
        }
        /** @type {number} */
        this.state = initialId;
        /** @type {0 | 1 | null} */
        this.prevOutput = Type.Z;
        this.array = array;
        /** @type {Array<string>} */
        this.states = states;
        this.memory = new Memory();
        this.output_text = "";
        this.mul_reg = 0;
        this.sub_reg = 0;
        this.add_reg = 0;
    }

    toString() {
        return this.getStateName() + " prev:" + this.prevOutput + 
        " R: [" + this.regs + "] T: [" + this.tapes.map(x => x.toString()) + "]" + 
        " ADD " + this.toStringAddReg() + ", " + "SUB " + this.toStringSubReg() + "," + "MUL " + this.toStringMulReg() + 
        "\nmemory\n" + this.memory.toString();
    }

    toStringMulReg() {
        return this.mul_reg.toString(2).padStart(5, '0');
    }

    toStringSubReg() {
        return this.mul_reg.toString(2).padStart(5, '0');
    }

    toStringSubRegDetail() {
        const str = this.toStringSubReg();
        return str.slice(0, 3) + " stopper" + str.slice(3, 4) + " bit" + str.slice(4);
    }

    toStringAddReg() {
        return this.add_reg.toString(2).padStart(4, '0');
    }

    toStringAddRegDetail() {
        const str = this.toStringAddReg();
        return str.slice(0, 3) + " bit" + str.slice(3);
    }

    /**
     * @throws {Error}
     */
    getStateName() {
        const name = this.states[this.state];
        if (name === undefined) {
            throw Error("Can't find state: " + this.state);
        }
        return name;
    }

    getPrevOutputString() {
        return this.prevOutput === Type.Z ? "Z" : "NZ";
    }

    getCurrentActionAndNextStateString() {
        if (this.prevOutput === null) {
            return {
                actions: "",
                nextState: "",
            };
        }
        const next = this.array[this.state];
        if (next === undefined) {
            throw Error("Runtime error: Can't find " + this.getStateName());
        }
        const { nextState, actions } = this.prevOutput === Type.Z ? next.Z : next.NZ;
        return {
            actions: prettyActions(actions),
            nextState: this.states[nextState],
        }
    }

    /**
     * 
     * @param {number} reg 
     */
    inc_r(reg) {
        this.regs[reg] += 1;
        return null;
    }

    /**
     * 
     * @param {number} reg 
     */
    tdec_r(reg) {
        if (this.regs[reg] === 0) {
            return 0;
        } else {
            this.regs[reg] -= 1;
            return 1;
        }
    }

    /**
     * @returns {null}
     */
    add_a1() {
        this.add_reg = Table.addlookup_a1[this.add_reg];
        return null;
    }

    /**
     * @returns {0 | 1}
     */
    add_b0() {
        const t = this.add_reg % 2;
        this.add_reg = Table.addlookup_b0[this.add_reg];
        return t; 
    }

    /**
     * @returns {0 | 1}
     */
    add_b1() {
        const t = 1 - this.add_reg % 2;
        this.add_reg = Table.addlookup_b1[this.add_reg];
        return t; 
    }

    /**
     * @returns {0 | 1}
     */
    mul_0() {
        const r = this.mul_reg % 2;
        this.mul_reg = this.mul_reg >> 1;
        return r;
    }

    /**
     * @returns {0 | 1}
     */
    mul_1() {
        const r = this.mul_reg % 2;
        if (this.mul_reg <= 21) {
            // (x / 2) + 5
            // (x + 10) / 2
            this.mul_reg = (this.mul_reg >> 1) + 5
        } else {
            this.mul_reg = (this.mul_reg - 22) >> 1
        }
        return r;
    }

    /**
     * @returns {null}
     */
    sub_a1() {
        const x = Table.sublookup_a1[this.sub_reg];
        if (x === -1) {
            throw Error("Runtime error: SUB");
        }
        this.sub_reg = x;
        return null;
    }

    /**
     * @returns {0 | 1}
     */
    sub_b0() {
        const t = this.sub_reg % 2;
        this.sub_reg = Table.sublookup_b0[this.sub_reg];
        return t; 
    }

    /**
     * @returns {0 | 1}
     */
    sub_b1() {
        const t = 1 - this.sub_reg % 2;
        this.sub_reg = Table.sublookup_b1[this.sub_reg];
        return t; 
    }

    /**
     * 
     * @param {number} num 
     */
    output(num) {
        // console.log(num);
        if (num === -1) {
            this.output_text += ".";
        } else {
            this.output_text += num;
        }
        return null;
    }

    /**
     * 
     * @param {{kind: number, reg?: number, num?: number}} action
     * @returns {0 | 1 | null}
     */
    runAction(action) {
        switch (action.kind) {
            case Type.NOP: return Type.Z;
            case Type.INC_R: this.regs[action.reg] += 1; return null; // return this.inc_r(action.reg);
            case Type.TDEC_R: return this.tdec_r(action.reg);
            case Type.INC_T: return this.tapes[action.reg].inc();
            case Type.DEC_T: return this.tapes[action.reg].dec();
            case Type.READ_T: return this.tapes[action.reg].read();
            case Type.RESET_T: return this.tapes[action.reg].reset();
            case Type.SET_T: return this.tapes[action.reg].set();
            case Type.ADD_A1: return this.add_a1();
            case Type.ADD_B0: return this.add_b0();
            case Type.ADD_B1: return this.add_b1();
            case Type.SUB_A1: return this.sub_a1();
            case Type.SUB_B0: return this.sub_b0();
            case Type.SUB_B1: return this.sub_b1();
            case Type.MUL_0: return this.mul_0();
            case Type.MUL_1: return this.mul_1();
            case Type.INC_SQX: return this.memory.inc_sqx();
            case Type.INC_SQY: return this.memory.inc_sqy();
            case Type.DEC_SQX: return this.memory.dec_sqx();
            case Type.DEC_SQY: return this.memory.dec_sqy();
            case Type.READ_SQ: return this.memory.read();
            case Type.SET_SQ: return this.memory.set();
            case Type.OUTPUT: return this.output(action.num);
            default: throw Error("Unknown instruction: " + action.kind);
        }
    }

    /**
     * return `false` if program is halted
     */
    step() {
        if (this.prevOutput === null) {
            return false;
        }

        const next = this.array[this.state];
        if (next === undefined) {
            throw Error("Runtime error: Can't find " + this.getStateName());
        }
        const { nextState, actions } = this.prevOutput === Type.Z ? next.Z : next.NZ;

        /** @type {0 | 1 | null} */
        let nextOutput = null;
        for (const action of actions) {
            const action_result = this.runAction(action);
            if (action_result !== null) {
                if (nextOutput !== null) {
                    throw Error("Runtime error: Multiple return value");
                }
                nextOutput = action_result;
            }
        }

        this.prevOutput = nextOutput;
        this.state = nextState;
        return true;
    }

    /**
     * 
     * @param {string} str 
     */
    static fromSource(str) {
        return new Machine(Parse.indexing(Parse.parse(Parse.lexer(str))));
    }
}
