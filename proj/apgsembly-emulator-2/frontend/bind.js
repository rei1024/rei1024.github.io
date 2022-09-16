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
export const $stepCount = $type('#steps', HTMLElement);

// Toggle Start and Stop
export const $toggle = $type('#toggle', HTMLButtonElement);

// Reset machine state and program
export const $reset = $type('#reset', HTMLButtonElement);

// Step Button
export const $step = $type('#step', HTMLButtonElement);

// Config modal button
export const $configButton = $type('#config_button', HTMLButtonElement);

// Stats modal button
export const $statsButton = $type('#stats_button', HTMLButtonElement);

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

/**
 * @type {CanvasRenderingContext2D}
 */
export const context = $canvas.getContext('2d') ?? (() => {
    throw Error('context is null');
})();

export const $b2dPos = {
    x: $type('#b2dx', HTMLElement),
    y: $type('#b2dy', HTMLElement)
};

// B2Dの開閉
export const $b2dDetail = $type('#b2d_detail', HTMLDetailsElement);

// スライディングレジスタ
export const $unaryRegister = $type('#unary_register', HTMLElement);

export const $unaryRegisterDetail =
    $type('#unary_register_detail', HTMLDetailsElement);

// バイナリレジスタ
export const $binaryRegister = $type('#binary_register', HTMLElement);

// バイナリレジスタの開閉
export const $binaryRegisterDetail =
    $type('#binary_register_detail', HTMLDetailsElement);

// ADD SUB MULの表示
export const $addSubMul = $type('#add_sub_mul', HTMLElement);

// ファイルインポート
export const $fileImport = $type('#import_file', HTMLInputElement);

export const $examples = $type('#examples', HTMLButtonElement);

// サンプルコード
/**
 * @type {NodeListOf<HTMLElement>}
 */
export const $exampleCodes = document.querySelectorAll('.js_example');

// --------- Modal --------- //

// 設定モーダル
export const $configModalContent = $type('#config_modal_content', HTMLElement);

// ステップ数入力
export const $stepInput = $type('#step_input', HTMLInputElement);

export const binaryConfig = {
    /** 2進数を非表示にする */
    $hideBinary: $type('#hide_binary', HTMLInputElement),
    /** 2進数を逆順にする */
    $reverseBinary: $type('#reverse_binary', HTMLInputElement),
    /** 10進数に変換して表示 */
    $showBinaryValueInDecimal: $type('#show_binary_value_in_decimal', HTMLInputElement),
    /** 16進数に変換して表示 */
    $showBinaryValueInHex: $type('#show_binary_value_in_hex', HTMLInputElement)
};

// ブレークポイント
export const $breakpointSelect = $type('#breakpoint_select', HTMLSelectElement);

// ブレークポイント入力
export const $breakpointInputSelect = $type('#breakpoint_input_select', HTMLSelectElement);

// ダークモード
export const $darkMode = $type('#dark_mode', HTMLInputElement);

export const $darkModeLabel =
    $darkMode.parentElement?.querySelector('label') ?? (() => {
    throw Error('label of #dark_mode is not found');
})();

export const $b2dHidePointer = $type('#b2d_hide_pointer', HTMLInputElement);

export const $b2dFlipUpsideDown =
    $type('#b2d_flip_upside_down', HTMLInputElement);

// Stats Modal

export const $statsModal = $type('#stats_modal', HTMLElement);

export const $statsBody = $type('#stats_body', HTMLTableSectionElement);

export const $statsNumberOfStates = $type('#stats_number_of_states', HTMLElement);
