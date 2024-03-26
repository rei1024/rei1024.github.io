export {
    assertEquals,
    assertIsError,
    assertThrows,
} from "https://deno.land/std@0.220.1/assert/mod.ts";

/**
 * @returns {never}
 */
export function throwError() {
    throw new Error("unexpected");
}

/**
 * @returns {never}
 */
export function never() {
    throw Error("never");
}

/**
 * @param {string} name
 * @param {() => void} fn
 * @returns {void}
 */
export function test(name, fn) {
    return Deno.test(name, fn);
}
