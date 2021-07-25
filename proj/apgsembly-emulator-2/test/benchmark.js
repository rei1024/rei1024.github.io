import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";
import { piCalculator } from "./pi_calculator.js";

const N = 10000000;

for (let k = 0; k < 10; k++) {
    const program = Program.parse(piCalculator);
    const machine = new Machine(program);
    const start = performance.now();
    for (let i = 0; i < N; i++) {
        try {
            const res = machine.execCommand();
            if (res === -1) {
                break;
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    const end = performance.now();
    console.log((end - start) + "ms");
}
