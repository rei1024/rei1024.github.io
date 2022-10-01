// @ts-check

import { BLANK_SYMBOL, isHaltState } from "./Line.js";
import { TMMap } from "./TMMap.js";

const NEG_TAPE = 'B0';
const POS_TAPE = 'B1';

/**
 * input ${state}__${zOrNZ}_MOVE_1
 * output ${state}__${zOrNZ}_FINISH_1
 * @param {string[]} array mutated
 * @param {"Z" | "NZ"} zOrNZ
 * @param {string} state
 * @param {"l" | "r" | "*"} direction
 */
function direction(array, zOrNZ, state, direction) {
    const prefix = `${state}__${zOrNZ}`;
    switch (direction) {
        case "*": {
            // no change
            array.push(`${prefix}_MOVE_1; *; ${prefix}_FINISH_1; NOP`);
            break;
        }
        case "l": {
            array.push(`${prefix}_MOVE_1; *; ${prefix}_MOVE_2; TDEC U0`);

            array.push(`${prefix}_MOVE_2; Z; ${prefix}_MOVE_POS_1; TDEC ${POS_TAPE}`); // チェックを入れる
            array.push(`${prefix}_MOVE_2; NZ; ${prefix}_FINISH_1; INC U0, INC ${NEG_TAPE}, NOP`); // 負で左に移動する場合はチェックなし U0を1とする
            array.push(`${prefix}_MOVE_POS_1; Z; ${prefix}_FINISH_1; INC U0, NOP`); // 負に変化させる
            array.push(`${prefix}_MOVE_POS_1; NZ; ${prefix}_FINISH_1; NOP`); // 左に移動できたので終了
            break;
        }
        case "r": {
            array.push(`${prefix}_MOVE_1; *; ${prefix}_MOVE_2; TDEC U0`);

            array.push(`${prefix}_MOVE_2; Z; ${prefix}_FINISH_1; INC ${POS_TAPE}, NOP`); // 正で右に移動する場合はチェックなし U0は0のまま
            array.push(`${prefix}_MOVE_2; NZ; ${prefix}_MOVE_NEG_1; TDEC ${NEG_TAPE}`); // チェックを入れる
            array.push(`${prefix}_MOVE_NEG_1; Z; ${prefix}_FINISH_1; NOP`); // TDEC U0を動かしているので0のまま
            array.push(`${prefix}_MOVE_NEG_1; NZ; ${prefix}_FINISH_1; INC U0, NOP`); // U0のフラグを立てたままにする
            break;
        }
    }
}

/**
 *
 * @param {TMMap} tmMap
 * @returns {string | Error} APGsembly
 */
 export function convert(tmMap) {
    /**
     * @type {string[]}
     */
    const array = [];

    if (tmMap.symbols.length > 2) {
        return Error('only works with 2 color');
    }

    const otherSymbols = tmMap.symbols.filter(x => x !== BLANK_SYMBOL);

    if (otherSymbols.length > 1) {
        return Error('only works with 2 color');
    }

    const otherSymbol = otherSymbols[0] ?? '1';

    const firstState = '0';

    if (tmMap.map.get(firstState) === undefined) {
        return Error(`does not contain state "${firstState}"`);
    }

    array.push(`INITIAL; ZZ; ${firstState}__CHECK_SYMBOL_1; NOP`);

    for (const state of tmMap.states) {
        if (isHaltState(state)) {
            array.push(`${state}__CHECK_SYMBOL_1; *; ${state}__CHECK_SYMBOL_1; HALT_OUT`);
            continue;
        }

        // どちらのテープを読むかチェックする
        array.push(`${state}__CHECK_SYMBOL_1; *; ${state}__CHECK_SYMBOL_2; INC U1, TDEC U0`);
        // シンボルを読む
        // 正
        array.push(`${state}__CHECK_SYMBOL_2; Z; ${state}__CHECK_SYMBOL_3; READ ${POS_TAPE}`);
        // 負
        array.push(`${state}__CHECK_SYMBOL_2; NZ; ${state}__CHECK_SYMBOL_3; INC U0, READ ${NEG_TAPE}`);

        array.push(`${state}__CHECK_SYMBOL_3; Z; ${state}__Z_WRITE_SYMBOL_1; NOP`);
        array.push(`${state}__CHECK_SYMBOL_3; NZ; ${state}__NZ_WRITE_SYMBOL_1; NOP`);

        // 空白の場合
        {
            const blankLine = tmMap.getLine(state, BLANK_SYMBOL);
            // 書き込み
            if (blankLine === undefined) {
                array.push(`${state}__Z_WRITE_SYMBOL_1; Z; ${state}__Z_WRITE_SYMBOL_1; HALT_OUT`);
                continue;
            }
            if (blankLine.newSymbol === undefined || blankLine.newSymbol === BLANK_SYMBOL) {
                // 空白
                array.push(`${state}__Z_WRITE_SYMBOL_1; *; ${state}__Z_MOVE_1; NOP`);
            } else {
                // 書き込む
                array.push(`${state}__Z_WRITE_SYMBOL_1; *; ${state}__Z_WRITE_SYMBOL_2; TDEC U0`);
                array.push(`${state}__Z_WRITE_SYMBOL_2; Z; ${state}__Z_MOVE_1; SET ${POS_TAPE}, NOP`);
                array.push(`${state}__Z_WRITE_SYMBOL_2; NZ; ${state}__Z_MOVE_1; INC U0, SET ${NEG_TAPE}, NOP`);
            }
            direction(array, 'Z', state, blankLine.direction);
            // 遷移
            if (blankLine.newState === undefined) {
                array.push(`${state}__Z_FINISH_1; *; ${state}__CHECK_SYMBOL_1; NOP`);
            } else {
                array.push(`${state}__Z_FINISH_1; *; ${blankLine.newState}__CHECK_SYMBOL_1; NOP`);
            }
        }

        // 空白でない場合
        {
            const otherLine = tmMap.getLine(state, otherSymbol);
            if (otherLine === undefined) {
                array.push(`${state}__NZ_WRITE_SYMBOL_1; *; ${state}__NZ_WRITE_SYMBOL_1; HALT_OUT`);
                continue;
            }
            // 書き込み
            if (otherLine.newSymbol === BLANK_SYMBOL) {
                array.push(`${state}__NZ_WRITE_SYMBOL_1; *; ${state}__NZ_MOVE_1; NOP`);
            } else {
                // no changeと書き込む場合
                array.push(`${state}__NZ_WRITE_SYMBOL_1; *; ${state}__NZ_WRITE_SYMBOL_2; TDEC U0`);
                array.push(`${state}__NZ_WRITE_SYMBOL_2; Z; ${state}__NZ_MOVE_1; SET ${POS_TAPE}, NOP`);
                array.push(`${state}__NZ_WRITE_SYMBOL_2; NZ; ${state}__NZ_MOVE_1; INC U0, SET ${NEG_TAPE}, NOP`);
            }
            direction(array, 'NZ', state, otherLine.direction);
            // 遷移
            if (otherLine.newState === undefined) {
                array.push(`${state}__NZ_FINISH_1; *; ${state}__CHECK_SYMBOL_1; NOP`);
            } else {
                array.push(`${state}__NZ_FINISH_1; *; ${otherLine.newState}__CHECK_SYMBOL_1; NOP`);
            }
        }
    }

    return array.join('\n');
}
