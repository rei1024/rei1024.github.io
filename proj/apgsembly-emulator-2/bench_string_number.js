// @ts-check

/**
 *
 * @param {string} name
 * @param {() => void} fn
 */
function bench(name, fn) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(name + " : " + (end - start) + "ms");
}

// class A {
//     /**
//      *
//      * @param {string} x
//      */
//     constructor(x) {
//         this.x = x;
//     }
// }

// class B {
//     /**
//      *
//      * @param {number} x
//      */
//     constructor(x) {
//         this.x = x;
//     }
// }
// const n = 10000000;
// const arrayString = Array(n).fill(0).map(() => new A('a'));
// const arrayNumber = Array(n).fill(0).map(() => new B(42));

// const keyNumber = 2;

// bench('number', () => {
//     let res = true;
//     arrayNumber.forEach(x => {
//         const r = x.x === keyNumber;
//         res = r && res;
//     });
// });

// const keyString = 'b';

// bench('string', () => {
//     let res = true;
//     arrayString.forEach(x => {
//         const r = x.x === keyString;
//         res = r && res;
//     });
// });


// bench('number', () => {
//     let res = true;
//     arrayNumber.forEach(x => {
//         const r = x.x === keyNumber;
//         res = r && res;
//     });
// });

// bench('string', () => {
//     let res = true;
//     arrayString.forEach(x => {
//         const r = x.x === keyString;
//         res = r && res;
//     });
// });

const N = 10;
const M = 10000000;
const array = Array(N).fill(1);

bench('array', () => {
    let r = 0;
    for (let j = 0; j < M; j++) {
        for (let i = 0; i < N; i++) {
            r += array[i];
        }
    }
});

const map = new Map(Array(N).fill(0).map((_, i) => [i, 0]));

bench('map', () => {
    let r2 = 0;
    for (let j = 0; j < M; j++) {
        for (let i = 0; i < N; i++) {
            r2 += map.get(i);
        }
    }
});
