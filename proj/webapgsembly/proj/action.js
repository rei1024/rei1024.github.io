import * as Type from './type.js'

/**
 * 
 * @param {string} str 
 */
function parseNum(str) {
    const n = parseInt(str, 10);
    if (isNaN(n)) {
        throw Error("Parse error: " + str + " is not a number");
    }
    return n;
}

/**
 * 
 * @param {string} str 
 */
function parseReg(str) {
    const n = parseInt(str.substring(1), 10);
    if (isNaN(n)) {
        throw Error("\"" + str + "\" is not valid name for register");
    }
    return n;
}

/**
 * 
 * @param {string} str 
 */
export function parseActions(str) {
    return str.split(/\s*,\s*/g).map(parseAction);
}

/**
 * 
 * @param {string} str
 * @returns {{
    kind: number;
    reg?: number;
    num?: number;
}}
 */
export function parseAction(str) {
    const [ kind, reg ] = str.trim().split(/\s+/);
    if (kind === "NOP") { return { kind: Type.NOP };
    } else if (kind === "INC") {
        if (reg.startsWith("T")) {
            return {
                kind: Type.INC_T,
                reg: parseReg(reg)
            };
        } else if (reg.startsWith("R")) {
            return {
                kind: Type.INC_R,
                reg: parseReg(reg)
            };
        } else if (reg === "SQX") { return { kind: Type.INC_SQX };
        } else if (reg === "SQY") { return { kind: Type.INC_SQY };
        } else { throw Error("Parse error: " + str); }
    } else if (kind === "TDEC" && reg.startsWith("R")) {
        return {
            kind: Type.TDEC_R,
            reg: parseReg(reg)
        };
    } else if (kind === "DEC") {
        if (reg === "SQX") { return { kind: Type.DEC_SQX };
        } else if (reg === "SQY") { return { kind: Type.DEC_SQY };
        } else if (reg.startsWith("T")) {
            return {
                kind: Type.DEC_T,
                reg: parseReg(reg)
            };
        } else {
            throw Error("Parse error: " + str);
        }
    } else if (kind === "READ") {
        if (reg === "SQ") { return { kind: Type.READ_SQ };
        } else if (reg.startsWith("T")) {
            return {
                kind: Type.READ_T,
                reg: parseReg(reg)
            };
        } else {
            throw Error("Parse error: " + str);
        }
    } else if (kind === "RESET" && reg.startsWith("T")) {
        return {
            kind: Type.RESET_T,
            reg: parseReg(reg)
        };
    } else if (kind === "SET") {
        if (reg.startsWith("T")) {
            return {
                kind: Type.SET_T,
                reg: parseReg(reg)
            };
        } else if (reg === "SQ") {
            return { kind: Type.SET_SQ };
        }
    } else if (kind === "ADD" && reg === "A1") { return { kind: Type.ADD_A1 }
    } else if (kind === "ADD" && reg === "B0") { return { kind: Type.ADD_B0 }
    } else if (kind === "ADD" && reg === "B1") { return { kind: Type.ADD_B1 }
    } else if (kind === "SUB" && reg === "A1") { return { kind: Type.SUB_A1 }
    } else if (kind === "SUB" && reg === "B0") { return { kind: Type.SUB_B0 }
    } else if (kind === "SUB" && reg === "B1") { return { kind: Type.SUB_B1 }
    } else if (kind === "MUL" && reg === "0") { return { kind: Type.MUL_0 }
    } else if (kind === "MUL" && reg === "1") { return { kind: Type.MUL_1 }
    } else if (kind === "OUTPUT") {
        return {
            kind: Type.OUTPUT,
            num: reg === "." ? -1 : parseNum(reg)
        }
    } else {
        throw Error("Unknown instruction: " + str);
    }
}

/**
 * 
 * @param {Array<{kind: number}>} actions 
 */
export function prettyActions(actions) {
    return actions.map(prettyAction).join(", ");
}

/**
 * 
 * @param {{kind: number}} action 
 */
export function prettyAction(action) {
    const { kind } = action;
    switch (kind) {
        case Type.NOP: return "NOP";
        case Type.INC_T: return "INC T" + action.reg;
        case Type.INC_R: return "INC R" + action.reg;
        case Type.INC_SQX: return "INC SQX"
        case Type.INC_SQY: return "INC SQY"
        case Type.TDEC_R: return "TDEC R" + action.reg;
        case Type.DEC_T: return "DEC T" + action.reg;
        case Type.DEC_SQX: return "DEC SQX";
        case Type.DEC_SQY: return "DEC SQY";
        case Type.READ_T: return "READ T" + action.reg;
        case Type.READ_SQ: return "READ SQ";
        case Type.RESET_T: return "RESET T" + action.reg;
        case Type.SET_T: return "SET T" + action.reg;
        case Type.ADD_A1: return "ADD A1";
        case Type.ADD_B0: return "ADD B0";
        case Type.ADD_B1: return "ADD B1";
        case Type.SUB_A1: return "SUB A1";
        case Type.SUB_B0: return "SUB B0";
        case Type.SUB_B1: return "SUB B1";
        case Type.MUL_0: return "MUL 0";
        case Type.MUL_1: return "MUL 1";
        case Type.SET_SQ: return "SET SQ";
        case Type.OUTPUT: return "OUTPUT " + (action.num === -1 ? "." : action.num);
        default: throw Error("error prettyAction: " + Type.prettyActionCode(action))
    }
}

/**
 * 
 * @param {{kind: number, reg?: number}} action
 * @returns {number}
 */
export function extractRegisterRAction(action) {
    switch(action.kind) {
        case Type.INC_R: return action.reg;
        case Type.TDEC_R: return action.reg;
        default: return -1;
    }
}

/**
 * 
 * @param {{kind: number, reg?: number}} action
 * @returns {number}
 */
export function extractRegisterTAction(action) {
    switch(action.kind) {
        case Type.INC_T: return action.reg;
        case Type.DEC_T: return action.reg;
        case Type.READ_T: return action.reg;
        case Type.RESET_T: return action.reg;
        default: return -1;
    }
}

function generate() {
    // } else if (kind === "ADD" && reg === "A1") { return { kind: Type.ADD_A1 }
    // INC SQX,INC SQY,DEC SQX,DEC SQY,READ SQ,
    const str = "MUL 0,MUL 1,SET SQ"
    const array = ['ADD', 'SUB'].flatMap(o => [[o, 'A1'], [o, 'B0'], [o, 'B1']])
        .concat(str.split(",").map(x => x.split(" ")));
    console.log(generate);
    const res = array.map(([k, v]) =>
        `} else if (kind === "${k}" && reg === "${v}") { return { kind: Type.${k}_${v} }`)
        .join("\n");
    const t = document.createElement("textarea");
    t.value = res;
    document.body.append(t);
}
