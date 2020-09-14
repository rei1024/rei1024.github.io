import { Machine } from './proj/machine.js'
import { D } from './proj/dom.js'
import { generateArray } from './proj/util.js'

const data_path = './data/';

const message = document.querySelector("#message");
const file = document.querySelector("#file");
const sample = document.querySelector("#sample");
const program_input = document.querySelector("#program_input");
const load = document.querySelector("#load");
const start = document.querySelector("#start");
const step = document.querySelector("#step");
const freq_output = document.querySelector("#freq_output");
const freq_range = document.querySelector("#freq_range");
const output = document.querySelector("#output");
const steps = document.querySelector("#steps");
const state = document.querySelector("#state");
const prev_output = document.querySelector("#prev_output");
const next_state = document.querySelector("#next_state");
const registers = document.querySelector("#registers");
const special = document.querySelector("#special");
const binary = document.querySelector("#binary");
const actions = document.querySelector("#actions");
/** @type {HTMLCanvasElement} */
const sq = document.querySelector("#sq");
const ctx = sq.getContext("2d");
const goto = document.querySelector("#goto");

class App {
    constructor() {
        /** @type {Machine | null} */
        this.machine = null;
        this.step = 0;
        this.playing = false;
        this.frequency = 1;
        this.halted = false;
        this.registersDOM = null;
    }

    /**
     * 
     * @param {string} str 
     */
    setMessage(str) {
        if (str == undefined) {
            message.textContent = "";
            message.style.padding = "";
        } else {
            message.textContent = str;
            message.style.padding = "10px"
        }
    }

    /**
     * 
     * @param {string} str 
     */
    setMachineFromString(str) {
        this.setMessage();
        try {
            this.machine = Machine.fromSource(str)
        } catch (e) {
            this.setMessage(e.message);
        }
    }

    load() {
        this.step = 0;
        this.playing = false;
        this.halted = false;
        this.internal_step = 0;
        registers.innerHTML = ""
        binary.innerHTML = "";
        // console.log(registers)
        this.machine = null;
        this.setMachineFromString(program_input.value);
        if (this.machine === null) {
            this.render();
            return;
        }
        const n = this.machine.regs.length;
        registers.append(D.tr(generateArray(n, i => D.th("R" + i))))
        this.registersDOM = D.tr(generateArray(n, i => D.td()));
        [...this.registersDOM.children].forEach((c, i) => {
            c.addEventListener("click", () => {
                this.stop();
                const str = window.prompt("Enter a number for R" + i + " (Previous: " + this.machine.regs[i] + ")");
                if (str == null) { return; }
                const n = parseInt(str.trim());
                if (!isNaN(n) && 0 <= n) {
                    this.machine.regs[i] = n;
                    this.render();
                }
            })
        })
    
        registers.append(this.registersDOM)
        const tn = this.machine.tapes.length;
        binary.append(...generateArray(tn, i => {
            const style = {"word-break":"break-all", "padding-bottom": "4px"};
            // const style2 = {"max-width":"100%", "overflow":"scroll", "padding-bottom": "4px"};
            return D.tr(D.th("T" + i), D.setStyle(style, D.td(
                D.span(), // len ptr
                D.br(),
                D.span(), // prefix
                D.setAttr({style: "border-bottom: 4px solid black;"}, D.span()), // head
                D.span(), // suffix
            )));
        }));

        this.render();
    }

    render() {
        try {
            state.textContent = this.machine.getStateName();
            // console.log(this.machine.getCurrentActionString())
            const o = this.machine.getCurrentActionAndNextStateString();
            actions.textContent = o.actions;
            next_state.textContent = o.nextState;
            prev_output.textContent = this.machine.getPrevOutputString();
        } catch {
            state.textContent = "";
            actions.textContent = "";
            prev_output.textContent = "";
        }
        steps.textContent = this.step;
        freq_output.value = this.frequency + "/s";
        try {
            output.value = this.machine.output_text;
        } catch {
            output.value = "";
        }
        if (app.playing) {
            start.textContent = "Stop";
        } else {
            start.textContent = "Start";
        }
        this.renderRegister();
        this.renderBinary();
        this.renderSQ();
        this.renderSpecial();
    }

