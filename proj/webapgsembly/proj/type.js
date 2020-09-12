// Action Code
export const NOP = 0;
export const INC_R = 1; // reg
export const TDEC_R = 2; // reg
export const INC_T = 3; // reg
export const DEC_T = 4; // reg
export const READ_T = 5; // reg
export const RESET_T = 6; // reg
export const SET_T = 7; // reg
export const ADD_A1 = 8;
export const ADD_B0 = 9;
export const ADD_B1 = 10;
export const SUB_A1 = 11;
export const SUB_B0 = 12;
export const SUB_B1 = 13;
export const MUL_0 = 14;
export const MUL_1 = 15;
export const INC_SQX = 16;
export const INC_SQY = 17;
export const DEC_SQX = 18;
export const DEC_SQY = 19;
export const READ_SQ = 20;
export const SET_SQ = 21;
export const OUTPUT = 22; // num

// Output
/**
 * Zero
 */
export const Z = 0;
/**
 * Nonzero
 */
export const NZ = 1;
/**
 * "*" Z and NZ
 */
export const ZNZ = 2;
/**
 * Only zero
 */
export const ZZ = 3;

/**
 * 
 * @param {string} output 
 */
export function parseOutput(output) {
    if (output === "Z") {
        return Z;
    } else if (output === "NZ") {
        return NZ;
    } else if (output === "*") {
        return ZNZ;
    } else if (output === "ZZ") {
        return ZZ;
    } else {
        throw Error("Parse error: " + output)
    }
}

/**
 * 
 * @param {Z | NZ | ZZ | ZNZ} output 
 */
export function prettyOutput(output) {
    if (output === Z) {
        return "Z";
    } else if (output === NZ) {
        return "NZ";
    } else if (output === ZZ) {
        return "ZZ";
    } else if (output === ZNZ) {
        return "*";
    } else {
        throw Error("prettyOutput: " + output);
    }
}

/**
 * 
 * @param {number} action 
 */
export function prettyActionCode(action) {
    switch(action) {
        case NOP: return "NOP";
        case INC_R: return "INC_R";
        case TDEC_R: return "TDEC_R";
        case INC_T: return "INC_T";
        case DEC_T: return "DEC_T";
        case READ_T: return "READ_T";
        case RESET_T: return "RESET_T";
        case SET_T: return "SET_T";
        case ADD_A1: return "ADD_A1";
        case ADD_B0: return "ADD_B0";
        case ADD_B1: return "ADD_B1";
        case SUB_A1: return "SUB_A1";
        case SUB_B0: return "SUB_B0";
        case SUB_B1: return "SUB_B1";
        case MUL_0: return "MUL_0";
        case MUL_1: return "MUL_1";
        case INC_SQX: return "INC_SQX";
        case INC_SQY: return "INC_SQY";
        case DEC_SQX: return "DEC_SQX";
        case DEC_SQY: return "DEC_SQY";
        case READ_SQ: return "READ_SQ";
        case SET_SQ: return "SET_SQ";
        case OUTPUT: return "OUTPUT";
        default: throw Error("prettyActionCode: " + action);
    }
}

function generate() {
    const str = "NOP INC_R TDEC_R INC_T DEC_T READ_T RESET_T SET_T " +
                "ADD_A1 ADD_B0 ADD_B1 SUB_A1 SUB_B0 SUB_B1 " +
                "MUL_0 MUL_1 " +
                "INC_SQX INC_SQY DEC_SQX DEC_SQY READ_SQ SET_SQ " +
                "OUTPUT";
    const res = str.split(" ").map(
        (k, i) => "export const " + k + " = " + i + ";").join("\n");
    const t = document.createElement("textarea");
    t.value = res;
    document.body.append(t);
    const res2 = str.split(" ").map(
        (k, i) => "case " + k + ": return \"" + k + "\";").join("\n");
    const t2 = document.createElement("textarea");
    t2.value = res2;
    document.body.append(t2);
}
