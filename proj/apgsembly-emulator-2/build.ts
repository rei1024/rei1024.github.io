import * as esbuild from "esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.0";

// deno run --allow-env --allow-read --allow-write=. --allow-run build.ts

const entryPoint = "./frontend/index.js";
const outputPath = "./frontend/index.dist.js";

const target = ["chrome99", "firefox99", "safari15"];

await esbuild.build({
    plugins: [...denoPlugins()],
    entryPoints: [entryPoint],
    outfile: outputPath,
    bundle: true,
    format: "esm",
    minify: true,
    target: target,
    treeShaking: true,
});

await esbuild.build({
    entryPoints: ["./frontend/style.css"],
    outfile: "./frontend/style.min.css",
    minify: true,
    target: target,
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
