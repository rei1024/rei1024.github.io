import { bundle } from "https://deno.land/x/emit@0.9.0/mod.ts";

import * as swc from "https://deno.land/x/swc@0.2.1/mod.ts";

function minifyCode(code: string) {
    const { code: minify } = swc.print(
        swc.parse(
            code,
            { syntax: "ecmascript", script: false, importAssertions: true },
        ),
        { minify: true },
    );
    return minify;
}

async function bundleOrCheck(
    bundleEntryPath: string,
    outputPath: string,
    check: boolean,
) {
    const result = await bundle(bundleEntryPath);

    const { code } = result;

    const minify = minifyCode(code);

    if (check) {
        const current = await Deno.readTextFile(outputPath);
        if (current.trim() !== minify.trim()) {
            console.error("%cRun: deno task bundle", "color: red");
            Deno.exit(1);
        }
    } else {
        await Deno.writeTextFile(outputPath, minify);
    }
}

await bundleOrCheck(
    "./src/integration/mod.ts",
    "./dist/integration.js",
    Deno.args.includes("check"),
);
