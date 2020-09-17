/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {(_: number) => void} f 
 */
function rangeForEach(x, y, f) {
    for (let i = x; i <= y; i++) {
        f(i);
    }
}

/**
 * 
 * @param {(_: number, _: number) => void} f 
 */
function bit2(f) {
    rangeForEach(0, 1, i => rangeForEach(0, 1, j => f(i, j)));
}

/**
 * 
 * @param {(_: number, _: number, _: number) => void} f 
 */
function bit3(f) {
    rangeForEach(0, 1, i => bit2((j, k) => f(i, j, k)));
}

/**
 * Rule 124
 */

/** @type {Array<[number, number, number, number]>} */
const rule = [[1,1,1,0],[1,1,0,1],[1,0,1,1],[1,0,0,1],[0,1,1,1],[0,1,0,1],[0,0,1,0],[0,0,0,0]];
/** @type {Array<string>} */
const array = [];

/**
 * 
 * @param {number} i 
 * @param {number} j 
 * @param {number} k 
 */
function delta(i, j, k) {
    return rule.find(x => {
        return i == x[0] && j == x[1] && k == x[2];
    })[3];
}

array.push(`INITIAL; *; init.1; SET SQ, NOP`);
array.push(`init.1; *; init.2; INC SQX, NOP`);
array.push(`init.2; *; init.3; INC SQY, NOP`);
array.push(`init.3; *; init.4; SET SQ, NOP`);
array.push(`init.4; *; next.s01.read.1; DEC SQX`);

bit2((i, j) => {
    array.push(`next.s${i}${j}.read.1; *; next.s${i}${j}.read.2; INC SQX, NOP`);
    array.push(`next.s${i}${j}.read.2; *; next.s${i}${j}.read.3; DEC SQY`);
    array.push(`next.s${i}${j}.read.3; *; next.s${i}${j}.calc.1; READ SQ`); 
    array.push(`next.s${i}${j}.calc.1; Z; next.s${i}${j}0.write.1; NOP`);
    array.push(`next.s${i}${j}.calc.1; NZ; next.s${i}${j}1.write.1; SET SQ, NOP`);
});

bit3((i, j, k) => {
    array.push(`next.s${i}${j}${k}.write.1; *; next.s${i}${j}${k}.write.2; INC SQY, NOP`);
    array.push(`next.s${i}${j}${k}.write.2; *; next.s${i}${j}${k}.write.3; DEC SQX`);
    if (delta(i, j, k) === 0) {
        array.push(`next.s${i}${j}${k}.write.3; *; anchor.s${j}${k}.check.1; NOP`);
    } else {
        array.push(`next.s${i}${j}${k}.write.3; *; anchor.s${j}${k}.check.1; SET SQ, NOP`);
    }
});

bit2((i, j) => {
    array.push(`anchor.s${i}${j}.check.1; *; anchor.s${i}${j}.check.2; INC SQX, NOP`);
    array.push(`anchor.s${i}${j}.check.2; *; anchor.s${i}${j}.check.3; READ SQ`);
    array.push(`anchor.s${i}${j}.check.3; Z; next.s${i}${j}.read.1; NOP`);
    array.push(`anchor.s${i}${j}.check.3; NZ; anchor.set.1; SET SQ, NOP`);
});

array.push(`anchor.set.1; *; anchor.set.2; INC SQX, NOP`);
array.push(`anchor.set.2; *; anchor.set.3; INC SQY, NOP`);
array.push(`anchor.set.3; *; return.move; SET SQ, NOP`);
array.push(`return.move; *; return.check; DEC SQX`);
array.push(`return.check; Z; next.s01.read.1; NOP`);
array.push(`return.check; NZ; return.move; NOP`);

console.log(array.join("\n"));
