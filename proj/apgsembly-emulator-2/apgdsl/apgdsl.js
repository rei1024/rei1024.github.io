/* eslint-disable camelcase */
// @ts-check

import { Emitter } from "./emitter/apgdsl_emitter.js";
import { Command } from "./apgdsl_deps.js";

/**
 *
 * @typedef {import('./emitter/apgdsl_emitter.js').Expr} Expr
 */

/**
 *
 * @param {Expr} expr
 * @returns {Command[]}
 */
export function emit(expr) {
    const emitter = new Emitter();
    emitter.emitExprWrapped(expr);
    return emitter.getCommands();
}

/**
 *
 * @param {unknown} obj
 * @returns {Expr}
 */
export function promote(obj) {
    if (obj === null || obj === undefined) {
        return { kind: 'sequence', exprs: [] };
    } else if (typeof obj === 'number') {
        return { kind: 'number', value: obj };
    } else if (typeof obj === 'string') {
        return { kind: 'string', value: obj };
    } else if (Array.isArray(obj)) {
        return { kind: 'sequence', exprs: obj.map(promote) };
    } else if (typeof obj === 'object' && 'kind' in obj) {
        // @ts-ignore
        return obj;
    } else {
        throw Error(`can't promote`);
    }
}

/**
 *
 * @param {string} name
 * @param {unknown[]} [args]
 * @returns {Expr}
 */
function func(name, args = []) {
    return { kind: 'function', name: name, args: args.map(promote) };
}

export const output = /** @type {(_: string) => Expr} */ n => func('output', [n]);

// U
export const inc_u = /** @type {(_: number) => Expr} */ n => func('inc_u', [n]);
export const tdec_u = /** @type {(_: number) => Expr} */ n => func('tdec_u', [n]);

// B
export const inc_b = /** @type {(_: number) => Expr} */ n => func('inc_b', [n]);
export const tdec_b = /** @type {(_: number) => Expr} */ n => func('tdec_b', [n]);
export const read_b = /** @type {(_: number) => Expr} */ n => func('read_b', [n]);
export const set_b = /** @type {(_: number) => Expr} */ n => func('set_b', [n]);

// B2D
export const inc_b2dx = () => func('inc_b2dx');
export const inc_b2dy = () => func('inc_b2dy');
export const tdec_b2dx = () => func('tdec_b2dx');
export const tdec_b2dy = () => func('tdec_b2dy');
export const read_b2d = () => func('read_b2d');
export const set_b2d = () => func('set_b2d');

// ADD
export const add_a1 = () => func('add_a1');
export const add_b0 = () => func('add_b0');
export const add_b1 = () => func('add_b1');

// SUB
export const sub_a1 = () => func('sub_a1');
export const sub_b0 = () => func('sub_b0');
export const sub_b1 = () => func('sub_b1');

// MUL
export const mul_0 = () => func('mul_0');
export const mul_1 = () => func('mul_1');

// NOP
export const nop = () => func('nop');

// HALT_OUT
export const halt_out = () => func('halt_out');

/**
 *
 * @param {Expr} cond
 * @param {unknown} zero
 * @param {unknown} nonZero
 */
export function if_zero(cond, zero = [], nonZero = []) {
    return func('if_zero', [cond, zero, nonZero]);
}

/**
 *
 * @param {Expr} cond
 * @param {unknown} nonZero
 * @param {unknown} zero
 */
export function if_non_zero(cond, nonZero = [], zero = []) {
    return func('if_non_zero', [cond, nonZero, zero]);
}

/**
 *
 * @param {Expr} cond
 * @param {unknown} expr
 */
export function while_zero(cond, expr = []) {
    return func('while_zero', [cond, expr]);
}

/**
 *
 * @param {Expr} cond
 * @param {unknown} expr
 */
export function while_non_zero(cond, expr = []) {
    return func('while_non_zero', [cond, expr]);
}
