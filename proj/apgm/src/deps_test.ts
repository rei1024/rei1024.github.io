export {
    assertEquals,
    assertThrows,
} from "https://deno.land/std@0.196.0/assert/mod.ts";

export { runAPGsembly } from "./deps.ts";

export function test(name: string, fn: () => void) {
    return Deno.test(name, fn);
}
