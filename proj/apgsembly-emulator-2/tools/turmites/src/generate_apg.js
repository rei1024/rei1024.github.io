// @ts-check

// https://github.com/GollyGang/ruletablerepository/wiki/UnresolvedTurmites2States2Colors
// https://github.com/rm-hull/turmites

import {
    actionOp,
    allDirs,
    DOWN,
    LEFT,
    RIGHT,
    Turmites,
    UP,
} from "./turmites.js";

/**
 * @param {import('./turmites').Dir} dir
 */
function dirToAction(dir) {
    switch (dir) {
        case LEFT:
            return "TDEC B2DX";
        case RIGHT:
            return "INC B2DX, NOP";
        case UP:
            return "TDEC B2DY";
        case DOWN:
            return "INC B2DY, NOP";
    }
}

/**
 * @returns {never}
 */
function intenalError() {
    throw Error("intenal error");
}

/**
 * @param {Turmites} turmites
 * @param {number} x
 * @param {number} y
 * @param {0 | 1 | 2 | 3} rotate
 * @returns {string} APGsembly
 */
export function generate(turmites, x, y, rotate) {
    /**
     * @type {string[]}
     */
    const array = [];

    array.push(`#REGISTERS { "U0": ${x}, "U1": ${y} }`);

    const initialDir = rotate === 0
        ? LEFT
        : rotate === 1
        ? UP
        : rotate === 2
        ? RIGHT
        : DOWN;

    array.push(`INITIAL; ZZ; SET_X_1; NOP`);
    array.push(
        `# Move to (${x}, ${y})
SET_X_1; *;  SET_X_2; TDEC U0
SET_X_2; Z;  SET_Y_1; NOP
SET_X_2; NZ; SET_X_1; INC B2DX, NOP

SET_Y_1; *;  SET_Y_2; TDEC U1
SET_Y_2; Z;  ${initialDir}_0_1; NOP
SET_Y_2; NZ; SET_Y_1; INC B2DY, NOP
`,
    );

    for (const [state, colors] of turmites.array.entries()) {
        if (colors.length !== 2) {
            throw Error("Only works with two colors");
        }
        const color0 = colors[0] ?? intenalError();
        const color1 = colors[1] ?? intenalError();
        for (const dir of allDirs) {
            array.push(
                `${dir}_${state}_1; *;  ${dir}_${state}_2; READ B2D, INC U2`,
            );
            array.push(
                `${dir}_${state}_2; Z;  ${dir}_${state}_Z; ${
                    color0.nextColor === 1 ? "SET B2D, " : ""
                }NOP`,
            );
            const nextDir0 = actionOp(color0.nextOp, dir);
            const nextDir1 = actionOp(color1.nextOp, dir);
            array.push(
                `${dir}_${state}_2; NZ; ${dir}_${state}_NZ; ${
                    color1.nextColor === 1 ? "SET B2D, " : ""
                }NOP`,
            );
            array.push(
                `${dir}_${state}_Z; *;  ${nextDir0}_${color0.nextState}_1; ${
                    dirToAction(nextDir0)
                }`,
            );
            array.push(
                `${dir}_${state}_NZ; *; ${nextDir1}_${color1.nextState}_1; ${
                    dirToAction(nextDir1)
                }`,
            );
        }
    }

    return array.join("\n");
}

// console.log(generate(Turmites.fromObjectString("{{{1,2,0}, {0,8,0}}}"), 30, 30));
// console.log(generate(Turmites.fromObjectString("{{{1, 8, 1}, {1, 8, 1}}, {{1, 2, 1}, [0, 1, 0}}}"), 30, 30));
