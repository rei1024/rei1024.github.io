// @ts-check

// @ts-ignore
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

const worker = new Worker('./worker.js', { type: "module" });

const app = Comlink.wrap(worker);

const output = document.querySelector('#output');

async function init() {
    // console.log('a');
    const text = await (await fetch('../data/pi_calc.apg')).text();
    // console.log(text.slice(0, 20));
    await app.initialize(text);
    // console.log(JSON.stringify(await app.getOutput()));
    output.textContent = await app.getOutput();

    /**
     *
     * @param {number} time
     */
    const update = async time => {
        // console.log(time);
        await app.run(1000000);
        output.textContent = await app.getOutput();
        requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

init();
