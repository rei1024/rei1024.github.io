// @ts-check

import { Command } from "../Command.js";

/**
 * @returns {never}
 */
function internalError() {
    throw Error('internal error');
}

/**
 *
 * @param {Command} command1
 * @param {Command} [command2]
 * @returns {string}
 */
function addLineNumberTwo(command1, command2) {
    if (command1.line !== undefined && command2?.line !== undefined) {
        return ` at line ${command1.line} and ${command2.line}`;
    } else {
        return "";
    }
}

/**
 * ZとNZがペアになっていることを検査する
 * エラーメッセージを返却する
 * @param {ReadonlyArray<Command>} commands
 * @returns {string[] | undefined}
 */
 export function validateZAndNZ(commands) {
    /**
     *
     * @param {Command} c1
     * @param {Command} [c2]
     */
    const errMsg = (c1, c2) => `Need Z line followed by NZ line in "${c1.pretty()}"${addLineNumberTwo(c1, c2)}`;

    const lastIndex = commands.length - 1;

    for (let i = 0; i < lastIndex; i++) {
        const a = commands[i] ?? internalError();
        const b = commands[i + 1] ?? internalError();
        const inputA = a.input;
        const inputB = b.input;
        // Zならば次がNZである必要がある
        if (inputA === "Z" && inputB !== 'NZ') {
            return [errMsg(a, b)];
        }

        // NZならば前がZである必要がある
        if (inputB === "NZ" && inputA !== 'Z') {
            return [errMsg(a, b)];
        }

        // Zの次がNZの時、入力状態は同じである必要がある
        if (inputA === "Z" && inputB === "NZ" && a.state !== b.state) {
            return [errMsg(a, b)];
        }
    }

    // 最後の行がZで終わっている場合
    const lastLine = commands[commands.length - 1];
    if (lastLine !== undefined) {
        if (lastLine.input === 'Z') {
            return [errMsg(lastLine)];
        }
    }

    return undefined;
}
