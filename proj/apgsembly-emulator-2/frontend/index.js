// @ts-check

import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";
import { Frequency } from "./frequency.js";
import { renderB2D } from "./renderB2D.js";
import { $type } from "./selector.js";

// データ
const DATA_DIR = "../data/";

// エラーメッセージ
const $error = $type('#error', HTMLElement);

// 入力
const $input = $type('#input', HTMLTextAreaElement);

// 出力
const $output = $type('#output', HTMLTextAreaElement);

// ステップ数表示
const $steps = $type('#steps', HTMLElement);

const $start = $type('#start', HTMLButtonElement);

const $stop = $type('#stop', HTMLButtonElement);

const $reset = $type('#reset', HTMLButtonElement);

const $step = $type('#step', HTMLButtonElement);

const $currentState = $type('#current_state', HTMLElement);

const $previousOutput = $type('#previous_output', HTMLElement);

const $stepConfig = $type('#step_config', HTMLButtonElement);

// スピード
const $frequencyInput = $type('#frequency_input', HTMLInputElement);

const $freqencyOutput = $type('#frequency_output', HTMLElement);

// 次のコマンド
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

const $unaryRegister = $type('#unary_register', HTMLElement);

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
        this.steps = 0;

        /**
         * @type {AppState}
         */
        this.appState = "Initial";

        /**
         * 周波数[Hz]
         */
        this.frequency = 30; // index.htmlと同期する

        this.errorMessage = "";

        this.stepConfig = 1;

        this.frequencyManager = new Frequency(() => this.appState === "Running", () => this.frequency, n => this.run(n));
    }

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

    stop() {
        this.appState = "Stop";
        this.render();
    }

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

    onMachineSet() {
        this.setUpUnary();
        this.setUpBinary();
    }

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
        $freqencyOutput.textContent = app.frequency + "Hz"
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
        $steps.textContent = this.steps.toString();

        // current state
        $currentState.textContent = this.machine?.currentState;
        $previousOutput.textContent = this.machine?.getPreviousOutput();

        // output
        const output = this.machine?.actionExecutor.output.getString();
        if (output !== undefined) {
            $output.value = output;
        } else {
            $output.value = "";
        }
    }

    /**
     * 
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
        e.dataset.src
        fetch(DATA_DIR + e.dataset.src).then(res => res.text()).then(text => {
            $input.value = text;
            app.reset();
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

try {
    app.render();
} catch (e) {
    console.error('first render failed');
    console.log(e);
}

app.frequencyManager.start();
