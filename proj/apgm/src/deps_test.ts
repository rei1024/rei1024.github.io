export {
    assertEquals,
    assertThrows,
} from "https://deno.land/std@0.128.0/testing/asserts.ts";

export function test(name: string, fn: () => void) {
    return Deno.test(name, fn);
}
