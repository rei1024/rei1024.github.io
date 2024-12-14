// @ts-check

import { internalError } from "../internalError.js";
import { lineNumberMessage } from "./message.js";

/**
 * @param {string} replacementsMapString `{ xx = 1; yy = 0; label = ADD_AB; next_state = MUL_BK0 }`
 * @param {number | undefined} line
 * @param {string} src original line
 * @param {'#DEFINE' | '#INSERT'} key
 * @returns {{ needle: string; replacement: string }[] | string} replacements or error message
 */
export function parseReplacements(replacementsMapString, line, src, key) {
    const trimmedStr = replacementsMapString.trim();
    if (!trimmedStr.startsWith("{")) {
        return `Invalid line "${src}"${
            lineNumberMessage(line)
        }. ${key} replacements does not start with "{"`;
    }
    if (!trimmedStr.endsWith("}")) {
        return `Invalid line "${src}"${
            lineNumberMessage(line)
        }. ${key} replacements does not end with "}"`;
    }

    try {
        return replacementsMapString.slice(1, -1).slice().split(";").map(
            (keyValueStr) => {
                const keyValue = keyValueStr.trim().split("=").map((x) =>
                    x.trim()
                );
                if (keyValue.length != 2) {
                    throw new Error(
                        `Invalid line "${replacementsMapString}"${
                            lineNumberMessage(line)
                        }. #DEFINE invalid replacements`,
                    );
                }
                return {
                    needle: keyValue[0] ?? internalError(),
                    replacement: keyValue[1] ?? internalError(),
                };
            },
        );
    } catch (error) {
        return error instanceof Error ? error.message : internalError();
    }
}
