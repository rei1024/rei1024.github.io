import { integration } from "./integration.js";

// @ts-ignore
Deno.test("bundled integration", () => {
    const result = integration(`output("4"); output("2");`);
});
