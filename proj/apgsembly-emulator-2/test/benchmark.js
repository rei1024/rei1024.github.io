// @ts-check

import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";
import { piCalculator } from "./pi_calculator.js";

// deno run --allow-hrtime test/benchmark.js
// node test/benchmark.js

const N = 10000000;

// let max = 0;

for (let k = 0; k < 10; k++) {
    const program = Program.parse(piCalculator);
    if (typeof program === "string") {
        throw Error("error");
    }
    const machine = new Machine(program);
    const start = performance.now();
    for (let i = 0; i < N; i++) {
        try {
            // const startCom = performance.now();
            const res = machine.execCommand();
            // const endCom = performance.now();
            // const time = endCom - startCom;
            // if (time > max) {
            //     console.log(machine.currentState);
            //     max = time;
            //     console.log(max);
            // }
            if (res === -1) {
                break;
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    const end = performance.now();
    const exp = "3.1415926";
    const act = machine.actionExecutor.output.getString();
    if (exp !== act) {
        throw Error("error" + act);
    }
    // console.log(machine.actionExecutor.output.getString());
    console.log((end - start) + "ms");
}

// /**
//  *
//  * @param {string} name
//  * @param {() => void} fn
//  */
//  function bench(name, fn) {
//     const start = performance.now();
//     fn();
//     const end = performance.now();
//     console.log(name + " : " + (end - start) + "ms");
// }
