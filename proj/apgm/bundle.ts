import { bundle } from "https://deno.land/x/emit@0.5.0/mod.ts";

const result = await bundle("./src/integration/mod.ts");
const { code } = result;
await Deno.writeTextFile("./dist/integration.js", code);
