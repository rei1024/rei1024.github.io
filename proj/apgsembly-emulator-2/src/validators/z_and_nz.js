// @ts-check

import { Command } from "../Command.js";

/**
 * @returns {never}
 */
function internalError() {
    throw Error('internal error');
}

/**
 * ZとNZがペアになっていることを検査する
 * エラーメッセージを返却する
 * @param {Command[]} commands
 * @returns {string[] | undefined}
 */
 export function validateZAndNZ(commands) {
    /**
     *
     * @param {Command} line
     */
    const errMsg = line => `Need Z line followed by NZ line at "${line.pretty()}"`;

    for (let i = 0; i < commands.length - 1; i++) {
        const a = commands[i] ?? internalError();
        const b = commands[i + 1] ?? internalError();

        if (a.input === "Z" && b.input !== 'NZ') {
            return [errMsg(a)];
        }

        if (b.input === "NZ" && a.input !== 'Z') {
            return [errMsg(b)];
        }

        if (a.input === "Z" && b.input === "NZ" && a.state !== b.state) {
            return [errMsg(a)];
        }
    }

    const lastLine = commands[commands.length - 1];
    if (lastLine !== undefined) {
        if (lastLine.input === 'Z') {
            return [errMsg(lastLine)];
        }
    }

    return undefined;
}
