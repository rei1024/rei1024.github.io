// @ts-check

import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";
import { Frequency } from "./frequency.js";
import { renderB2D } from "./renderB2D.js";
import { $type } from "./selector.js";

// データ
const DATA_DIR = "https://rei1024.github.io/proj/apgsembly-emulator-2/data/";

// エラーメッセージ
// Error messsage
const $error = $type('#error', HTMLElement);

// 入力
// APGsembly code
const $input = $type('#input', HTMLTextAreaElement);

// 出力
// OUTPUT component
const $output = $type('#output', HTMLTextAreaElement);

// ステップ数表示
const $steps = $type('#steps', HTMLElement);

// Start execution
const $start = $type('#start', HTMLButtonElement);

// Stop execution
const $stop = $type('#stop', HTMLButtonElement);

// Reset machine state and program
const $reset = $type('#reset', HTMLButtonElement);

// Step Button
const $step = $type('#step', HTMLButtonElement);

const $currentState = $type('#current_state', HTMLElement);

const $previousOutput = $type('#previous_output', HTMLElement);

const $stepConfig = $type('#step_config', HTMLButtonElement);

// スピード
const $frequencyInput = $type('#frequency_input', HTMLInputElement);

const $freqencyOutput = $type('#frequency_output', HTMLElement);

// 次のコマンド
// Next command
const $command = $type('#command', HTMLElement);

const $canvas = $type('#canvas', HTMLCanvasElement);

const context = $canvas.getContext('2d');
if (context == null) {
    throw Error('context is null');
}

// B2D
const $b2dx = $type('#b2dx', HTMLElement);
const $b2dy = $type('#b2dy', HTMLElement);

const $b2dDetail = $type('#b2d_detail', HTMLDetailsElement);

// スライディングレジスタ
const $unaryRegister = $type('#unary_register', HTMLElement);

// バイナリレジスタ
const $binaryRegister = $type('#binary_register', HTMLElement);

const $binaryRegisterDetail = $type('#binary_register_detail', HTMLDetailsElement);

const $addSubMul = $type('#add_sub_mul', HTMLElement);

// ファイルインポート
const $fileImport = $type('#import_file', HTMLInputElement);

/**
 * @typedef {"Initial" | "Running" | "Stop" | "ParseError" | "RuntimeError" | "Halted"} AppState
 */

export class App {
    constructor() {
        /** @type {Machine | undefined} */
        this.machine = undefined;

        /** ステップ数 */
        this.steps = 0;

        /**
         * @type {AppState}
         */
        this.appState = "Initial";

        /**
         * frequency of update
         * 周波数[Hz]
         */
        this.frequency = 30; // index.htmlと同期する

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
                // 成功していれば走らせる
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
        unaryTable.style.tableLayout = "fixed"

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
            const code = document.createElement('code');
            code.style.wordBreak = "break-all";
            const $prefix = document.createElement('span');
            $prefix.classList.add('prefix');
            const $head = document.createElement('span');
            $head.style.color = "#0D47A1";
            $head.classList.add('head');
            const $suffix = document.createElement('span');
            $suffix.classList.add('suffix');
            code.append($prefix, $head, $suffix);

            const decimal = document.createElement('td');
            decimal.classList.add('decimal');

            // 長い場合は改行を入れる
            decimal.style.wordBreak = "break-all";
            td.append(code);
            tr.append(th, td, decimal);
            table.append(tr);
        }
        $binaryRegister.innerHTML = "";
        $binaryRegister.append(table);
    }

    /**
     * machineがセットされた時のコールバック
     */
    onMachineSet() {
        this.setUpUnary();
        this.setUpBinary();
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

    renderCommand() {
        try {
            $command.textContent = this.machine?.getNextCommand().pretty();
        } catch (e) {
            $command.textContent = "";
        }
    }

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

    renderBinary() {
        if (this.machine === undefined) {
            return;
        }
        if (!$binaryRegisterDetail.open) {
            return;
        }
        const rows = $binaryRegister.querySelectorAll('tr');
        let i = 0;
        for (const reg of this.machine.actionExecutor.bRegMap.values()) {
            const row = rows[i];
            const obj = reg.toObject();
            row.querySelector('.prefix').textContent = obj.prefix.join('');
            row.querySelector('.head').textContent = obj.head.toString();
            row.querySelector('.suffix').textContent = obj.suffix.join('');
            row.querySelector('.decimal').textContent = reg.toDecimalString();
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

        for (let i = 0; i < steps; i++) {
            try {
                const res = this.machine.execCommand();
                if (res === "HALT_OUT") {
                    this.appState = "Halted";
                    this.render();
                    return;
                }
            } catch (e) {
                this.appState = "RuntimeError";
                this.errorMessage = e.message;
                this.render();
                return;
            }
            this.steps += 1;
        }
        this.render();
    }
}

const app = new App();

$start.addEventListener('click', () => {
    app.start();
});

$stop.addEventListener('click', () => {
    app.stop();
});

$reset.addEventListener('click', () => {
    app.reset();
});

$step.addEventListener('click', () => {
    // 時間がかかる時はスピナーを表示する
    if (app.stepConfig >= 3000000) {
        const span = document.createElement('span');
        span.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
        $step.append(span);
        setTimeout(() => {
            app.run(app.stepConfig);
            $step.removeChild(span);
        }, 33);
    } else {
        app.run(app.stepConfig);
    }
});

$stepConfig.addEventListener('click', () => {
    const str = prompt('Set steps', app.stepConfig.toString());
    if (typeof str === 'string') {
        const n = parseInt(str, 10);
        if (isNaN(n) || n <= 0) {
            alert('error');
        } else {
            app.stepConfig = n;
        }
    }
});

// サンプル
document.querySelectorAll('.js_sample').forEach(e => {
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

// rangeの設定
const frequencyArray = [];
for (let i = 0; i < 6; i++) {
    const base = 10 ** i;
    for (let j = 1; j <= 9; j++) {
        frequencyArray.push(base * j);
    }
}

frequencyArray.push(10 ** 6);
frequencyArray.push(2 * 10 ** 6);
frequencyArray.push(3 * 10 ** 6);
frequencyArray.push(4 * 10 ** 6);
frequencyArray.push(5 * 10 ** 6);

$frequencyInput.min = "0";
$frequencyInput.max = (frequencyArray.length - 1).toString();

$frequencyInput.addEventListener('input', () => {
    const value = parseInt($frequencyInput.value);
    app.frequency = frequencyArray[value]
    app.renderFrequencyOutput();
    // app.render();
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
        const result = e.target.result;
        if (typeof result !== "string") {
            throw Error('import: internal error');
        }
        $input.value = result;
        app.reset();
    };
    // @ts-ignore
    reader.readAsText(e.target.files[0]);
});

// キーボード入力
// Enter: toggle Start and Stop
// Space: Step
document.addEventListener('keydown', e => {
    // 入力中は無し
    if (document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "DETAILS"
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
try {
    app.render();
} catch (e) {
    console.error('first render failed');
    console.log(e);
}

app.frequencyManager.start();
