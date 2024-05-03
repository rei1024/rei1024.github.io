export { assertEquals, assertIsError, assertThrows } from "@std/assert";

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
