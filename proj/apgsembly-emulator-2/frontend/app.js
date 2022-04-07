// @ts-check

import { Frequency } from "./util/frequency.js";

import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";

// Components
import { renderB2D } from "./components/renderB2D.js";
import { UnaryUI } from "./components/unary_ui.js";
import { BinaryUI } from "./components/binary_ui.js";
import { StatsUI } from "./components/stats_ui.js";
import {
    startButton,
    startButtonDisabled,
    stopButton
} from "./components/toggle.js";
import { renderOutput } from "./components/output.js";


import {
    $error,
    $input,
    $output,
    $steps,
    $toggle,
    $reset,
    $step,
    $currentState,
    $previousOutput,
    $freqencyOutput,
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

    // Modal
    $hideBinary,
    $reverseBinary,
    $showBinaryValueInDecimal,
    $showBinaryValueInHex,
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

/** index.htmlと同期する */
export const DEFUALT_FREQUENCY = 30;

const hasToLocaleString = typeof (42).toLocaleString === 'function';

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
         * ステップ数
         * @private
         */
        this.steps = 0;

        /**
         * アプリ状態
         * @type {import("./index.js").AppState}
         */
        this.appState = "Initial";

        /**
         * frequency of update
         * 周波数[Hz]
         */
        this.frequency = DEFUALT_FREQUENCY;

        /**
         * エラーメッセージ
         * @private
         */
        this.errorMessage = "";

        /** ステップ数設定 */
        this.stepConfig = 1;

        /**
         * @readonly
         * @private
         */
        this.frequencyManager = new Frequency(
            () => this.appState === "Running",
            () => this.frequency,
            n => this.run(n)
        );

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
        this.statsUI = new StatsUI($statsBody);
    }

    /**
     * 初期化
     */
    initializeApp() {
        try {
            this.render();
            this.frequencyManager.start();
        } catch (e) {
            console.error('first render failed');
            console.log(e);
        }
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
     * @private
     */
    setUpUnary() {
        if (this.machine === undefined) {
            this.unaryUI.clear();
            return;
        }
        const regs = this.machine.actionExecutor.uRegMap;
        this.unaryUI.initialize(regs);
    }

    /**
     * バイナリレジスタの表示の初期化
     * @private
     */
    setUpBinary() {
        if (this.machine === undefined) {
            this.binaryUI.clear();
            return;
        }
        this.binaryUI.initialize(this.machine.actionExecutor.bRegMap);
    }

    /**
     * ブレークポイントの選択肢の設定
     * @private
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
     * @private
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
        this.machine = undefined;
        this.frequencyManager.reset();
        const program = Program.parse($input.value);
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

    /**
     * エラーメッセージ
     * @private
     */
    renderErrorMessage() {
        if (this.appState === "RuntimeError" ||
            this.appState === "ParseError") {
            const messages = this.errorMessage.split('\n');
            $error.innerHTML = "";
            for (const message of messages) {
                const span = document.createElement('span');
                span.textContent = "- " + message;
                const br = document.createElement('br');
                $error.append(span, br);
            }
            $error.classList.remove('d-none');
            console.error("RENDER: " + this.errorMessage);
        } else {
            $error.classList.add('d-none');
        }
    }

    /**
     * 次のコマンドの表示
     * @private
     */
    renderCommand() {
        try {
            const next = this.machine?.getNextCompiledCommandWithNextState(false);
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
        this.unaryUI.render(this.machine.actionExecutor.uRegMap);
    }

    /**
     * バイナリレジスタの表示
     */
    renderBinary() {
        const machine = this.machine;
        if (machine === undefined) {
            return;
        }

        if (!$binaryRegisterDetail.open) {
            return;
        }

        this.binaryUI.render(
            machine.actionExecutor.bRegMap,
            $hideBinary.checked,
            $reverseBinary.checked,
            $showBinaryValueInDecimal.checked,
            $showBinaryValueInHex.checked
        );
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
            $statsNumberOfStates.textContent = '';
            this.statsUI.clear();
            return;
        }
        $statsNumberOfStates.textContent = this.machine.states.length.toString();
        this.statsUI.initialize(this.machine.stateStats, this.machine.states);
    }

    /**
     * @property
     */
    renderStats() {
        if (!$statsModal.classList.contains('show')) {
            return;
        }
        if (this.machine === undefined) {
            this.statsUI.clear();
            return;
        }
        this.statsUI.render(
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

        // ParseErrorのときにエラー表示
        if (this.appState === "ParseError") {
            $input.classList.add('is-invalid');
        } else {
            $input.classList.remove('is-invalid');
        }

        this.renderErrorMessage();
        this.renderFrequencyOutput();

        $steps.textContent = hasToLocaleString ? this.steps.toLocaleString() : this.steps.toString();

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

        const isRunning = this.appState === "Running";

        // ブレークポイントの処理
        let breakpointIndex = -1;
        const tempN = parseInt($breakpointSelect.value, 10);
        if (!isNaN(tempN)) {
            breakpointIndex = tempN;
        }

        // -1: *
        // 0 : Z
        // 1 : NZ
        const biStr = $breakpointInputSelect.value;
        const breakpointInputValue =
            biStr === "any" ? -1 :
            biStr === "zero" ? 0 : 1;

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
                // 1フレームに50ms以上時間が掛かっていたら、残りはスキップする
                if (isRunning && i % 500000 === 0 && (performance.now() - start >= 50)) {
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
