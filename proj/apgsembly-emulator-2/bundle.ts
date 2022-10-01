import { bundle } from "https://deno.land/x/emit@0.9.0/mod.ts";

// experimental bundling

// deno run --allow-env --allow-read --allow-write --allow-net bundle.ts
const result = await bundle("./frontend/index.js", {
    allowRemote: false,
    type: "module",
    compilerOptions: {
        inlineSourceMap: false,
        inlineSources: false,
        sourceMap: false
    }
});
const { code } = result;
const [first] = code.split("//# sourceMappingURL=data:application/json;base64,");
await Deno.writeTextFile("./index.js", first);