    renderRegister() {
        if (this.machine !== null && this.registersDOM !== null) {
            for (let i = 0; i < this.registersDOM.children.length; i++) {
                this.registersDOM.children[i].textContent = this.machine.regs[i];
            }
        }
    }

    renderBinary() {
        /** @type {(_: number) => string} */
        const f = x => x === -1 ? "_" : x.toString();
        if (this.machine !== null) {
            for (let i = 0; i < binary.children.length; i++) {
                const tape = this.machine.tapes[i];
                const { prefix, head, suffix } = tape.toObject();
                const elems = binary.children[i].children[1].children;
                elems[0].textContent = "len=" + tape.bits.length + " ptr=" + tape.ptr +
                                    " bitcount=" + tape.bits.reduce((acc, x) => x == 1 ? acc + x : acc, 0) +
                                    " value=" + tape.getBigInt();
                elems[2].textContent = prefix.map(f).join("");
                elems[3].textContent = f(head);
                elems[4].textContent = suffix.map(f).join("");
            }
        }
    }

    renderSQ() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (this.machine !== null) {
            ctx.canvas.height = ctx.canvas.width;
            const n = Math.max(this.machine.memory.maxSQX, this.machine.memory.maxSQY) + 1;
            const cell = ctx.canvas.width / n;
            const maxSQX = this.machine.memory.maxSQX;
            const maxSQY = this.machine.memory.maxSQY;
            ctx.fillStyle = "blue";
            const __array__ = this.machine.memory.array;
            for (let i = 0; i <= maxSQY; i++) {
                const a = __array__[i];
                const i_mult_cell = i * cell;
                for (let j = 0; j <= maxSQX; j++) {
                    // this.machine.memory.getAt(j, i)
                    if (a[j] === 1) {
                        ctx.rect(j * cell, i_mult_cell, cell, cell);
                    }
                }
            }
            ctx.fill();
            const sqx = this.machine.memory.sqx;
            const sqy = this.machine.memory.sqy;
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.strokeRect(sqx * cell, sqy * cell, cell, cell);

        }
    }

    renderSpecial() {
        if (this.machine === null) {
            return;
        }
        const elems = special.children[0].children;
        elems[0].textContent = this.machine.toStringAddRegDetail();
        elems[1].textContent = this.machine.toStringSubRegDetail();
        elems[2].textContent = this.machine.toStringMulReg();
        elems[3].textContent = this.machine.memory.sqx;
        elems[4].textContent = this.machine.memory.sqy;
    }

    /**
     * 
     * @param {number} n 
     */
    run(n) {
        if (this.halted) {
            return;
        }
        if (this.machine == null) {
            return;
        }
        try {
            for (let i = 0; i < n; i++) {
                this.halted = !this.machine.step();
                if (this.halted) {
                    this.step += i;
                    break;
                }
            }
            this.step += n;
        } catch (e) {
            this.halted = true;
            this.stop();
            try {
                this.setMessage("Program crashed at \"" + this.machine.getStateName() + "\"." + " -- " + e.message);
            } catch {
                this.setMessage("Program crashed. " + " -- " + e.message);
            }
            this.render();
            return;
        }
        if (this.halted) {
            this.setMessage("Program reached halt state (because no bit value was returned by any instruction).");
            this.stop();
            this.render();
            return;
        }
        if (n > 0) {
            this.render();
            // console.log(this.machine.memory.toString())
        }
    }

    start() {
        if (this.machine === null) {
            this.load();
            if (this.machine === null) {
                return;
            }
        }
        if (this.halted) {
            return;
        }
        this.internal_step = 0;
        this.playing = true;
        this.render();
    }

    stop() {
        this.playing = false;
        this.render();
    }

    toggle() {
        if (this.playing) {
            this.stop();
        } else {
            this.start();
        }
    }
}

