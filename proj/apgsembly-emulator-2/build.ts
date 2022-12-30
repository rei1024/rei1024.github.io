import * as esbuild from "https://deno.land/x/esbuild@v0.15.15/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";

// deno run --allow-net=deno.land,registry.npmjs.org --allow-env --allow-read --allow-write=. --allow-run build.ts

const entryPoint = "./frontend/index.js";
const outputPath =  "./frontend/index.dist.js";

await esbuild.build({
    plugins: [denoPlugin()],
    entryPoints: [entryPoint],
    outfile: outputPath,
    bundle: true,
    format: "esm",
    minify: true,
    target: ["chrome99", "firefox99", "safari15"],
    treeShaking: true,
});

await esbuild.build({
    entryPoints: ['./frontend/style.css'],
    outfile: './frontend/style.min.css',
    minify: true,
    target: ["chrome99", "firefox99", "safari15"],
});

esbuild.stop();

const fileInfo = await Deno.stat(outputPath);
const file = await Deno.open(outputPath);
const compressed = await new Response(file.readable.pipeThrough(new CompressionStream('gzip'))).arrayBuffer();

console.log(fileInfo.size.toLocaleString() + " bytes" +
    `\n${compressed.byteLength.toLocaleString()} bytes (gzip)`);
