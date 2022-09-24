export {
    assertEquals,
    assertThrows,
} from "https://deno.land/std@0.157.0/testing/asserts.ts";

export { runAPGsembly } from "./deps.ts";

export function test(name: string, fn: () => void) {
    return Deno.test(name, fn);
}
