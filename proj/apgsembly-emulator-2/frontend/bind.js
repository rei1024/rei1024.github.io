// @ts-check

import { $type } from "./util/selector.js";

const HTMLElement_ = HTMLElement;
const HTMLInputElement_ = HTMLInputElement;
const HTMLButtonElement_ = HTMLButtonElement;

// エラーメッセージ
// Error message
export const $error = $type("#error", HTMLElement_);

// 入力
// APGsembly code
export const $input = $type("#input", HTMLTextAreaElement);

// 出力
// OUTPUT component
export const $output = $type("#output", HTMLTextAreaElement);

// ステップ数表示
export const $stepCount = $type("#steps", HTMLElement_);

// Toggle Start and Stop
export const $toggle = $type("#toggle", HTMLButtonElement_);

// Reset machine state and program
export const $reset = $type("#reset", HTMLButtonElement_);

// Step Button
export const $step = $type("#step", HTMLButtonElement_);
export const $stepText = $type("#step-text", HTMLElement_);

// Config modal button
export const $configButton = $type("#config_button", HTMLButtonElement_);

// Stats modal button
export const $statsButton = $type("#stats_button", HTMLButtonElement_);

// 現在の状態
export const $currentState = $type("#current_state", HTMLElement_);

// 前回の出力
export const $previousOutput = $type("#previous_output", HTMLElement_);

// スピード入力
export const $frequencyInput = $type("#frequency_input", HTMLInputElement_);

// スピード表示
export const $frequencyOutput = $type("#frequency_output", HTMLElement_);

// 次のコマンド
// Next command
export const $command = $type("#command", HTMLElement_);

// B2D
export const $canvas = $type("#canvas", HTMLCanvasElement);

/**
 * @type {CanvasRenderingContext2D}
 */
export const context = $canvas.getContext("2d") ?? (() => {
    throw Error("context is null");
})();

export const $b2dPos = {
    x: $type("#b2dx", HTMLElement_),
    y: $type("#b2dy", HTMLElement_),
};

// B2Dの開閉
export const $b2dDetail = $type("#b2d_detail", HTMLDetailsElement);

// スライディングレジスタ
export const $unaryRegister = $type("#unary_register", HTMLElement_);

export const $unaryRegisterDetail = $type(
    "#unary_register_detail",
    HTMLDetailsElement,
);

// バイナリレジスタ
export const $binaryRegister = $type("#binary_register", HTMLElement_);

// バイナリレジスタの開閉
export const $binaryRegisterDetail = $type(
    "#binary_register_detail",
    HTMLDetailsElement,
);

// ADD SUB MULの表示
export const $addSubMul = $type("#add_sub_mul", HTMLElement_);

// ファイルインポート
export const $fileImport = $type("#import_file", HTMLInputElement_);

export const $examples = $type("#examples", HTMLButtonElement_);

// サンプルコード
/**
 * @type {NodeListOf<HTMLElement>}
 */
export const $exampleCodes = document.querySelectorAll(".js_example");

// --------- Modal --------- //

// 設定モーダル
export const $configModalContent = $type("#config_modal_content", HTMLElement_);

// ステップ数入力
export const $stepInput = $type("#step_input", HTMLInputElement_);

export const binaryConfig = {
    /** 2進数を非表示にする */
    $hideBits: $type("#hide_bits", HTMLInputElement_),
    /** 2進数を逆順にする */
    $reverseBits: $type("#reverse_bits", HTMLInputElement_),
    /** 10進数に変換して表示 */
    $showBinaryValueInDecimal: $type(
        "#show_binary_value_in_decimal",
        HTMLInputElement_,
    ),
    /** 16進数に変換して表示 */
    $showBinaryValueInHex: $type(
        "#show_binary_value_in_hex",
        HTMLInputElement_,
    ),
};

// ブレークポイント
export const $breakpointSelect = $type("#breakpoint_select", HTMLSelectElement);

// ブレークポイント入力
export const $breakpointInputSelect = $type(
    "#breakpoint_input_select",
    HTMLSelectElement,
);

// ダークモード
export const $darkMode = $type("#dark_mode", HTMLInputElement_);
export const $darkModeLabel = $type("#dark_mode_label", HTMLElement_);

export const $b2dHidePointer = $type("#b2d_hide_pointer", HTMLInputElement_);

export const $b2dFlipUpsideDown = $type(
    "#b2d_flip_upside_down",
    HTMLInputElement_,
);

// Stats Modal

export const $statsModal = $type("#stats_modal", HTMLElement_);

export const $statsBody = $type("#stats_body", HTMLElement_);

export const $statsNumberOfStates = $type(
    "#stats_number_of_states",
    HTMLElement_,
);

export const $viewStateDiagramButton = $type(
    "#view-state-diagram",
    HTMLButtonElement_,
);

// Library modal
export const $addLibraryFileButton = $type(
    "#add-library-file",
    HTMLButtonElement_,
);
export const $libraryList = $type("#library-list", HTMLElement_);
export const $libraryModalClose = $type(
    '#library_modal [data-bs-dismiss="modal"]',
    HTMLElement_,
);
export const $addBinaryLibraryFile = $type(
    "#add-binary-library-file",
    HTMLButtonElement_,
);
