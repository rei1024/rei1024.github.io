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
 * @param {(_: number) => void} f 
 */
function bit1(f) {
    rangeForEach(0, 1, f)
}

/**
 * 
 * @param {(_: number, _: number) => void} f 
 */
function bit2(f) {
    bit1(i => bit1(j => f(i, j)));
}

/**
 * 
 * @param {(_: number, _: number, _: number) => void} f 
 */
function bit3(f) {
    bit1(i => bit2((j, k) => f(i, j, k)));
}

/**
 * 
 * @param {number} rule
 * @returns {Object}
 */
export function parseRule(rule) {
    const str = rule.toString(2).padStart(8, '0');
    const o = {};
    for (let i = 0; i <= 7; i++) {
        o[(7 - i).toString(2).padStart(3, '0')] = str[i];
    }
    return o
}

/**
 * 
 * @param {number} rule
 * @returns {(_: number, _: number, _: number) => "0" | "1"}
 */
export function makeDelta(rule) {
    const o = parseRule(rule);
    /**
     * 
     * @param {number} i 
     * @param {number} j 
     * @param {number} k
     * @returns {"0" | "1"}
     */
    function delta(i, j, k) {
        return o[i.toString() + j.toString() + k.toString()];
    }
    return delta;
}

/**
 * 
 * @param {number} rule
 * @returns {string}
 */
export function generate(rule) {
    const delta = makeDelta(rule);
    const boundary = 0;

    /** @type {Array<string>} */
    const array = [];
    // Set ON cell at (0, 0)
    array.push(`INITIAL; *; next.s${boundary}${boundary}.read.1; SET SQ, NOP`);
    // Current cursor is on the cell that will be read
    bit2((i, j) => {
        array.push(`next.s${i}${j}.read.1; *; next.s${i}${j}.read.2; READ SQ`);
        array.push(`next.s${i}${j}.read.2; Z; next.s${i}${j}0.write.1; NOP`);
        array.push(`next.s${i}${j}.read.2; NZ; next.s${i}${j}1.write.1; SET SQ, NOP`);
    });
    // If the next cell is empty, skip writing
    bit3((i, j, k) => {
        if (delta(i, j, k) == "0") {
            array.push(`next.s${i}${j}${k}.write.1; *; next.s${j}${k}.check0.1; INC SQX, NOP`);
        } else {
            array.push(`next.s${i}${j}${k}.write.1; *; next.s${i}${j}${k}.write.2; INC SQY, NOP`);
            array.push(`next.s${i}${j}${k}.write.2; *; next.s${i}${j}${k}.write.3; INC SQY, NOP`);
            array.push(`next.s${i}${j}${k}.write.3; *; next.s${j}${k}.check.1; SET SQ, NOP`);
        }
    });
    // skip writing
    bit2((i, j) => {
        array.push(`next.s${i}${j}.check0.1; *; next.s${i}${j}.check0.2; DEC SQY`);
        array.push(`next.s${i}${j}.check0.2; Z; finish.s${i}${j}.write.1; NOP`);
        array.push(`next.s${i}${j}.check0.2; NZ; next.s${i}${j}.read.1; NOP`);
    });

    bit2((i, j) => {
        array.push(`next.s${i}${j}.check.1; *; next.s${i}${j}.check.2; INC SQX, NOP`);
        for (let k = 2; k <= 4; k++) {
            array.push(`next.s${i}${j}.check.${k}; *; next.s${i}${j}.check.${k + 1}; DEC SQY`);
        }
        array.push(`next.s${i}${j}.check.5; Z; finish.s${i}${j}.write.1; NOP`);
        array.push(`next.s${i}${j}.check.5; NZ; next.s${i}${j}.read.1; NOP`);

        array.push(`finish.s${i}${j}.write.1; *; finish.s${i}${j}.write.2; INC SQY, NOP`);
        if (delta(i, j, boundary) === "0") {
            array.push(`finish.s${i}${j}.write.2; *; finish2.s${j}.write.1; NOP`)
        } else {
            array.push(`finish.s${i}${j}.write.2; *; finish2.s${j}.write.1; SET SQ, NOP`);
        }
    });
    bit1(i => {
        array.push(`finish2.s${i}.write.1; *; finish2.s${i}.write.2; INC SQX, NOP`);
        array.push(`finish2.s${i}.write.2; *; finish2.s${i}.write.3; DEC SQY`);
        if (delta(i, boundary, boundary) === "0") {
            array.push(`finish2.s${i}.write.3; *; return.1; NOP`);
        } else {
            array.push(`finish2.s${i}.write.3; *; return.1; SET SQ, NOP`);
        }
    });
    // return to the (0, N)
    array.push(`return.1; *; return.2; INC SQY, NOP`);
    array.push(`return.2; *; return.3; DEC SQX`);
    array.push(`return.3; Z; next.s${boundary}${boundary}.read.1; DEC SQY`);
    array.push(`return.3; NZ; return.1; NOP`);
    return array.join("\n");
}
