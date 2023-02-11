// @ts-check

import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";
import { piCalculator } from "./pi_calculator.js";

// deno run --allow-hrtime test/benchmark.js
// node test/benchmark.js

const N = 1000000;

const program = Program.parse(piCalculator);
if (typeof program === "string") {
    throw Error("error");
}

function run() {
    const machine = new Machine(program);
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

    const exp = "3.141";
    const act = machine.actionExecutor.output.getString();
    if (exp !== act) {
        throw Error("error" + act);
    }
}

function run2() {
    const machine = new Machine(program);
    machine.exec(N, false, -1, -1);

    const exp = "3.141";
    const act = machine.actionExecutor.output.getString();
    if (exp !== act) {
        throw Error("error" + act);
    }
}

Deno.bench("pi normal", { group: "pi" }, () => {
    run();
});

Deno.bench("pi exec", { group: "pi" }, () => {
    run2();
});

// const obj = { x: { y: 1 }, y: { y: 1 }, z: { y: 1 } };
// const map = new Map([[1, { y: 1 } ], [2, { y: 1 } ], [3, { y: 1 } ]]);
// Deno.bench({
//     name: 'object',
//     fn() {
//         obj.x.y++;
//     },
//     group: 'test'
// });

// Deno.bench({
//     name: 'map',
//     fn() {
//         // @ts-ignore
//         map.get(1).y++;
//     },
//     group: 'test'
// });

// class X {
//     constructor() {
//         this.value = 0;
//     }
//     x() {
//         switch (this.value) {
//             case 0: {
//                 this.value = 1;
//                 break;
//             }
//             case 1: {
//                 this.value = 0;
//                 break;
//             }
//         }
//     }

//     y() {
//         switch (this.value) {
//             case 0: {
//                 this._do1();
//                 break;
//             }
//             case 1: {
//                 this._do2();
//                 break;
//             }
//         }
//     }

//     _do1() {
//         this.value = 1;
//     }

//     _do2() {
//         this.value = 0;
//     }
// }

// const o1 = new X();
// Deno.bench({
//     name: 'inline',
//     fn() {
//         o1.x();
//     },
//     group: 'test'
// });

// const o2 = new X();
// Deno.bench({
//     name: 'non-inline',
//     fn() {
//         o2.y();
//     },
//     group: 'test'
// });

// ---------
// const len = 130;
// const rep = 10000;
// const objectArray = Array(len).fill(0).map(() => ({ z: 0, nz: 0 }));
// const array = Array(len * 2).fill(0).map(() => 0);
// const uint32Array = new Uint32Array(len * 2);

// Deno.bench({
//     name: 'objectArray',
//     fn() {
//         for (let j = 0; j < rep; j++) {
//             for (let i = 0; i < len; i++) {
//                 objectArray[i].z++;
//             }
//             for (let i = 0; i < len; i++) {
//                 objectArray[i].nz++;
//             }
//         }
//     },
//     group: 'test'
// });

// Deno.bench({
//     name: 'array',
//     fn() {
//         for (let j = 0; j < rep; j++) {
//             for (let i = 0; i < len; i++) {
//                 array[i * 2]++;
//             }
//             for (let i = 0; i < len; i++) {
//                 array[i * 2 + 1]++;
//             }
//         }
//     },
//     group: 'test'
// });

// Deno.bench({
//     name: 'typed',
//     fn() {
//         for (let j = 0; j < rep; j++) {
//             for (let i = 0; i < len; i++) {
//                 uint32Array[i * 2]++;
//                 uint32Array[i * 2 + 1]++;
//             }
//         }
//     },
//     group: 'test'
// });

// const rep = 10000000;

// Deno.bench({
//     name: 'switch',
//     fn() {
//         let x = "abc";
//         for (let j = 0; j < rep; j++) {
//             switch (x) {
//                 case 'xyz': console.log(x);
//             }
//         }
//     },
//     group: 'test'
// });

// Deno.bench({
//     name: 'switch int',
//     fn() {
//         let x = 3;
//         let y = 4;
//         for (let j = 0; j < rep; j++) {
//             switch (x) {
//                 case y: console.log(x);
//             }
//         }
//     },
//     group: 'test'
// });

// const repeat = 10000000;

// // const a = [
// //     0b0101, 0b0100, 0b0111, 0b0110, 0b0001, 0b0000, 0b0011, 0b0010,
// //     0b1101, 0b1100, 0b1111, 0b1110, 0b1001, 0b1000, 0b1011, 0b1010
// // ];
// // console.log(a.map((v, i) => `case ${i}: {\n    v = ${v};\n    break;\n}`).join("\n"))
// Deno.bench({
//     name: 'switch',
//     fn() {
//         let v = 0;
//         for (let j = 0; j < repeat; j++) {
//             switch (v) {
//                 case 0: {
//                     v = 5;
//                     break;
//                 }
//                 case 1: {
//                     v = 4;
//                     break;
//                 }
//                 case 2: {
//                     v = 7;
//                     break;
//                 }
//                 case 3: {
//                     v = 6;
//                     break;
//                 }
//                 case 4: {
//                     v = 1;
//                     break;
//                 }
//                 case 5: {
//                     v = 0;
//                     break;
//                 }
//                 case 6: {
//                     v = 3;
//                     break;
//                 }
//                 case 7: {
//                     v = 2;
//                     break;
//                 }
//                 case 8: {
//                     v = 13;
//                     break;
//                 }
//                 case 9: {
//                     v = 12;
//                     break;
//                 }
//                 case 10: {
//                     v = 15;
//                     break;
//                 }
//                 case 11: {
//                     v = 14;
//                     break;
//                 }
//                 case 12: {
//                     v = 9;
//                     break;
//                 }
//                 case 13: {
//                     v = 8;
//                     break;
//                 }
//                 case 14: {
//                     v = 11;
//                     break;
//                 }
//                 case 15: {
//                     v = 10;
//                     break;
//                 }
//             }
//         }
//     },
//     group: 'test'
// });

// Deno.bench({
//     name: 'array',
//     fn() {
//         let v = 0;
//         for (let j = 0; j < repeat; j++) {
//             v = [
//                 0b0101, 0b0100, 0b0111, 0b0110, 0b0001, 0b0000, 0b0011, 0b0010,
//                 0b1101, 0b1100, 0b1111, 0b1110, 0b1001, 0b1000, 0b1011, 0b1010
//             ][v];
//         }
//     },
//     group: 'test'
// });
