import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";
import { piCalculator } from "./pi_calculator.js";

// deno run --allow-hrtime test/benchmark.js
// node test/benchmark.js

const N = 10000000;

// let max = 0;

for (let k = 0; k < 5; k++) {
    const program = Program.parse(piCalculator);
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
    // console.log(machine.actionExecutor.output.getString());
    console.log((end - start) + "ms");
}
