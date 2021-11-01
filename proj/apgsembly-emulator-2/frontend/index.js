// @ts-check

// critical path
import {} from "./util/selector.js";

import { setCustomError, removeCustomError } from "./util/validation_ui.js";
import { makeSpinner } from "./util/spinner.js";
import { importFileAsText } from "./util/import_file.js";
import { getSaveData } from "./util/save_data.js";
import { idle } from "./util/idle.js";
import { Frequency } from "./util/frequency.js";

import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";

import { renderB2D } from "./renderB2D.js";
import {
    renderUnary,
    setUpUnary,
    UNARY_REG_ITEMS_CLASS
} from "./renderUnary.js";
import { setUpBinary, renderBinary } from "./renderBinary.js";
import { setUpStats, renderStats } from "./renderStats.js";

import {
    $error,
    $input,
    $output,
    $steps,
    $start,
    $stop,
    $reset,
    $step,
    $configButton,
    $statsButton,
    $currentState,
    $previousOutput,
    $freqencyOutput,
    $frequencyInput,
    $command,
    $canvas,
    context,
    $b2dx,
    $b2dy,
    $b2dDetail,
    $unaryRegister,
    $unaryRegisterDetail,
    $binaryRegister,
    $binaryRegisterDetail,
    $addSubMul,
    $fileImport,
    $sampleCodes,
    $stepInput,
    $hideBinary,
    $reverseBinary,
    $breakpointSelect,
    $breakpointInputSelect,
    $darkMode,
    $darkModeLabel,
    $b2dHidePointer,
    $b2dFlipUpsideDown,
    $statsModal,
    $statsBody,
    $statsNumberOfStates,
    $samples,
} from "./bind.js";

// データ
// GitHub Pagesは1階層上になる
const DATA_DIR = location.origin.includes('github') ?
    "../apgsembly-emulator-2/data/" :
    "../data/";

/**
 * @typedef {"Initial" | "Running" | "Stop" | "ParseError" |
 *           "RuntimeError" | "Halted"} AppState
 */

// index.htmlと同期する
const DEFUALT_FREQUENCY = 30;

const hasToLocaleString = typeof (42).toLocaleString === 'function';

/**
 * APGsembly 2.0 Emulator frontend application
 */
export class App {
    constructor() {
        /** @type {Machine | undefined} */
        this.machine = undefined;

        /** ステップ数 */
        this.steps = 0;

        /**
         * アプリ状態
         * @type {AppState}
         */
        this.appState = "Initial";

        /**
         * frequency of update
         * 周波数[Hz]
         */
        this.frequency = DEFUALT_FREQUENCY;

        /**
         * エラーメッセージ
         */
        this.errorMessage = "";

        /** ステップ数設定 */
        this.stepConfig = 1;

        this.frequencyManager = new Frequency(
            () => this.appState === "Running",
            () => this.frequency,
            n => this.run(n)
        );

        /**
         * キャッシュ
         * @type {undefined | NodeListOf<ChildNode>}
         */
        this.unaryRegisterItems = undefined;
    }

    /**
     * 実行を開始する
     * Start execution
     */
    start() {
        switch (this.appState) {
            case "Initial": {
                this.reset();
                // 初期化に成功していれば走らせる
                // @ts-ignore
                if (this.appState === "Stop") {
                    this.appState = "Running";
                }
                this.render();
                break;
            }
            case "Stop": {
                this.appState = "Running";
                this.render();
                break;
            }
            default: {
                throw Error('start: unreachable');
            }
        }
    }

    /**
     * 停止する
     * Stop execution
     */
    stop() {
        this.appState = "Stop";
        this.render();
    }

    /**
     * スライディングレジスタ表示の初期化
     */
    setUpUnary() {
        if (this.machine === undefined) {
            // GC
            this.unaryRegisterItems = undefined;
            $unaryRegister.innerHTML = "";
            return;
        }
        const regs = this.machine.actionExecutor.uRegMap;
        setUpUnary($unaryRegister, regs);
        this.unaryRegisterItems = $unaryRegister.querySelector(`.${UNARY_REG_ITEMS_CLASS}`)?.childNodes;
    }

