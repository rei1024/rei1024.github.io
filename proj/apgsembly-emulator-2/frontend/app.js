// @ts-check

import { Machine } from "../src/Machine.js";

// Components
import {
    startButton,
    startButtonDisabled,
    stopButton
} from "./components/toggle.js";

import { renderErrorMessage } from "./components/error.js";
import { renderOutput } from "./components/output.js";
import { UnaryUI } from "./components/unary_ui.js";
import { BinaryUI } from "./components/binary_ui.js";
import { renderB2D } from "./components/renderB2D.js";
import { StatsUI } from "./components/stats_ui.js";
import { initializeBreakpointSelect, getBreakpointInput } from "./components/breakpoint.js";

import { CVE, CVEEvent } from "./util/continuously-variable-emitter.js";
import { getMessage } from "./util/get-message.js";
import { makeSpinner } from "./util/spinner.js";

import {
    $error,
    $input,
    $output,
    $stepCount,
    $toggle,
    $reset,
    $step,
    $currentState,
    $previousOutput,
    $freqencyOutput,
    $command,
    $canvas,
    context,
    $b2dPos,
    $b2dDetail,
    $unaryRegister,
    $unaryRegisterDetail,
    $binaryRegister,
    $binaryRegisterDetail,
    $addSubMul,

    // Modal
    binaryConfig,
    $breakpointSelect,
    $breakpointInputSelect,
    $b2dHidePointer,
    $b2dFlipUpsideDown,

    // Stats
    $statsModal,
    $statsBody,
    $statsNumberOfStates,
    $statsButton,
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
    constructor() {
        /**
         * @type {Machine | undefined}
         * @private
         */
        this.machine = undefined;

        /**
         * アプリ状態
         * @type {AppState}
         */
        this.appState = "Initial";

        /**
         * @private
         * @type {AppState | undefined}
         */
        this.prevAppState = undefined;

        /**
         * エラーメッセージ
         * @private
         */
        this.errorMessage = "";

        /** ステップ数設定 */
        this.stepConfig = 1;

        /**
         * @private
         * @readonly
         */
        this.cve = new CVE({ frequency: DEFUALT_FREQUENCY });
        this.cve.addEventListener('emit', ev => {
            if (ev instanceof CVEEvent) {
                this.run(ev.value);
            }
        });

        /**
         * @type {undefined | number}
         */
        this.prevFrequency = undefined;

        /**
         * @private
         * @readonly
         */
        this.unaryUI = new UnaryUI($unaryRegister);

        /**
         * @private
         * @readonly
         */
        this.binaryUI = new BinaryUI($binaryRegister);

        /**
         * @private
         * @readonly
         */
        this.statsUI = new StatsUI($statsBody, $statsNumberOfStates);
    }

    /**
     * @param {number} freq
     */
    setFrequency(freq) {
        this.cve.frequency = freq;
    }

    /**
     * 初期化
     */
    initializeApp() {
        this.render();
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
                break;
            }
            case "Stop": {
                this.appState = "Running";
                break;
            }
            default: {
                throw Error('start: unreachable');
            }
        }
        this.render();
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
     * @private
     */
    setUpUnary() {
        if (this.machine === undefined) {
            this.unaryUI.clear();
        } else {
            this.unaryUI.initialize(this.machine.actionExecutor.uRegMap);
        }
    }

    /**
     * バイナリレジスタの表示の初期化
     * @private
     */
    setUpBinary() {
        if (this.machine === undefined) {
            this.binaryUI.clear();
        } else {
            this.binaryUI.initialize(this.machine.actionExecutor.bRegMap);
        }
    }

    /**
     * machineがセットされた時のコールバック
     * @private
     */
    onMachineSet() {
        this.setUpUnary();
        this.setUpBinary();
        this.setUpStats();
        initializeBreakpointSelect($breakpointSelect, this.machine);
    }

    /**
     * コードを変更してリセットする
     * @param {string} text
     */
    setInputAndReset(text) {
        $input.value = text;
        this.reset();
    }

    toggle() {
        if (this.appState === "Running") {
            this.stop();
        } else {
            this.start();
        }
    }

    doStep() {
        // 実行中の場合は停止する
        if (this.appState === "Running") {
            this.stop();
        }
        // 時間がかかる時はスピナーを表示する
        // show a spinner
        if (this.stepConfig >= 5000000) {
            const spinner = makeSpinner();

            $step.append(spinner);
            $step.disabled = true;

            // 他のボタンも一時的に無効化する app.runで有効化される
            $reset.disabled = true;
            $toggle.disabled = true;

            setTimeout(() => {
                this.run(this.stepConfig);
                $step.removeChild(spinner);
            }, 33); // 走らせるタイミングを遅らせることでスピナーの表示を確定させる
        } else {
            this.run(this.stepConfig);
        }
    }

    /**
     * 状態をリセットし、パースする
     */
    reset() {
        this.errorMessage = "";
        this.machine = undefined;
        this.cve.reset();

        // Parse success
        try {
            this.machine = Machine.fromString($input.value);
            this.onMachineSet();
            this.appState = "Stop";
        } catch (e) {
            this.appState = "ParseError";
            this.errorMessage = getMessage(e);
        } finally {
            this.render();
        }
    }

    /**
     * 周波数の表示
     */
    renderFrequencyOutput() {
        const currentFreqeucy = this.cve.frequency;
        if (this.prevFrequency !== currentFreqeucy) {
            $freqencyOutput.textContent = currentFreqeucy.toLocaleString();
        }
        this.prevFrequency = currentFreqeucy;
    }

    /**
     * 次のコマンドの表示
     * @private
     */
    renderCommand() {
        const next = this.machine?.getNextCompiledCommandWithNextState(false);
        $command.textContent = next?.command.pretty() ?? "";
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
        if (this.machine !== undefined && $unaryRegisterDetail.open) {
            this.unaryUI.render(this.machine.actionExecutor.uRegMap);
        }
    }

    /**
     * バイナリレジスタの表示
     */
    renderBinary() {
        if (this.machine !== undefined && $binaryRegisterDetail.open) {
            this.binaryUI.render(
                this.machine.actionExecutor.bRegMap,
                binaryConfig.$hideBinary.checked,
                binaryConfig.$reverseBinary.checked,
                binaryConfig.$showBinaryValueInDecimal.checked,
                binaryConfig.$showBinaryValueInHex.checked
            );
        }
    }

    /**
     * @private
     */
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

    /**
     * @private
     */
    renderOutput() {
        const output = this.machine?.actionExecutor.output.getString();
        renderOutput($output, output);
    }

    /**
     * @private
     */
    setUpStats() {
        if (this.machine === undefined) {
            this.statsUI.clear();
        } else {
            this.statsUI.initialize(this.machine.getStateStats(), this.machine.states);
        }
    }

    renderStats() {
        if (!$statsModal.classList.contains('show')) {
            return;
        }
        if (this.machine === undefined) {
            this.statsUI.clear();
            return;
        }
        this.statsUI.render(
            this.machine.getStateStats(),
            this.machine.currentStateIndex
        );
    }

    /**
     * AppStateのみに依存する
     */
    renderButton() {
        // ボタンの有効無効
        switch (this.appState) {
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
                startButtonDisabled($toggle);
                $step.disabled = true;
                $reset.disabled = false;
                $statsButton.disabled = true;
                break;
            }
            case "Halted": {
                startButtonDisabled($toggle);
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
        // cve
        this.cve.disabled = this.appState !== "Running";

        // Stop状態はStepで変化する可能性がある
        if (this.prevAppState !== this.appState || this.appState === "Stop") {
            this.renderButton();

            // ParseErrorのときにエラー表示
            if (this.appState === "ParseError") {
                $input.classList.add('is-invalid');
            } else {
                $input.classList.remove('is-invalid');
            }
        }

        renderErrorMessage($error, this.appState, this.errorMessage);

        this.renderFrequencyOutput();

        $stepCount.textContent = this.machine?.stepCount.toLocaleString() ?? "";

        // current state
        $currentState.textContent = this.machine?.getCurrentState() ?? "";
        $previousOutput.textContent = this.machine?.getPreviousOutput() ?? "";

        this.renderCommand();
        this.renderOutput();
        this.renderUnary();
        this.renderBinary();
        this.renderAddSubMul();
        this.renderB2D();
        this.renderStats();

        this.prevAppState = this.appState;
    }

    /**
     * `steps`ステップ走らせる
     * @param {number} steps
     */
    run(steps) {
        switch (this.appState) {
            case "Initial": {
                this.reset();
                // エラーであれば走らせない
                // @ts-ignore
                if (this.appState !== "Stop") {
                    return;
                }
            }
        }

        if (steps <= 0 || Number.isNaN(steps)) {
            // no render
            return;
        }

        const machine = this.machine;
        if (machine === undefined) {
            return;
        }

        const isRunning = this.appState === "Running";

        // ブレークポイントの処理
        const breakpointIndex = parseInt($breakpointSelect.value, 10);
        const breakpointInputValue = getBreakpointInput($breakpointInputSelect);

        try {
            const resultState = machine.exec(
                steps,
                isRunning,
                breakpointIndex,
                breakpointInputValue
            );
            if (resultState !== undefined) {
                this.appState = resultState;
            }
        } catch (error) {
            this.appState = "RuntimeError";
            this.errorMessage = getMessage(error);
        }

        this.render();
    }
}
