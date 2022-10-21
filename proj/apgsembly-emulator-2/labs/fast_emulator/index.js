// @ts-check

// @ts-ignore
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

const worker = new Worker('./worker.js', { type: "module" });

const app = Comlink.wrap(worker);

const output = document.querySelector('#output');

async function init() {
    if (output == null) {
        throw Error('error');
    }

    // console.log('a');
    const text = await (await fetch('../../frontend/data/pi_calc.apg')).text();
    // console.log(text.slice(0, 20));
    await app.initialize(text);
    // console.log(JSON.stringify(await app.getOutput()));
    await render();
    async function render() {
        if (output == null) {
            throw Error('error');
        }
        output.textContent = `[${(await app.getSteps()).toLocaleString()}]`
            + (await app.getOutput());
    }

    /**
     *
     * @param {number} time
     */
    const update = async time => {
        // console.log(time);
        await app.run(1000000);
        await render();
        requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

init();