    /**
     * バイナリレジスタの表示の初期化
     */
    setUpBinary() {
        if (this.machine === undefined) {
            $binaryRegister.innerHTML = "";
            return;
        }
        setUpBinary($binaryRegister, this.machine.actionExecutor.bRegMap);
    }

    /**
     * ブレークポイントの選択肢の設定
     */
    setUpBreakpointSelect() {
        $breakpointSelect.innerHTML = "";
        const machine = this.machine;
        if (machine === undefined) {
            return;
        }
        const none = document.createElement('option');
        none.textContent = "None";
        none.value = "-1";
        none.selected = true;
        $breakpointSelect.append(none);
        for (const [state, stateIndex] of machine.getStateMap().entries()) {
            const option = document.createElement('option');
            option.textContent = state;
            option.value = stateIndex.toString();
            $breakpointSelect.append(option);
        }
    }

    /**
     * machineがセットされた時のコールバック
     */
    onMachineSet() {
        this.setUpUnary();
        this.setUpBinary();
        this.setUpStats();
        this.setUpBreakpointSelect();
    }

    /**
     * 状態をリセットし、パースする
     */
    reset() {
        this.steps = 0;
        this.errorMessage = "";
        const program = Program.parse($input.value);
        this.machine = undefined;
        this.frequencyManager.reset();
        if (typeof program === "string") {
            this.appState = "ParseError";
            this.errorMessage = program;
            this.render();
        } else {
            try {
                this.machine = new Machine(program);
                this.onMachineSet();
                this.appState = "Stop";
                this.render();
            } catch (e) {
                this.appState = "ParseError";
                if (e instanceof Error) {
                    this.errorMessage = e.message;
                } else {
                    this.errorMessage = "Unknown error is occurred.";
                }
                this.render();
            }
        }
    }

    /**
     * 周波数の表示
     */
    renderFrequencyOutput() {
        if (hasToLocaleString) {
            // with ","
            $freqencyOutput.textContent =
                this.frequency.toLocaleString() + "Hz";
        } else {
            $freqencyOutput.textContent = this.frequency.toString() + "Hz";
        }
    }

    // エラーメッセージ
    renderErrorMessage() {
        if (this.appState === "RuntimeError" ||
            this.appState === "ParseError") {
            $error.textContent = this.errorMessage;
            $error.style.display = "block";
            console.error("RENDER: " + this.errorMessage);
        } else {
            $error.style.display = "none";
        }
    }

    /**
     * 次のコマンドの表示
     */
    renderCommand() {
        try {
            const next = this.machine?.getNextCompiledCommandWithNextState();
            $command.textContent = next?.command.pretty() ?? "";
        } catch (e) {
            $command.textContent = "";
        }
    }

    /**
     * B2Dの表示
     */
    renderB2D() {
        if (!$b2dDetail.open) {
            return;
        }
        const machine = this.machine;
        if (machine === undefined) {
            $b2dx.textContent = "0";
            $b2dy.textContent = "0";
            context.clearRect(0, 0, $canvas.width, $canvas.height);
            return;
        }
        const b2d = machine.actionExecutor.b2d;
        $b2dx.textContent = b2d.x.toString();
        $b2dy.textContent = b2d.y.toString();

        const start = performance.now();
        renderB2D(
            context,
            b2d,
            $b2dHidePointer.checked,
            $b2dFlipUpsideDown.checked
        );

        // 描画に時間がかかっている場合閉じる
        if (this.appState === 'Running' && performance.now() - start >= 200) {
            $b2dDetail.open = false;
        }
    }

    /**
     * スライディングレジスタの表示
     */
    renderUnary() {
        if (this.machine === undefined) {
            return;
        }
        if (!$unaryRegisterDetail.open) {
            return;
        }
        const items = this.unaryRegisterItems;
        if (items === undefined) {
            return;
        }
        renderUnary(items, this.machine.actionExecutor.uRegMap);
    }

