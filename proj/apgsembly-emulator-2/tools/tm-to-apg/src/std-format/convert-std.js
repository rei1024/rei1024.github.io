// @ts-check

import { formatAPGsembly } from "../../../../src/exports.js";

const NEG_TAPE = "B0";
const POS_TAPE = "B1";

/**
 * input ${state}__${zOrNZ}_MOVE_1
 * output ${state}__${zOrNZ}_FINISH_1
 * @param {string[]} array mutated
 * @param {"Z" | "NZ"} zOrNZ
 * @param {string} state
 * @param {"L" | "R"} direction
 */
function direction(array, zOrNZ, state, direction) {
    const prefix = `${state}__${zOrNZ}`;
    switch (direction) {
        case "L": {
            array.push(`${prefix}_MOVE_1;     *;  ${prefix}_MOVE_2; TDEC U0`);

            array.push(
                `${prefix}_MOVE_2;     Z;  ${prefix}_MOVE_POS_1; TDEC ${POS_TAPE}`,
            ); // チェックを入れる
            array.push(
                `${prefix}_MOVE_2;     NZ; ${prefix}_FINISH_1; INC U0, INC ${NEG_TAPE}, NOP`,
            ); // 負で左に移動する場合はチェックなし U0を1とする
            array.push(
                `${prefix}_MOVE_POS_1; Z;  ${prefix}_FINISH_1; INC U0, NOP`,
            ); // 負に変化させる
            array.push(`${prefix}_MOVE_POS_1; NZ; ${prefix}_FINISH_1; NOP`); // 左に移動できたので終了
            break;
        }
        case "R": {
            array.push(`${prefix}_MOVE_1;     *;  ${prefix}_MOVE_2; TDEC U0`);

            array.push(
                `${prefix}_MOVE_2;     Z;  ${prefix}_FINISH_1; INC ${POS_TAPE}, NOP`,
            ); // 正で右に移動する場合はチェックなし U0は0のまま
            array.push(
                `${prefix}_MOVE_2;     NZ; ${prefix}_MOVE_NEG_1; TDEC ${NEG_TAPE}`,
            ); // チェックを入れる
            array.push(`${prefix}_MOVE_NEG_1; Z;  ${prefix}_FINISH_1; NOP`); // TDEC U0を動かしているので0のまま
            array.push(
                `${prefix}_MOVE_NEG_1; NZ; ${prefix}_FINISH_1; INC U0, NOP`,
            ); // U0のフラグを立てたままにする
            break;
        }
    }
}

/**
 * @typedef {import('./std-format-parser.js').Next} Next
 */

/**
 * @param {Map<string, Map<string, Next>>} map
 * @returns {string | Error} APGsembly
 */
export function convertStd(map) {
    /**
     * @type {string[]}
     */
    const array = [];

    if ((map.size === 0)) {
        return Error("empty machine");
    }

    if ((map.get("A")?.size ?? 0) != 2) {
        return Error("only works with 2 color");
    }

    const BLANK_SYMBOL = "0";

    const otherSymbol = "1";

    const firstState = "A";

    const HALT_STATE = "_HALT_";

    array.push(`INITIAL; ZZ; ${firstState}__CHECK_SYMBOL_1; NOP`);

    /**
     * @param {string} s
     */
    function isHaltState(s) {
        // TODO: 正確にする
        return s === "Z" || s === "H";
    }
    for (const [state, nextMap] of map) {
        // TODO: 正確にする
        if (isHaltState(state)) {
            array.push(
                `${state}__CHECK_SYMBOL_1; *;  ${state}__CHECK_SYMBOL_1; HALT_OUT`,
            );
            continue;
        }

        // どちらのテープを読むかチェックする
        array.push(
            `${state}__CHECK_SYMBOL_1; *;  ${state}__CHECK_SYMBOL_2; INC U1, TDEC U0`,
        );
        // シンボルを読む
        // 正
        array.push(
            `${state}__CHECK_SYMBOL_2; Z;  ${state}__CHECK_SYMBOL_3; READ ${POS_TAPE}`,
        );
        // 負
        array.push(
            `${state}__CHECK_SYMBOL_2; NZ; ${state}__CHECK_SYMBOL_3; INC U0, READ ${NEG_TAPE}`,
        );

        array.push(
            `${state}__CHECK_SYMBOL_3; Z;  ${state}__Z_WRITE_SYMBOL_1; NOP`,
        );
        array.push(
            `${state}__CHECK_SYMBOL_3; NZ; ${state}__NZ_WRITE_SYMBOL_1; NOP`,
        );

        // 空白の場合
        {
            const blankLine = nextMap.get(BLANK_SYMBOL);
            // 書き込み
            if (blankLine == null || isHaltState(blankLine.nextState)) {
                array.push(
                    `${state}__Z_WRITE_SYMBOL_1; *; ${HALT_STATE}; NOP`,
                );
            } else {
                if (
                    blankLine.writtenSymbol === BLANK_SYMBOL
                ) {
                    // 空白
                    array.push(
                        `${state}__Z_WRITE_SYMBOL_1; *;  ${state}__Z_MOVE_1; NOP`,
                    );
                } else {
                    // 書き込む
                    array.push(
                        `${state}__Z_WRITE_SYMBOL_1; *;  ${state}__Z_WRITE_SYMBOL_2; TDEC U0`,
                    );
                    array.push(
                        `${state}__Z_WRITE_SYMBOL_2; Z;  ${state}__Z_MOVE_1; SET ${POS_TAPE}, NOP`,
                    );
                    array.push(
                        `${state}__Z_WRITE_SYMBOL_2; NZ; ${state}__Z_MOVE_1; INC U0, SET ${NEG_TAPE}, NOP`,
                    );
                }
                direction(array, "Z", state, blankLine.direction);
                // 遷移
                array.push(
                    `${state}__Z_FINISH_1; *; ${blankLine.nextState}__CHECK_SYMBOL_1; NOP`,
                );
            }
        }

        // 空白でない場合
        {
            const otherLine = nextMap.get(otherSymbol);
            if (otherLine == null || isHaltState(otherLine.nextState)) {
                array.push(
                    `${state}__NZ_WRITE_SYMBOL_1; *; ${HALT_STATE}; NOP`,
                );
            } else {
                // 書き込み
                if (otherLine.writtenSymbol === BLANK_SYMBOL) {
                    array.push(
                        `${state}__NZ_WRITE_SYMBOL_1; *;  ${state}__NZ_MOVE_1; NOP`,
                    );
                } else {
                    // no changeと書き込む場合
                    array.push(
                        `${state}__NZ_WRITE_SYMBOL_1; *;  ${state}__NZ_WRITE_SYMBOL_2; TDEC U0`,
                    );
                    array.push(
                        `${state}__NZ_WRITE_SYMBOL_2; Z;  ${state}__NZ_MOVE_1; SET ${POS_TAPE}, NOP`,
                    );
                    array.push(
                        `${state}__NZ_WRITE_SYMBOL_2; NZ; ${state}__NZ_MOVE_1; INC U0, SET ${NEG_TAPE}, NOP`,
                    );
                }
                direction(array, "NZ", state, otherLine.direction);
                // 遷移
                array.push(
                    `${state}__NZ_FINISH_1; *; ${otherLine.nextState}__CHECK_SYMBOL_1; NOP`,
                );
            }
        }
    }

    array.push(`${HALT_STATE}; *; _HALT_; HALT_OUT`);

    return formatAPGsembly(array.join("\n"));
}
