// @ts-check

import { Machine } from "../src/Machine.js";

// Components
import { startButton, stopButton } from "./components/toggle.js";
import { renderErrorMessage } from "./components/error.js";
import { renderOutput } from "./components/output.js";
import { UnaryUI } from "./components/unary_ui.js";
import { BinaryUI } from "./components/binary_ui.js";
import { renderB2D } from "./components/renderB2D.js";
import { StatsUI } from "./components/stats_ui.js";
import {
    getBreakpointInput,
    initializeBreakpointSelect,
} from "./components/breakpoint.js";

import { Valve } from "./util/valve.js";
import { getMessageFromError } from "./util/get-message-from-error.js";
import { makeSpinner } from "./util/spinner.js";

import {
    $addSubMul,
    $b2dDetail,
    $b2dFlipUpsideDown,
    $b2dHidePointer,
    $b2dPos,
    $binaryRegister,
    $binaryRegisterDetail,
    $breakpointInputSelect,
    $breakpointSelect,
    $canvas,
    $command,
    $currentState,
    $error,
    $freqencyOutput,
    $input,
    $output,
    $previousOutput,
    $reset,
    $statsBody,
    $statsButton,
    $statsModal,
    $statsNumberOfStates,
    $step,
    $stepCount,
    $stepText,
    $toggle,
    $unaryRegister,
    $unaryRegisterDetail,
    binaryConfig,
    context,
} from "./bind.js";

/** index.htmlと同期すること */
export const DEFUALT_FREQUENCY = 30;

/**
 * @typedef {"Initial" | "Running" | "Stop" | "ParseError" |
 *           "RuntimeError" | "Halted"} AppState
 */

/**
 * APGsembly 2.0 Emulator frontend application
 */