    /**
     * @returns {never}
     */
    __error__() {
        throw Error('internal error');
    }

    /**
     * バイナリレジスタの表示
     */
    renderBinary() {
        if (this.machine === undefined) {
            return;
        }
        if (!$binaryRegisterDetail.open) {
            return;
        }
        renderBinary(
            this.machine.actionExecutor.bRegMap,
            $hideBinary.checked,
            $reverseBinary.checked
        );
    }

    renderAddSubMul() {
        if (this.machine === undefined) {
            $addSubMul.textContent = "";
            return;
        }
        const actionExecutor = this.machine.actionExecutor;
        $addSubMul.textContent = `
        ADD = ${actionExecutor.add.toStringDetail()},
        SUB = ${actionExecutor.sub.toStringDetail()},
        MUL = ${actionExecutor.mul.toString()}
        `;
    }

    renderOutput() {
        const output = this.machine?.actionExecutor.output.getString();
        if (output !== undefined) {
            $output.value = output;
            if (output.length >= 36 * 3) {
                $output.rows = 4;
            } else if (output.length >= 36 * 2) {
                $output.rows = 3;
            } else if (output.length >= 36) {
                $output.rows = 2;
            } else {
                $output.rows = 1;
            }
        } else {
            $output.value = "";
        }
    }

    setUpStats() {
        if (this.machine === undefined) {
            $statsBody.innerHTML = "";
            return;
        }
        $statsNumberOfStates.textContent = this.machine.states.length.toString();
        setUpStats($statsBody, this.machine.stateStats, this.machine.states);
    }

    renderStats() {
        if (!$statsModal.classList.contains('show')) {
            return;
        }
        if (this.machine === undefined) {
            return;
        }
        renderStats(
            this.machine.stateStats,
            this.machine.getCurrentStateIndex()
        );
    }

    /**
     * 全体を描画する
     */
    render() {
        // ボタンの有効無効
        switch (this.appState) {
            case "Stop":
            case "Initial": {
                $start.disabled = false;
                $stop.disabled = true;
                $step.disabled = false;
                $reset.disabled = false;
                break;
            }
            case "Running": {
                $start.disabled = true;
                $stop.disabled = false;
                $step.disabled = true;
                $reset.disabled = true;
                break;
            }
            case "RuntimeError":
            case "ParseError":
            case "Halted": {
                $start.disabled = true;
                $stop.disabled = true;
                $step.disabled = true;
                $reset.disabled = false;
                break;
            }
        }
        this.renderErrorMessage();
        this.renderFrequencyOutput();

        $steps.textContent = this.steps.toString();
        // current state
        $currentState.textContent = this.machine?.currentState ?? "";
        $previousOutput.textContent = this.machine?.getPreviousOutput() ?? "";

        this.renderCommand();
        this.renderOutput();
        this.renderUnary();
        this.renderBinary();
        this.renderAddSubMul();
        this.renderStats();
        this.renderB2D();
    }

    /**
     * `steps`ステップ走らせる
     * @param {number} steps
     */
    run(steps) {
        switch (this.appState) {
            case "Initial": {
                this.reset();
                // エラーでなければ走らせない
                // @ts-ignore
                if (this.appState !== "Stop") {
                    return;
                }
            }
        }

        if (steps === 0) {
            // no render
            return;
        }

        const isRunning = this.appState === "Running";

        // ブレークポイントの処理
        let breakpointIndex = -1;
        const tempN = parseInt($breakpointSelect.value, 10);
        if (!isNaN(tempN)) {
            breakpointIndex = tempN;
        }

        const breakpointInputValue = parseInt($breakpointInputSelect.value, 10);

        const machine = this.machine;
        if (machine === undefined) {
            return;
        }
        let i = 0;
        const start = performance.now();
        try {
            for (i = 0; i < steps; i++) {
                const res = machine.execCommand();
                if (res === -1) {
                    this.appState = "Halted";
                    this.steps += i + 1;
                    this.render();
                    return;
                }
                // ブレークポイントの状態の場合、停止する
                if (
                    machine.getCurrentStateIndex() === breakpointIndex &&
                    (breakpointInputValue === -1 || breakpointInputValue === machine.prevOutput)
                ) {
                    this.appState = "Stop";
                    this.steps += i + 1;
                    this.render();
                    return;
                }
                // 1フレームに100ms以上時間が掛かっていたら、残りはスキップする
                if (isRunning && i % 500000 === 0 && (performance.now() - start >= 100)) {
                    this.steps += i + 1;
                    this.render();
                    return;
                }
            }
        } catch (e) {
            this.appState = "RuntimeError";
            if (e instanceof Error) {
                this.errorMessage = e.message;
            } else {
                this.errorMessage = "Unkown error is occurred.";
            }
            this.steps += i + 1; // 1回目でエラーが発生したら1ステップとする
            this.render();
            return;
        }
        this.steps += steps;
        this.render();
    }
}