const app = new App();

load.addEventListener("click", () => {
    app.load();
});

file.addEventListener('input', (e) => {
    const reader = new FileReader();
    reader.onload = function (e) {
        program_input.value = e.target.result;
        app.load();
    };
    reader.readAsText(e.target.files[0]);

});

freq_range.addEventListener("input", () => {
    const n = parseInt(freq_range.value, 10);
    // console.log(n);
    const f = n => [10 ** n, 10 ** n * 1.5].concat(generateArray(9, i => 10 ** n * (i + 2)));
    const array = generateArray(9, n => f(n)).flat().slice(0, 80).concat([25000000, 30000000]);
    // console.log(array)
    app.frequency = array[n];
    // app.frequency = 10 ** Math.floor(n / 10) * (n % 10 + 1);
    /*
    const f = 1.2 ** parseInt(freq_range.value, 10);
    if (f >= 1000) {
        app.frequency = Math.floor(f);
    } else {
        app.frequency = Math.floor(f * 100) / 100;
    }
    */
    app.render();
});

start.addEventListener("click", () => {
    // console.log("start")
    app.toggle();
});

step.addEventListener("click", () => {
    if (app.playing) {
        app.stop();
    }
    app.run(1);
});

let prevTime = 0;

requestAnimationFrame(function update(time) {
    if (app.playing) {
        const diff = time - prevTime;
        const prev_internal_step = app.internal_step;
        app.internal_step = app.internal_step + diff * (app.frequency / 1000);
        // console.log(diff, app.frequency,(app.frequency / 1000) , x);
        const times = Math.floor(app.internal_step) - Math.floor(prev_internal_step);
        app.run(times);
        // console.log(time, prevTime, diff, x, times, app.frequency)
    }
    prevTime = time;
    requestAnimationFrame(update);
});

/**
 * 
 * @param {string} path 
 * @yields {Uint8Array<number>}
 */
async function* fetchUint8Array(path) {
    const reader = await fetch(path).then(x => x.body.getReader());
    while(true) {
        const { done, value } = await reader.read();
        if (done === false) {
            yield value;
        } else {
            return;
        }
    }
}

/**
 * UTF-8のファイルを読み込む
 * @param {string} path
 * @returns {Promise<string>}
 */
async function readFile(path) {
    let str = "";
    const decoder = new TextDecoder
    for await (const array of fetchUint8Array(path)) {
        str += decoder.decode(array);
    }
    return str;
}

sample.addEventListener("input", () => {
    if (sample.value === "none") {
        program_input.value = "";
        return;
    }
    const path = data_path + sample.value + ".txt"
    readFile(path).then(str => {
        program_input.value = str;
        app.load();
    });
});

goto.addEventListener("click", () => {
    if (app.machine == null) {
        return;
    }
    app.stop();
    const step_str = window.prompt("Enter step number (+n to go forwards by n)").trim();
    if (step_str == null) {
        return;
    }
    if (step_str.startsWith("+")) {
        const step = parseInt(step_str.slice(1), 10);
        if (!isNaN(step)) {
            app.run(step);
        }
    } else {
        const step = parseInt(step_str, 10);
        if (isNaN(step)) {
            return;
        }
        if (app.step < step) {
            app.run(step - app.step);
        }
    }
});

/*
// キーのイベントの処理
document.addEventListener('keydown', event => {
    const keyName = event.key;
    if (document.activeElement !== program_input) {
        if (keyName === 's') {
            app.toggle();
        } else if (keyName === "t") {
            if (app.playing) {
                app.stop();
            }
            app.run(1);
        } else if (keyName === ";") {
            app.frequency *= 1.1;
            app.frequency = Math.floor(app.frequency * 100) / 100;
            app.render();
        } else if (keyName === "-") {
            app.frequency /= 1.1;
            if (app.frequency <= 1000) {
                app.frequency = Math.floor(app.frequency * 100) / 100;
            } else {
                app.frequency = Math.floor(app.frequency);
            }
            app.render();
        }
    }
});
*/
