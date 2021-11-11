import {
    assertEquals,
    assertThrows,
} from "https://deno.land/std@0.114.0/testing/asserts.ts";

export { assertEquals, assertThrows };

export function test(name: string, fn: () => void) {
    return Deno.test(name, fn);
}
