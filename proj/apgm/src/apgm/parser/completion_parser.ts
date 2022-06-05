import { macroHead } from "./mod.ts";

interface MacroDecl {
    name: string;
    args: string[];
}

/**
 * ネスト未対応
 */
export function removeComment(src: string): string {
    let res = "";
    let isComment = false;
    let i = 0;
    while (i < src.length) {
        const c = src[i];
        const c2 = src[i + 1];
        if (c === "/" && c2 === "*") {
            i += 2;
            isComment = true;
        } else if (c === "*" && c2 === "/") {
            isComment = false;
            i += 2;
        } else {
            if (!isComment) {
                res += c;
            }
            i++;
        }
    }

    return res;
}

/**
 * エディタ補完用パーサー
 */
export function completionParser(src: string): MacroDecl[] {
    const array: MacroDecl[] = [];
    // non-greedy
    // mod.tsとマクロ名の正規表現を合わせること
    for (
        const match of removeComment(src).matchAll(
            /(macro\s+([a-zA-Z_][a-zA-Z_0-9]*?!)\s*\(.*?\))/gs,
        )
    ) {
        const result = macroHead().parse(match[0]);
        if (result.type === "ParseOK") {
            array.push({
                name: result.value.name,
                args: result.value.args.map((x) => x.name),
            });
        }
    }
    return array;
}