const app = new App();

// Reset button
$reset.addEventListener('click', () => {
    app.reset();
});

// Start button
$start.addEventListener('click', () => {
    app.start();
});

// Stop button
$stop.addEventListener('click', () => {
    app.stop();
});

const spinner = makeSpinner();

// Step button
$step.addEventListener('click', () => {
    if ($step.disabled) {
        return;
    }
    // 時間がかかる時はスピナーを表示する
    // show a spinner
    if (app.stepConfig >= 5000000) {
        $step.append(spinner);
        $step.disabled = true;

        // 他のボタンも一時的に無効化する app.runで有効化される
        $reset.disabled = true;
        $start.disabled = true;
        $stop.disabled = true;

        setTimeout(() => {
            // $step.disabled = false; // app.runで更新されるため必要ない
            app.run(app.stepConfig);
            $step.removeChild(spinner);
        }, 33); // 走らせるタミングを遅らせることでスピナーの表示を確定させる
    } else {
        app.run(app.stepConfig);
    }
});

const SRC_KEY = 'src';

// サンプル
$sampleCodes.forEach(e => {
    if (!(e instanceof HTMLElement)) {
        throw Error('is not HTMLElement');
    }

    e.addEventListener('click', () => {
        $samples.disabled = true;
        const src = e.dataset[SRC_KEY];
        fetch(DATA_DIR + src).then(res => res.text()).then(text => {
            $input.value = text;
            app.reset();
        }).catch(() => {
            console.error(`Fetch Error: ${src}`);
        }).finally(() => {
            $samples.disabled = false;
        });
    });
});

// 周波数の設定
/** @type {number[]} */
const frequencyArray = [];
for (let i = 0; i < 7; i++) {
    const base = 10 ** i;
    for (let j = 1; j <= 9; j++) {
        frequencyArray.push(base * j);
    }
}

frequencyArray.push(10 ** 7);

$frequencyInput.min = "0";
$frequencyInput.max = (frequencyArray.length - 1).toString();

$frequencyInput.addEventListener('input', () => {
    const value = parseInt($frequencyInput.value, 10);
    app.frequency = frequencyArray[value] ?? DEFUALT_FREQUENCY;
    app.renderFrequencyOutput();
});

// 開閉で描画
$b2dDetail.addEventListener('toggle', () => {
    app.renderB2D();
});

$binaryRegisterDetail.addEventListener('toggle', () => {
    app.renderBinary();
});

$unaryRegisterDetail.addEventListener('toggle', () => {
    app.renderUnary();
});

// ファイルインポート
importFileAsText($fileImport, result => {
    $input.value = result;
    app.reset();
});

// ** Modal ** //

$stepInput.addEventListener('input', () => {
    const n = Number($stepInput.value);
    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
        setCustomError($stepInput, 'Enter a positive integer');
        app.stepConfig = 1;
    } else {
        removeCustomError($stepInput);
        app.stepConfig = n;
    }
});

// バイナリを非表示にする
const HIDE_BINARY_KEY = 'hide_binary';

$hideBinary.addEventListener('change', () => {
    app.renderBinary();
    localStorage.setItem(HIDE_BINARY_KEY, $hideBinary.checked.toString());
});

