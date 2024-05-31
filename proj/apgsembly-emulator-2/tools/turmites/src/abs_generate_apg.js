// @ts-check

// https://github.com/GollyGang/ruletablerepository/wiki/UnresolvedTurmites2States2Colors
// https://github.com/rm-hull/turmites

import { formatAPGsembly } from "../../../src/exports.js";
import {
    AbsTurmites,
    EAST,
    flipDir,
    HALT,
    NORTH,
    rotateDir,
    SOUTH,
    WEST,
} from "./abs_turmites.js";

/**
 * @param {import('./abs_turmites').Dir} dir
 * @param {0 | 1 | 2 | 3} rotate
 * @param {boolean} flip
 */
function dirToAction(dir, rotate, flip = false) {
    for (let i = 0; i < rotate; i++) {
        dir = rotateDir(dir);
    }

    if (flip) {
        dir = flipDir(dir);
    }

    switch (dir) {
        case WEST:
            return "TDEC B2DX";
        case EAST:
            return "INC B2DX, NOP";
        case NORTH:
            return "TDEC B2DY";
        case SOUTH:
            return "INC B2DY, NOP";
        case HALT:
            return "HALT_OUT";
    }
}

/**
 * @returns {never}
 */
function internalError() {
    throw Error("internal error");
}

/**
 * @param {AbsTurmites} turmites
 * @param {number} x
 * @param {number} y
 * @param {0 | 1 | 2 | 3} rotate
 * @param {boolean} flip
 * @returns {string} APGsembly
 */
export function generate(turmites, x, y, rotate, flip = false) {
    /**
     * @type {string[]}
     */
    const array = [];

    array.push(`#REGISTERS { "U0": ${x}, "U1": ${y} }`);

    array.push(`INITIAL; ZZ; SET_X_1; NOP`);
    array.push(
        `# Move to (${x}, ${y})
SET_X_1; *;  SET_X_2; TDEC U0
SET_X_2; Z;  SET_Y_1; NOP
SET_X_2; NZ; SET_X_1; INC B2DX, NOP

SET_Y_1; *;  SET_Y_2; TDEC U1
SET_Y_2; Z;  0_1; NOP
SET_Y_2; NZ; SET_Y_1; INC B2DY, NOP
`,
    );

    for (const [state, colors] of turmites.array.entries()) {
        if (colors.length !== 2) {
            throw Error("Only works with two colors");
        }
        const color0 = colors[0] ?? internalError();
        const color1 = colors[1] ?? internalError();
        array.push(`${state}_1; *;  ${state}_2; READ B2D, INC U2`);
        array.push(
            `${state}_2; Z;  ${state}_Z; ${
                color0.nextColor === 1 ? "SET B2D, " : ""
            }NOP`,
        );
        const nextDir0 = color0.nextOp;
        const nextDir1 = color1.nextOp;
        array.push(
            `${state}_2; NZ; ${state}_NZ; ${
                color1.nextColor === 1 ? "SET B2D, " : ""
            }NOP`,
        );
        array.push(
            `${state}_Z; *;  ${color0.nextState}_1; ${
                dirToAction(nextDir0, rotate, flip)
            }`,
        );
        array.push(
            `${state}_NZ; *; ${color1.nextState}_1; ${
                dirToAction(nextDir1, rotate, flip)
            }`,
        );
    }

    return formatAPGsembly(array.join("\n"));
}

// console.log(generate(Turmites.fromObjectString("{{{1,2,0}, {0,8,0}}}"), 30, 30));
// console.log(generate(Turmites.fromObjectString("{{{1, 8, 1}, {1, 8, 1}}, {{1, 2, 1}, [0, 1, 0}}}"), 30, 30));
