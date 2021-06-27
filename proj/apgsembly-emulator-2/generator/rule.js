// Elementary cellular automata

// @ts-check

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
 * @param {(x: number, y: number) => void} f 
 */
function bit2(f) {
    bit1(i => bit1(j => f(i, j)));
}

/**
 * 
 * @param {(x: number, y: number, z: number) => void} f 
 */
function bit3(f) {
    bit1(i => bit2((j, k) => f(i, j, k)));
}

/**
 * 
 * @param {number} rule
 * @returns {{ [key: string]: "0" | "1" }}
 */
export function parseRule(rule) {
    const str = rule.toString(2).padStart(8, '0');
    const o = {};
    for (let i = 0; i <= 7; i++) {
        /** @type {string} */
        const key = (7 - i).toString(2).padStart(3, '0');
        // @ts-ignore
        o[key] = str[i];
    }
    // @ts-ignore
    return o
}

/**
 * 
 * @param {number} rule
 * @returns {(x: number, y: number, z: number) => "0" | "1"}
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
        const key = i.toString() + j.toString() + k.toString();
        // @ts-ignore
        return o[key];
    }
    return delta;
}

/**
 * Generate APGsembly
 * @param {number} rule
 * @returns {string}
 */
export function generate(rule) {
    const delta = makeDelta(rule);
    const boundary = 0;

    /** @type {Array<string>} */
    const array = [];
    array.push(`# Rule ${rule}`);
    // Set ON cell at (0, 0)
    array.push(`INITIAL; *; NEXT_S${boundary}${boundary}_READ_1; SET B2D, NOP`);
    // Current cursor is on the cell that will be read
    bit2((i, j) => {
        array.push(`NEXT_S${i}${j}_READ_1; *; NEXT_S${i}${j}_READ_2; READ B2D`);
        array.push(`NEXT_S${i}${j}_READ_2; Z; NEXT_S${i}${j}0_WRITE_1; NOP`);
        array.push(`NEXT_S${i}${j}_READ_2; NZ; NEXT_S${i}${j}1_WRITE_1; SET B2D, NOP`);
    });
    // If the next cell is empty, skip writing
    bit3((i, j, k) => {
        if (delta(i, j, k) == "0") {
            array.push(`NEXT_S${i}${j}${k}_WRITE_1; *; NEXT_S${j}${k}_CHECK0_1; INC B2DX, NOP`);
        } else {
            array.push(`NEXT_S${i}${j}${k}_WRITE_1; *; NEXT_S${i}${j}${k}_WRITE_2; INC B2DY, NOP`);
            array.push(`NEXT_S${i}${j}${k}_WRITE_2; *; NEXT_S${i}${j}${k}_WRITE_3; INC B2DY, NOP`);
            array.push(`NEXT_S${i}${j}${k}_WRITE_3; *; NEXT_S${j}${k}_CHECK_1; SET B2D, NOP`);
        }
    });
    // skip writing
    bit2((i, j) => {
        array.push(`NEXT_S${i}${j}_CHECK0_1; *; NEXT_S${i}${j}_CHECK0_2; TDEC B2DY`);
        array.push(`NEXT_S${i}${j}_CHECK0_2; Z; FINISH_S${i}${j}_WRITE_1; NOP`);
        array.push(`NEXT_S${i}${j}_CHECK0_2; NZ; NEXT_S${i}${j}_READ_1; NOP`);
    });

    bit2((i, j) => {
        array.push(`NEXT_S${i}${j}_CHECK_1; *; NEXT_S${i}${j}_CHECK_2; INC B2DX, NOP`);
        const n = 4;
        for (let k = 2; k <= 4; k++) {
            array.push(`NEXT_S${i}${j}_CHECK_${k}; *; NEXT_S${i}${j}_CHECK_${k + 1}; TDEC B2DY`);
        }
        array.push(`NEXT_S${i}${j}_CHECK_${n + 1}; Z; FINISH_S${i}${j}_WRITE_1; NOP`);
        array.push(`NEXT_S${i}${j}_CHECK_${n + 1}; NZ; NEXT_S${i}${j}_READ_1; NOP`);

        array.push(`FINISH_S${i}${j}_WRITE_1; *; FINISH_S${i}${j}_WRITE_2; INC B2DY, NOP`);
        if (delta(i, j, boundary) === "0") {
            array.push(`FINISH_S${i}${j}_WRITE_2; *; FINISH2_S${j}_WRITE_1; NOP`)
        } else {
            array.push(`FINISH_S${i}${j}_WRITE_2; *; FINISH2_S${j}_WRITE_1; SET B2D, NOP`);
        }
    });
    bit1(i => {
        array.push(`FINISH2_S${i}_WRITE_1; *; FINISH2_S${i}_WRITE_2; INC B2DX, NOP`);
        array.push(`FINISH2_S${i}_WRITE_2; *; FINISH2_S${i}_WRITE_3; TDEC B2DY`);
        if (delta(i, boundary, boundary) === "0") {
            array.push(`FINISH2_S${i}_WRITE_3; *; RETURN_1; NOP`);
        } else {
            array.push(`FINISH2_S${i}_WRITE_3; *; RETURN_1; SET B2D, NOP`);
        }
    });
    // return to the (0, N)
    array.push(`RETURN_1; *; RETURN_2; INC B2DY, NOP`);
    array.push(`RETURN_2; *; RETURN_3; TDEC B2DX`);
    array.push(`RETURN_3; Z; NEXT_S${boundary}${boundary}_READ_1; TDEC B2DY`);
    array.push(`RETURN_3; NZ; RETURN_1; NOP`);
    return array.join("\n");
}
