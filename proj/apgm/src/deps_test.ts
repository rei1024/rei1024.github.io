export { assertEquals, assertThrows } from "@std/assert";

export { runAPGsembly } from "./deps.ts";

export function test(name: string, fn: () => void) {
    return Deno.test(name, fn);
}