const REVERSE_BINARY_KEY = 'reverse_binary';

$reverseBinary.addEventListener('change', () => {
    app.renderBinary();
    localStorage.setItem(REVERSE_BINARY_KEY, $reverseBinary.checked.toString());
});

// ダークモード
// bodyタグ直下で設定してDark mode flashingを防ぐ
const DARK_MODE_KEY = 'dark_mode';
$darkMode.addEventListener('change', () => {
    const onOrOff = $darkMode.checked ? "on" : "off";
    localStorage.setItem(DARK_MODE_KEY, onOrOff);
    document.body.setAttribute('apge_dark_mode', onOrOff);

    $darkModeLabel.textContent = $darkMode.checked ? "On" : "Off";
});

$b2dHidePointer.addEventListener('change', () => {
    app.renderB2D();
});

const B2D_FLIP_UPSIDE_DOWN_KEY = 'b2d_flip_upside_down';

$b2dFlipUpsideDown.addEventListener('change', () => {
    localStorage.setItem(
        B2D_FLIP_UPSIDE_DOWN_KEY,
        $b2dFlipUpsideDown.checked.toString()
    );
    app.renderB2D();
});

// showの場合クラスが追加されない
$statsModal.addEventListener('shown.bs.modal', () => {
    app.renderStats();
});

// キーボード入力
// keyboard input
// Enter: toggle Start and Stop
// Space: Step
document.addEventListener('keydown', e => {
    const activeElementTagName =
        document.activeElement?.tagName.toUpperCase() ?? "";
    const tags = ["TEXTAREA", "INPUT", "DETAILS", "BUTTON", "AUDIO", "VIDEO", "SELECT", "OPTION"];
    // 入力中は無し
    if (tags.includes(activeElementTagName)) {
        return;
    }

    switch (e.code) {
        case "Enter": {
            switch (app.appState) {
                case "Running": return app.stop();
                case "Stop": return app.start();
            }
            break;
        }
        case "Space": {
            // ステップが無効化されていないときだけ
            if (!$step.disabled) {
                // スペースで下に移動することを防ぐ
                e.preventDefault();
                // 実行中の場合は停止する
                if (app.appState === "Running") {
                    app.stop();
                }
                app.run(app.stepConfig);
            }
            break;
        }
    }
});

// ボタンの有効化
$samples.disabled = false;
$configButton.disabled = false;
$statsButton.disabled = false;

// 初回描画
// first render
try {
    app.render();
    app.frequencyManager.start();
} catch (e) {
    console.error('first render failed');
    console.log(e);
}

idle(() => {
    // 実行時間が掛かる処理をまとめる
    if (localStorage.getItem(B2D_FLIP_UPSIDE_DOWN_KEY) === "true") {
        $b2dFlipUpsideDown.checked = true;
    }

    if (localStorage.getItem(REVERSE_BINARY_KEY) === "true") {
        $reverseBinary.checked = true;
    }

    if (localStorage.getItem(HIDE_BINARY_KEY) === "true") {
        $hideBinary.checked = true;
    }
    // ダークモードについてはbodyタグ直下でも設定する
    if (localStorage.getItem(DARK_MODE_KEY) === "on") {
        document.body.setAttribute('apge_dark_mode', "on");
        $darkMode.checked = true;
        $darkModeLabel.textContent = "On";
    }
});

// サンプルコードをプレフェッチ
idle(() => {
    try {
        const saveData = getSaveData();
        if (saveData === false || saveData === undefined) {
            // <link rel="prefetch" href="second.html">
            $sampleCodes.forEach(e => {
                if (!(e instanceof HTMLElement)) {
                    throw Error('is not HTMLElement');
                }
                const src = e.dataset[SRC_KEY];
                if (src !== undefined) {
                    const link = document.createElement('link');
                    link.rel = "prefetch";
                    link.href = DATA_DIR + src;
                    document.head.append(link);
                }
            });
        }
    } catch (e) {
        console.error(e);
    }
});
