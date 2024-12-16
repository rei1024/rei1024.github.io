import * as esbuild from "esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.1";

// deno run --allow-env --allow-read --allow-write=. --allow-run build.ts

const entryPoint = "./src/integration/mod.ts";
const outputPath = "./dist/integration.js";

await esbuild.build({
    // FIXME: remove loader options
    plugins: [...denoPlugins({ loader: "portable" })],
    entryPoints: [entryPoint],
    outfile: outputPath,
    bundle: true,
    format: "esm",
    minify: true,
    target: ["chrome99", "firefox99", "safari15"],
    treeShaking: true,
});

esbuild.stop();

const fileInfo = await Deno.stat(outputPath);
const file = await Deno.open(outputPath);
const compressed = await new Response(
    file.readable.pipeThrough(new CompressionStream("gzip")),
).arrayBuffer();

console.log(`${entryPoint} -> ${outputPath}`);
console.log(
    fileInfo.size.toLocaleString() + " bytes" +
        `\n${compressed.byteLength.toLocaleString()} bytes (gzip)`,
);
