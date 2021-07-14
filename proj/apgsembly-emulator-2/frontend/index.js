// @ts-check

import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";
import { Frequency } from "./util/frequency.js";
import { setCustomError, removeCustomError } from "./util/validation_ui.js";

import { renderB2D } from "./renderB2D.js";
import {
    $error,
    $input,
    $output,
    $steps,
    $start,
    $stop,
    $reset,
    $step,
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
    $binaryRegister,
    $binaryRegisterDetail,
    $addSubMul,
    $fileImport,
    $sampleCodes,
    $stepInput,
    $hideBinary,
    $breakpointSelect,
    $darkMode,
} from "./bind.js";
import { makeSpinner } from "./util/spinner.js";

// データ
// GitHub Pagesは1階層上になる
const DATA_DIR = location.origin.includes('github') ? "../apgsembly-emulator-2/data/" : "../data/";

/**
 * @typedef {"Initial" | "Running" | "Stop" | "ParseError" | "RuntimeError" | "Halted"} AppState
 */

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
        this.frequency = 30; // index.htmlと同期する

        /**
         * エラーメッセージ
         */
        this.errorMessage = "";

        /** ステップ数設定 */
        this.stepConfig = 1;

        this.frequencyManager = new Frequency(() => this.appState === "Running", () => this.frequency, n => this.run(n));
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
            $unaryRegister.innerHTML = "";
            return;
        }
        const regs = this.machine.actionExecutor.uRegMap;
        const unaryHeader = document.createElement('tr');
        for (const [key, value] of regs) {
            const th = document.createElement('th');
            th.textContent = `U${key}`;
            unaryHeader.appendChild(th);
        }
        const unaryData = document.createElement('tr');
        for (const [key, value] of regs) {
            const td = document.createElement('td');
            td.textContent = value.getValue().toString();
            unaryData.appendChild(td);
        }
        const unaryTable = document.createElement('table');
        unaryTable.appendChild(unaryHeader);
        unaryTable.appendChild(unaryData);
        unaryTable.classList.add('table')

        // 幅を均等にする
        unaryTable.style.tableLayout = "fixed";
        // 16pxから変更
        unaryTable.style.marginBottom = "0px";
        $unaryRegister.innerHTML = "";
        $unaryRegister.appendChild(unaryTable);
    }

    /**
     * バイナリレジスタの表示の初期化
     */
    setUpBinary() {
        if (this.machine === undefined) {
            $binaryRegister.innerHTML = "";
            return;
        }
        const regs = this.machine.actionExecutor.bRegMap;
        const table = document.createElement('table');
        for (const [key, reg] of regs) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = `B${key}`;
            const td = document.createElement('td');

            if (true) {
                const code0 = document.createElement('code');
                code0.style.color = "black";
                // 長い場合は改行を入れる
                code0.style.wordBreak = "break-all";            
    
                const decimal = document.createElement('span');
                decimal.classList.add('decimal');
                const pointer = document.createElement('span');
                pointer.classList.add('pointer');
                code0.append(decimal, pointer);
                const br = document.createElement('br');
                td.append(code0, br);
            }
            if (true) {
                const code = document.createElement('code');
                code.style.wordBreak = "break-all";
                const $prefix = document.createElement('span');
                $prefix.classList.add('prefix');
                const $head = document.createElement('span');
                $head.style.color = "#0D47A1";
                // 下線
                $head.style.borderBottom = "3px solid #0D47A1";
                $head.classList.add('head');
                const $suffix = document.createElement('span');
                $suffix.classList.add('suffix');
                code.append($prefix, $head, $suffix);
                td.append(code);
            }

            tr.append(th, td);
            table.append(tr);
        }
        $binaryRegister.innerHTML = "";
        $binaryRegister.append(table);
    }

    /**
     * ブレークポイントの選択肢の設定
     */
    setUpBreakpointSelect() {
        $breakpointSelect.innerHTML = "";
        const none = document.createElement('option');
        none.textContent = "None";
        none.value = "-1";
        none.selected = true;
        $breakpointSelect.append(none);
        const stateMap =  this.machine.getStateMap();
        for (const state of this.machine.states) {
            const option = document.createElement('option');
            option.textContent = state;
            option.value = stateMap.get(state)?.toString();
            $breakpointSelect.append(option);
        }
    }

    /**
     * machineがセットされた時のコールバック
     */
    onMachineSet() {
        this.setUpUnary();
        this.setUpBinary();
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
                this.errorMessage = e.message;
                this.render();
            }
        }
    }

    /**
     * 周波数の表示
     */
    renderFrequencyOutput() {
        if (typeof app.frequency.toLocaleString === "function") {
            // with ","
            $freqencyOutput.textContent = app.frequency.toLocaleString() + "Hz";
        } else {
            $freqencyOutput.textContent = app.frequency.toString() + "Hz";
        }
    }

    // エラーメッセージ
    renderErrorMessage() {
        if (this.appState === "RuntimeError" || this.appState === "ParseError") {
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
            $command.textContent = this.machine?.getNextCompiledCommandWithNextState().command.pretty();
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

        const b2d = this.machine?.actionExecutor.b2d;
        if (b2d !== null && b2d !== undefined) {
            renderB2D(context, this.machine?.actionExecutor.b2d);
            $b2dx.textContent = b2d.x.toString();
            $b2dy.textContent = b2d.y.toString();
        } else {
            $b2dx.textContent = "0";
            $b2dy.textContent = "0";
            context.clearRect(0, 0, $canvas.width, $canvas.height);
        }
    }

    /**
     * スライディングレジスタの表示
     */
    renderUnary() {
        if (this.machine === undefined) {
            return;
        }
        const rows = $unaryRegister.querySelectorAll('tr');
        const row = rows[1];
        if (row === undefined) {
            return;
        }
        const items = row.children;
        let i = 0;
        for (const reg of this.machine.actionExecutor.uRegMap.values()) {
            items[i].textContent = reg.getValue().toString();
            i++;
        }
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
        const rows = $binaryRegister.querySelectorAll('tr');
        let i = 0;
        const hideBinary = $hideBinary.checked;
        for (const reg of this.machine.actionExecutor.bRegMap.values()) {
            const row = rows[i];
            if (hideBinary) {
                row.querySelector('.prefix').textContent = '';
                row.querySelector('.head').textContent = '';
                row.querySelector('.suffix').textContent = '';
            } else {
                const obj = reg.toObject();
                row.querySelector('.prefix').textContent = obj.prefix.join('');
                row.querySelector('.head').textContent = obj.head.toString();
                row.querySelector('.suffix').textContent = obj.suffix.join('');
            }
            row.querySelector('.decimal').textContent = "value = " + reg.toDecimalString();
            row.querySelector('.pointer').textContent = ", pointer = " + reg.pointer.toString();
            i++;
        }
    }

    renderAddSubMul() {
        if (this.machine === undefined) {
            $addSubMul.textContent = "";
            return;
        }
        $addSubMul.textContent = `
        ADD = ${this.machine.actionExecutor.add.toStringDetail()},
        SUB = ${this.machine.actionExecutor.sub.toStringDetail()},
        MUL = ${this.machine.actionExecutor.mul.toString()}
        `;
    }

    renderOutput() {
        const output = this.machine?.actionExecutor.output.getString();
        if (output !== undefined) {
            $output.value = output;
        } else {
            $output.value = "";
        }
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
        this.renderCommand();
        this.renderErrorMessage();
        this.renderB2D();
        this.renderUnary();
        this.renderBinary();
        this.renderAddSubMul();
        this.renderFrequencyOutput();
        // output
        this.renderOutput();

        $steps.textContent = this.steps.toString();

        // current state
        $currentState.textContent = this.machine?.currentState;
        $previousOutput.textContent = this.machine?.getPreviousOutput();
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

        // ブレークポイントの処理
        let breakpointIndex = -1;
        const n = parseInt($breakpointSelect.value, 10);
        if (!isNaN(n)) {
            breakpointIndex = n;
        }

        const machine = this.machine;
        for (let i = 0; i < steps; i++) {
            try {
                const res = machine.execCommand();
                if (res === "HALT_OUT") {
                    this.appState = "Halted";
                    this.steps += i + 1; 
                    this.render();
                    return;
                }
                // ブレークポイントの状態の場合、停止する
                if (machine.getCurrentStateIndex() === breakpointIndex) {
                    this.appState = "Stop";
                    this.steps += i + 1;
                    this.render();
                    return;
                }
            } catch (e) {
                this.appState = "RuntimeError";
                this.errorMessage = e.message;
                this.steps += i + 1; // 1回目でエラーが発生したら1ステップとする
                this.render();
                return;
            }
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
        setTimeout(() => {
            // $step.disabled = false; // app.runで更新されるため必要ない
            app.run(app.stepConfig);
            $step.removeChild(spinner);
        }, 33); // 走らせるタミングを遅らせることでスピナーの表示を確定させる
    } else {
        app.run(app.stepConfig);
    }
});

