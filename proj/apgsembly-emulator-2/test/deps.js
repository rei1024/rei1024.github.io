export {
    assertEquals,
    assertThrows,
    assertIsError
} from "https://deno.land/std@0.161.0/testing/asserts.ts";

/**
 * @returns {never}
 */
export function never() {
    throw Error('never');
}

/**
 *
 * @param {string} name
 * @param {() => void} fn
 * @returns {void}
 */
export function test(name, fn) {
    return Deno.test(name, fn);
}
