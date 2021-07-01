// @ts-check

import { $type } from "./util/selector.js";

// エラーメッセージ
// Error messsage
export const $error = $type('#error', HTMLElement);

// 入力
// APGsembly code
export const $input = $type('#input', HTMLTextAreaElement);

// 出力
// OUTPUT component
export const $output = $type('#output', HTMLTextAreaElement);

// ステップ数表示
export const $steps = $type('#steps', HTMLElement);

// Start execution
export const $start = $type('#start', HTMLButtonElement);

// Stop execution
export const $stop = $type('#stop', HTMLButtonElement);

// Reset machine state and program
export const $reset = $type('#reset', HTMLButtonElement);

// Step Button
export const $step = $type('#step', HTMLButtonElement);

// 現在の状態
export const $currentState = $type('#current_state', HTMLElement);

// 前回の出力
export const $previousOutput = $type('#previous_output', HTMLElement);

// スピード入力
export const $frequencyInput = $type('#frequency_input', HTMLInputElement);

// スピード表示
export const $freqencyOutput = $type('#frequency_output', HTMLElement);

// 次のコマンド
// Next command
export const $command = $type('#command', HTMLElement);

// B2D
export const $canvas = $type('#canvas', HTMLCanvasElement);
export const context = $canvas.getContext('2d');
if (context == null) {
    throw Error('context is null');
}
export const $b2dx = $type('#b2dx', HTMLElement);
export const $b2dy = $type('#b2dy', HTMLElement);

// B2Dの開閉
export const $b2dDetail = $type('#b2d_detail', HTMLDetailsElement);

// スライディングレジスタ
export const $unaryRegister = $type('#unary_register', HTMLElement);

// バイナリレジスタ
export const $binaryRegister = $type('#binary_register', HTMLElement);

// バイナリレジスタの開閉
export const $binaryRegisterDetail = $type('#binary_register_detail', HTMLDetailsElement);

// ADD SUB MULの表示
export const $addSubMul = $type('#add_sub_mul', HTMLElement);

// ファイルインポート
export const $fileImport = $type('#import_file', HTMLInputElement);

// サンプルコード
export const $sampleCodes = document.querySelectorAll('.js_sample');

// --------- Modal --------- //

// ステップ数入力 
export const $stepInput = $type('#step_input', HTMLInputElement);

// Hide Binary
// 二進数を非表示にする
export const $hideBinary = $type('#hide_binary', HTMLInputElement);

// ブレークポイント
export const $breakpointSelect = $type('#breakpoint_select', HTMLSelectElement);

// ダークモード
export const $darkMode = $type('#dark_mode', HTMLInputElement);