// サンプル
$sampleCodes.forEach(e => {
    if (!(e instanceof HTMLElement)) {
        throw Error('is not HTMLElement');
    }
    e.addEventListener('click', () => {
        fetch(DATA_DIR + e.dataset.src).then(res => res.text()).then(text => {
            $input.value = text;
            app.reset();
        }).catch(() => {
            console.log('Fetch Error: ' + e.dataset.src);
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
    const value = parseInt($frequencyInput.value);
    app.frequency = frequencyArray[value]
    app.renderFrequencyOutput();
});

// 開閉で描画
$b2dDetail.addEventListener('toggle', () => {
    app.renderB2D();
});

$binaryRegisterDetail.addEventListener('toggle', () => {
    app.renderBinary();
});

// ファイルインポート
$fileImport.addEventListener('input', (e) => {
    const reader = new FileReader();
    reader.onload = function (e) {
        const result = e.target?.result;
        if (typeof result !== "string") {
            throw Error('import: internal error');
        }
        $input.value = result;
        app.reset();
    };
    // @ts-ignore
    reader.readAsText(e.target.files[0]);
});

// ** Modal ** //

$stepInput.addEventListener('input', () => {
    const n = Number($stepInput.value)
    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
        setCustomError($stepInput, 'Enter a positive integer');
        app.stepConfig = 1;
    } else {
        removeCustomError($stepInput);
        app.stepConfig = n;
    }
});

// バイナリを非表示にする
$hideBinary.addEventListener('change', () => {
    app.renderBinary();
});

// ダークモード
$darkMode.addEventListener('change', () => {
    const onOrOff = $darkMode.checked ? "on" : "off"; 
    localStorage.setItem('dark_mode', onOrOff);
    document.body.setAttribute('apge_dark_mode', onOrOff);

    $darkMode.parentElement.querySelector('label').textContent = $darkMode.checked ? "On" : "Off";
});

if (localStorage.getItem('dark_mode') === "on") {
    document.body.setAttribute('apge_dark_mode', "on");
    $darkMode.checked = true;
    $darkMode.parentElement.querySelector('label').textContent = "On";
}

// キーボード入力
// keyboard input
// Enter: toggle Start and Stop
// Space: Step
document.addEventListener('keydown', e => {
    // 入力中は無し
    if (document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "DETAILS"
        ) {
        return;
    }

    if (e.code === "Enter") {
        if (app.appState === "Running") {
            app.stop();
        } else if (app.appState === "Stop") {
            app.start();
        }
    } else if (e.code === "Space") {
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
    }
});

// 初回描画
// first render
try {
    app.render();
} catch (e) {
    console.error('first render failed');
    console.log(e);
}

app.frequencyManager.start();