export class App {
    /** @type {AppState | undefined} */
    #prevAppState;
    /** エラーメッセージ */
    #errorMessage = "";
    /** @type {Machine | undefined} */
    #machine;
    /** @type {undefined | number} */
    #prevFrequency;
    /** @readonly */
    #unaryUI = new UnaryUI($unaryRegister);
    /** @readonly */
    #binaryUI = new BinaryUI($binaryRegister);
    /** @readonly */
    #statsUI = new StatsUI($statsBody, $statsNumberOfStates);
    /** @readonly */
    #valve;
    /**
     * アプリ状態
     * @type {AppState}
     */
    #appState = "Initial";
    constructor() {
        /** ステップ数設定 */
        this.stepConfig = 1;

        this.#valve = new Valve((value) => {
            this.run(value);
        }, { frequency: DEFUALT_FREQUENCY });
    }

    /**
     * @param {number} freq
     */
    setFrequency(freq) {
        this.#valve.frequency = freq;
        this.#renderFrequencyOutput();
    }

    /**
     * 実行を開始する
     * Start execution
     */
    start() {
        switch (this.#appState) {
            case "Initial": {
                // 初期化に成功していれば走らせる
                if (this.reset()) {
                    this.#appState = "Running";
                }
                break;
            }
            case "Stop": {
                this.#appState = "Running";
                break;
            }
            default: {
                throw Error("start: unreachable");
            }
        }
        this.render();
    }

    /**
     * 停止する
     * Stop execution
     */
    stop() {
        this.#appState = "Stop";
        this.render();
    }

    toggle() {
        if (this.#appState === "Running") {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * スライディングレジスタ表示の初期化
     */
    #setUpUnary() {
        if (this.#machine === undefined) {
            this.#unaryUI.clear();
        } else {
            this.#unaryUI.initialize(this.#machine.actionExecutor.uRegMap);
        }
    }

    /**
     * バイナリレジスタの表示の初期化
     */
    #setUpBinary() {
        if (this.#machine === undefined) {
            this.#binaryUI.clear();
        } else {
            this.#binaryUI.initialize(this.#machine.actionExecutor.bRegMap);
        }
    }

    /**
     * machineがセットされた時のコールバック
     */
    #onMachineSet() {
        this.#setUpUnary();
        this.#setUpBinary();
        this.#setUpStats();
        initializeBreakpointSelect($breakpointSelect, this.#machine);
    }

    doStep() {
        // 実行中の場合は停止する
        if (this.#appState === "Running") {
            this.stop();
        }
        // 時間がかかる時はスピナーを表示する
        // show a spinner
        if (this.stepConfig >= 5000000) {
            const spinner = makeSpinner();
            spinner.style.position = "absolute";
            $step.append(spinner);

            // Stepの文字を透明にしてボタンの幅を維持する
            $stepText.style.color = "transparent";
            $step.disabled = true;
            // 他のボタンも一時的に無効化する app.runで有効化される
            $reset.disabled = true;
            $toggle.disabled = true;

            setTimeout(() => {
                try {
                    this.run(this.stepConfig);
                } finally {
                    $stepText.style.color = "";
                    spinner.remove();
                }
            }, 33); // 走らせるタイミングを遅らせることでスピナーの表示を確定させる
        } else {
            this.run(this.stepConfig);
        }
    }

    /**
     * コードを変更してリセットする
     * @param {string} text
     */
    setInputAndReset(text) {
        $input.value = text;
        this.reset();
    }

    /**
     * 状態をリセットし、パースする
     * @returns {boolean} 成功
     */
    reset() {
        this.#errorMessage = "";
        this.#machine = undefined;
        this.#valve.reset();

        try {
            this.#machine = Machine.fromString($input.value);
            this.#onMachineSet();
            this.#appState = "Stop";
        } catch (e) {
            this.#appState = "ParseError";
            this.#errorMessage = getMessageFromError(e);
            this.render();
            return false;
        }

        this.render();
        return true;
    }

    /**
     * 周波数の表示
     */
    #renderFrequencyOutput() {
        const currentFreqeucy = this.#valve.frequency;
        if (this.#prevFrequency !== currentFreqeucy) {
            $freqencyOutput.textContent = currentFreqeucy.toLocaleString();
            this.#prevFrequency = currentFreqeucy;
        }
    }

    /**
     * 次のコマンドの表示
     */
    #renderCommand() {
        try {
            const next = this.#machine?.getNextCommand();
            $command.textContent = next?.command.pretty() ?? "";
        } catch (error) {
            // internal error
            console.error(error);
        }
    }

    /**
     * B2Dの表示
     */
    renderB2D() {
        if (!$b2dDetail.open) {
            return;
        }
        const machine = this.#machine;
        if (machine === undefined) {
            $b2dPos.x.textContent = "0";
            $b2dPos.y.textContent = "0";
            context.clearRect(0, 0, $canvas.width, $canvas.height);
            context.resetTransform();
            return;
        }
        const b2d = machine.actionExecutor.b2d;
        $b2dPos.x.textContent = b2d.x.toString();
        $b2dPos.y.textContent = b2d.y.toString();

        const start = performance.now();
        renderB2D(
            context,
            b2d,
            $b2dHidePointer.checked,
            $b2dFlipUpsideDown.checked,
        );

        // 描画に時間がかかっている場合閉じる
        if (this.#appState === "Running" && performance.now() - start >= 200) {
            $b2dDetail.open = false;
        }
    }

    /**
     * スライディングレジスタの表示
     */
    renderUnary() {
        if (this.#machine !== undefined && $unaryRegisterDetail.open) {
            this.#unaryUI.render(this.#machine.actionExecutor.uRegMap);
        }
    }

    /**
     * バイナリレジスタの表示
     */
    renderBinary() {
        if (this.#machine !== undefined && $binaryRegisterDetail.open) {
            this.#binaryUI.render(
                this.#machine.actionExecutor.bRegMap,
                binaryConfig.$hideBits.checked,
                binaryConfig.$reverseBits.checked,
                binaryConfig.$showBinaryValueInDecimal.checked,
                binaryConfig.$showBinaryValueInHex.checked,
            );
        }
    }

    #renderOutput() {
        const output = this.#machine?.actionExecutor.output.getString();
        renderOutput($output, output);
    }

    #setUpStats() {
        if (this.#machine === undefined) {
            this.#statsUI.clear();
        } else {
            this.#statsUI.initialize(
                this.#machine.getStateStats(),
                this.#machine.states,
            );
        }
    }

    renderStats() {
        if (!$statsModal.classList.contains("show")) {
            return;
        }
        if (this.#machine === undefined) {
            this.#statsUI.clear();
            return;
        }
        this.#statsUI.render(
            this.#machine.getStateStats(),
            this.#machine.currentStateIndex,
        );
    }

    /**
     * AppStateのみに依存する
     */
    #renderButton() {
        // ボタンの有効無効
        switch (this.#appState) {
            case "Initial": {
                startButton($toggle);
                $step.disabled = false;
                $reset.disabled = false;
                $statsButton.disabled = true;
                break;
            }
            case "Stop": {
                startButton($toggle);
                $step.disabled = false;
                $reset.disabled = false;
                $statsButton.disabled = false;
                break;
            }
            case "Running": {
                stopButton($toggle);
                $step.disabled = true;
                $reset.disabled = true;
                $statsButton.disabled = false;
                break;
            }
            case "RuntimeError":
            case "ParseError": {
                startButton($toggle);
                $toggle.disabled = true; // disable
                $step.disabled = true;
                $reset.disabled = false;
                $statsButton.disabled = true;
                break;
            }
            case "Halted": {
                startButton($toggle);
                $toggle.disabled = true; // disable
                $step.disabled = true;
                $reset.disabled = false;
                $statsButton.disabled = false;
                break;
            }
        }
    }

    /**
     * 全体を描画する
     */
    render() {
        const appState = this.#appState;
        // set valve
        this.#valve.disabled = appState !== "Running";

        // Stop状態はStepで変化する可能性がある
        if (this.#prevAppState !== appState || appState === "Stop") {
            this.#renderButton();

            // ParseErrorのときにエラー表示
            if (appState === "ParseError") {
                $input.classList.add("is-invalid");
            } else {
                $input.classList.remove("is-invalid");
            }
        }

        renderErrorMessage($error, appState, this.#errorMessage);

        this.#renderFrequencyOutput();

        const machine = this.#machine;
        $currentState.textContent = machine?.getCurrentState() ?? "";
        $previousOutput.textContent = machine?.getPreviousOutput() ?? "";
        $stepCount.textContent = machine?.stepCount.toLocaleString() ?? "";

        if (this.stepConfig === 1) {
            $stepText.textContent = "Step";
        } else {
            $stepText.textContent = `${this.stepConfig.toLocaleString()} Steps`;
        }

        this.#renderCommand();
        this.#renderOutput();
        this.renderUnary();
        this.renderBinary();
        $addSubMul.textContent =
            machine?.actionExecutor.addSubMulToUIString() ??
                "";
        this.renderB2D();
        this.renderStats();

        this.#prevAppState = appState;
    }

    /**
     * `steps`ステップ走らせる
     * @param {number} steps
     */
    run(steps) {
        switch (this.#appState) {
            case "Initial": {
                // エラーであれば走らせない
                if (!this.reset()) {
                    return;
                }
            }
        }

        if (steps <= 0 || isNaN(steps)) {
            // no render
            return;
        }

        const machine = this.#machine;
        if (machine === undefined) {
            return;
        }

        const isRunning = this.#appState === "Running";

        // ブレークポイントの処理
        const breakpointIndex = parseInt($breakpointSelect.value, 10);
        const breakpointInputValue = getBreakpointInput($breakpointInputSelect);

        try {
            const resultState = machine.exec(
                steps,
                isRunning,
                breakpointIndex,
                breakpointInputValue,
            );
            if (resultState !== undefined) {
                this.#appState = resultState;
            }
        } catch (error) {
            this.#appState = "RuntimeError";
            this.#errorMessage = getMessageFromError(error);
        } finally {
            this.render();
        }
    }
}
