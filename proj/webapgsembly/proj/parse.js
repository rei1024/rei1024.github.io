import { parseActions, extractRegisterRAction, extractRegisterTAction } from './action.js'
import { groupMapBy } from './util.js'

export const noneState = "none";

/**
 * remove empty line and comment split by ";"
 * and split component
 * @param {string} str
 * @returns {Array<{state: string, prevOutput: string, nextState: string, actions: string, src: string}>}
 */
export function lexer(str) {
    const array = str.split("\n");
    /** @type {Array<Array<string>>} */
    const result = [];
    for (const line_ of array) {
        const line = line_.trim();
        if (line === "" || line[0] === "#") {
            continue;
        }
        const parts = line.split(/\s*;\s*/g);
        if (parts.length === 4) {
            if (parts[0] === "" || parts[2] === "") {
                throw Error("Failed to parse: \""  + line_ + "\" State is empty");
            }
            result.push({
                state: parts[0],
                prevOutput: parts[1],
                nextState: parts[2],
                actions: parts[3],
                src: line_,
            });
        } else {
            if (parts.length >= 5 && parts[4].trim() === "") {
                throw Error("Failed to parse: \""  + line_ + "\" " + "Extra semicolon");
            }
            throw Error("Failed to parse: \""  + line_ + "\"");
        }
    }
    return result;
}

/**
 * 
 * @param {string} actions
 * @param {string} src original source
 */
function parseActions__(actions, src) {
    try {
        return parseActions(actions);
    } catch (e) {
        throw Error("Failed to parse: \"" + src + "\" -- " + e.message)
    }
}

/**
 * 
 * @param {Array<{state: string, prevOutput: string, nextState: string, actions: string, src: string}>} tokenized
 * @returns {Map<string, {Z:{nextState: string, actions: Array<Action>}, NZ: {nextState: string, actions: Array<Action>}}>}
 */
export function parse(tokenized) {
    const map = groupMapBy(tokenized, x => x.state);
    const map2 = new Map();
    for (const [key, value] of map) {
        // console.log(key, value)
        if (value.length == 1) {
            const v = value[0];
            if (v.prevOutput === "ZZ") {
                const actions = parseActions__(v.actions, v.src);
                map2.set(key, {
                    Z: {
                        nextState: v.nextState,
                        actions: actions
                    },
                    NZ: {
                        nextState: noneState,
                        actions: actions
                    }
                });
            } else if (v.prevOutput === "*") {
                const actions = parseActions__(v.actions, v.src);
                map2.set(key, {
                    Z: {
                        nextState: v.nextState,
                        actions: actions
                    },
                    NZ: {
                        nextState: v.nextState,
                        actions: actions
                    }
                });
            } else {
                throw Error("Failed to parse: " + v.src);
            }
        } else if (value.length === 2) {
            if (value[0].prevOutput === "Z" && value[1].prevOutput === "NZ") {
                map2.set(key, {
                    Z: {
                        nextState: value[0].nextState,
                        actions: parseActions__(value[0].actions, value[0].src)
                    },
                    NZ: {
                        nextState: value[1].nextState,
                        actions: parseActions__(value[1].actions, value[1].src)
                    }
                });
            } else {
                throw Error("Failed to parse: " + value[0].src + " and " + value[1].src);
            }
        } else if (value.length >= 1) {
            throw Error("Failed to parse: " + value[0].src);
        } else {
            throw Error("Internal error: parse")
        }
    }
    return map2;
}

/**
 * 
 * @param {Map<string, {Z:{nextState: string, actions: Array<Action>},
 *         NZ: {nextState: string, actions: Array<Action>}}>} parsed 
 */
export function indexing(parsed) {
    const keys = [...parsed.keys()];
    const findKey = next_state => {
        const v = keys.findIndex(x => x === next_state);
        if (v === -1) {
            if (next_state === noneState) {
                return -1
            }
            throw Error("Failed to parse: Can't find " + next_state);
        }
        return v;
    }
    /** @type {Array<{Z:{nextState: number, actions: Array<Action>}, NZ: {nextState: number, actions: Array<Action>}}>} */
    const array = Array(keys.length);
    for (const [ index, key ] of keys.entries()) {
        // console.log(parsed.get(key))
        const { Z, NZ } = parsed.get(key);
        array[index] = {
            Z: {
                ...Z,
                nextState: findKey(Z.nextState) // keys.findIndex(x => x === Z.nextState)
            },
            NZ: {
                ...NZ,
                nextState: findKey(NZ.nextState) // keys.findIndex(x => x === NZ.nextState)
            }
        }
    }
    return { states: keys, array };
}

/**
 * 
 * 最大の番号を抽出（+1必要）
 * 存在しない場合 -1
 * @param {{
        Z: {
            nextState: string;
            actions: Array<any>;
        };
        NZ: {
            nextState: string;
            actions: Array<any>;
        };
    }[]} array
 */
export function extractRegister(array) {
    const zr = array.flatMap(x => x.Z.actions.map(extractRegisterRAction));
    const nzr = array.flatMap(x => x.NZ.actions.map(extractRegisterRAction));
    const r = Math.max(-1, ...zr, ...nzr);
    const zt = array.flatMap(x => x.Z.actions.map(extractRegisterTAction));
    const nzt = array.flatMap(x => x.NZ.actions.map(extractRegisterTAction));
    const t = Math.max(-1, ...zt, ...nzt);
    return { r, t };
}
