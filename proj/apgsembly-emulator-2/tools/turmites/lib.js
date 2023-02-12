// deno-fmt-ignore-file
/* eslint-disable array-bracket-newline */
/* eslint-disable no-multi-spaces */

// @ts-check
// https://sourceforge.net/p/golly/code/ci/57e0b46e117c8bfa605f0d61d22307ca5c5383d9/tree/Scripts/Python/Rule-Generators/Turmite-gen.py

/**
 * @type {[rule: string, desc: string][]}
 */
export const peggLibrary = [
    // source: http://demonstrations.wolfram.com/Turmites/
    // Translated into his later notation: 1=noturn, 2=right, 4=u-turn, 8=left
    // (old notation was: 0=noturn,1=right,-1=left)
    // (all these are 2-color patterns)
    ["{{{1, 2, 0}, {0, 8, 0}}}", "1: Langton's ant"],
    ["{{{1, 2, 0}, {0, 1, 0}}}", "2: binary counter"],
    ["{{{0, 8, 1}, {1, 2, 1}}, {{1, 1, 0}, {1, 1, 1}}}", "3: (filled triangle)"],
    ["{{{0, 1, 1}, {0, 8, 1}}, {{1, 2, 0}, {0, 1, 1}}}", "4: spiral in a box"],
    ["{{{0, 2, 1}, {0, 8, 0}}, {{1, 8, 1}, {0, 2, 0}}}", "5: stripe-filled spiral"],
    ["{{{0, 2, 1}, {0, 8, 0}}, {{1, 8, 1}, {1, 1, 0}}}", "6: stepped pyramid"],
    ["{{{0, 2, 1}, {0, 1, 1}}, {{1, 2, 1}, {1, 8, 0}}}", "7: contoured island"],
    ["{{{0, 2, 1}, {0, 2, 1}}, {{1, 1, 0}, {0, 2, 1}}}", "8: woven placemat"],
    ["{{{0, 2, 1}, {1, 2, 1}}, {{1, 8, 1}, {1, 8, 0}}}", "9: snowflake-ish (mimics Jordan's ice-skater)"],
    ["{{{1, 8, 0}, {0, 1, 1}}, {{0, 8, 0}, {0, 8, 1}}}", "10: slow city builder"],
    ["{{{1, 8, 0}, {1, 2, 1}}, {{0, 2, 0}, {0, 8, 1}}}", "11: framed computer art"],
    ["{{{1, 8, 0}, {1, 2, 1}}, {{0, 2, 1}, {1, 8, 0}}}", "12: balloon bursting (makes a spreading highway)"],
    ["{{{1, 8, 1}, {0, 8, 0}}, {{1, 1, 0}, {0, 1, 0}}}", "13: makes a horizontal highway"],
    ["{{{1, 8, 1}, {0, 8, 0}}, {{1, 2, 1}, {1, 2, 0}}}", "14: makes a 45 degree highway"],
    ["{{{1, 8, 1}, {0, 8, 1}}, {{1, 2, 1}, {0, 8, 0}}}", "15: makes a 45 degree highway"],
    ["{{{1, 8, 1}, {0, 1, 0}}, {{1, 1, 0}, {1, 2, 0}}}", "16: spiral in a filled box"],
    ["{{{1, 8, 1}, {0, 2, 0}}, {{0, 8, 0}, {0, 8, 0}}}", "17: glaciers"],
    [ "{{{1, 8, 1}, {1, 8, 1}}, {{1, 2, 1}, {0, 1, 0}}}", "18: golden rectangle!"],
    ["{{{1, 8, 1}, {1, 2, 0}}, {{0, 8, 0}, {0, 8, 0}}}", "19: fizzy spill"],
    ["{{{1, 8, 1}, {1, 2, 1}}, {{1, 1, 0}, {0, 1, 1}}}", "20: nested cabinets"],
    ["{{{1, 1, 1}, {0, 8, 1}}, {{1, 2, 0}, {1, 1, 1}}}", "21: (cross)"],
    ["{{{1, 1, 1}, {0, 1, 0}}, {{0, 2, 0}, {1, 8, 0}}}", "22: saw-tipped growth"],
    ["{{{1, 1, 1}, {0, 1, 1}}, {{1, 2, 1}, {0, 1, 0}}}", "23: curves in blocks growth"],
    ["{{{1, 1, 1}, {0, 2, 0}}, {{0, 8, 0}, {0, 8, 0}}}", "24: textured growth"],
    ["{{{1, 1, 1}, {0, 2, 1}}, {{1, 8, 0}, {1, 2, 0}}}", "25: (diamond growth)"],
    ["{{{1, 1, 1}, {1, 8, 0}}, {{1, 2, 1}, {0, 1, 0}}}", "26: coiled rope"],
    ["{{{1, 2, 0}, {0, 8, 1}}, {{1, 8, 0}, {0, 1, 1}}}", "27: (growth)"],
    ["{{{1, 2, 0}, {0, 8, 1}}, {{1, 8, 0}, {0, 2, 1}}}", "28: (square spiral)"],
    ["{{{1, 2, 0}, {1, 2, 1}}, {{0, 1, 0}, {0, 1, 1}}}", "29: loopy growth with holes"],
    ["{{{1, 2, 1}, {0, 8, 1}}, {{1, 1, 0}, {0, 1, 0}}}", "30: Langton's Ant drawn with squares"],
    ["{{{1, 2, 1}, {0, 2, 0}}, {{0, 8, 1}, {1, 8, 0}}}", "31: growth with curves and blocks"],
    ["{{{1, 2, 1}, {0, 2, 0}}, {{0, 1, 0}, {1, 2, 1}}}", "32: distracted spiral builder"],
    ["{{{1, 2, 1}, {0, 2, 1}}, {{1, 1, 0}, {1, 1, 1}}}", "33: cauliflower stalk (45 deg highway)"],
    ["{{{1, 2, 1}, {1, 8, 1}}, {{1, 2, 1}, {0, 2, 0}}}", "34: worm trails (eventually turns cyclic!)"],
    ["{{{1, 2, 1}, {1, 1, 0}}, {{1, 1, 0}, {0, 1, 1}}}", "35: eventually makes a two-way highway!"],
    ["{{{1, 2, 1}, {1, 2, 0}}, {{0, 1, 0}, {0, 1, 0}}}", "36: almost symmetric mould bloom"],
    ["{{{1, 2, 1}, {1, 2, 0}}, {{0, 2, 0}, {1, 1, 1}}}", "37: makes a 1 in 2 gradient highway"],
    ["{{{1, 2, 1}, {1, 2, 1}}, {{1, 8, 1}, {0, 2, 0}}}", "38: immediately makes a 1 in 3 highway"],
    ["{{{0, 2, 1}, {1, 2, 1}}, {{0, 8, 2}, {0, 8, 0}}, {{1, 2, 2}, {1, 8, 0}}}", "39: squares and diagonals growth"],
    ["{{{1, 8, 1}, {0, 1, 0}}, {{0, 2, 2}, {1, 8, 0}}, {{1, 2, 1}, {1, 1, 0}}}", "40: streak at approx. an 8.1 in 1 gradient"],
    ["{{{1, 8, 1}, {0, 1, 2}}, {{0, 2, 2}, {1, 1, 1}}, {{1, 2, 1}, {1, 1, 0}}}", "41: streak at approx. a 1.14 in 1 gradient"],
    ["{{{1, 8, 1}, {1, 8, 1}}, {{1, 1, 0}, {0, 1, 2}}, {{0, 8, 1}, {1, 1, 1}}}", "42: maze-like growth"],
    ["{{{1, 8, 2}, {0, 2, 0}}, {{1, 8, 0}, {0, 2, 0}}, {{0, 8, 0}, {0, 8, 1}}}", "43: growth by cornices"],
    ["{{{1, 2, 0}, {0, 2, 2}}, {{0, 8, 0}, {0, 2, 0}}, {{0, 1, 1}, {1, 8, 0}}}", "44: makes a 1 in 7 highway"],
    ["{{{1, 2, 1}, {0, 8, 0}}, {{1, 2, 2}, {0, 1, 0}}, {{1, 8, 0}, {0, 8, 0}}}", "45: makes a 4 in 1 highway"],
    // source: http://www.mathpuzzle.com/Turmite5.nb
    // via: http://www.mathpuzzle.com/26Mar03.html
    // "I wondered what would happen if a turmite could split as an action... say Left and Right.
    //  In addition, I added the rule that when two turmites met, they annihilated each other.
    //  Some interesting patterns came out from my initial study. My main interest is finding
    //  turmites that will grow for a long time, then self-annihilate."
    // ["{{{1, 8, 0}, {1, 2, 1}}, {{0, 10, 0}, {0, 8, 1}}}",  "46: stops at 11 gens"],
    // ["{{{1, 8, 0}, {1, 2, 1}}, {{1, 10, 0}, {1, 8, 1}}}",  "47: stops at 12 gens"],
    // ["{{{1, 15, 0}, {0, 2, 1}}, {{0, 10, 0}, {0, 8, 1}}}", "48: snowflake-like growth"],
    // ["{{{1, 2, 0}, {0, 15, 0}}}",                          "49: blob growth"],
    // ["{{{1, 3, 0}, {0, 3, 0}}}",                           "50: (spiral) - like SDSR-Loop on a macro level"],
    // ["{{{1, 3, 0}, {0, 1, 0}}}",                           "51: (spiral)"],
    // ["{{{1, 10, 0}, {0, 1, 0}}}",                          "52: snowflake-like growth"],
    // ["{{{1, 10, 1}, {0, 1, 1}}, {{0, 2, 0}, {0, 0, 0}}}",  "53: interesting square growth"],
    // ["{{{1, 10, 1}, {0, 5, 1}}, {{1, 2, 0}, {0, 8, 0}}}",  "54: interesting square growth"],
    // ["{{{1, 2, 0}, {0, 1, 1}}, {{1, 2, 0}, {0, 6, 0}}}",   "55: growth"],
    // ["{{{1, 2, 0}, {1, 1, 1}}, {{0, 2, 0}, {0, 11, 0}}}",  "56: wedge growth with internal snakes"],
    // ["{{{1, 2, 1}, {0, 2, 1}}, {{1, 15, 0}, {1, 8, 0}}}",  "57: divided square growth"],
    // ["{{{1, 2, 0}, {2, 8, 2}, {1, 1, 1}}, {{1, 1, 2}, {0, 2, 1}, {2, 8, 1}}, {{0, 11, 0}, {1, 1, 1}, {0, 2, 2}}}", "58: semi-chaotic growth with spikes"],
    // ["{{{1, 2, 0}, {2, 8, 2}, {2, 1, 1}}, {{1, 1, 2}, {1, 1, 1}, {1, 8, 1}}, {{2, 10, 0}, {2, 8, 1}, {2, 8, 2}}}", "59: halts after 204 gens (256 non-zero cells written)"]
];
    // N.B. the images in the demonstration project http://demonstrations.wolfram.com/Turmites/
    // are mirrored - e.g. Langton's ant turns left instead of right.
    // (Also example #45 isn't easily accessed in the demonstration, you need to open both 'advanced' controls,
    //  then type 45 in the top text edit box, then click in the bottom one.)

    // just some discoveries of my own, discovered through random search

/**
 * @type {[rule: string, desc: string][]}
 */
export const timLibrary = [

    // One-turmite effects:
    ["{{{1,2,1},{0,4,1}},{{1,1,0},{0,8,0}}}", "makes a period-12578 gradient 23 in 29 speed c/340 highway (what is the highest period highway?)"],
    ["{{{0,2,1},{0,8,0}},{{1,8,1},{1,4,0}}}", "makes a period-68 (speed c/34) glider (what is the highest period glider?)"
                                             + "(or alternatively, what are the *slowest* highways and gliders?"],
    ["{{{1,4,1},{1,2,1}},{{1,8,0},{1,1,1}}}", "another ice-skater rule, makes H-fractal-like shapes"],
    ["{{{1,1,1},{0,2,1}},{{0,2,1},{1,8,0}}}", "period-9 glider"],
    ["{{{1,2,1},{0,8,1}},{{1,4,0},{1,8,0}}}", "another ice-skater"],
    ["{{{1,4,1},{1,8,1}},{{1,4,0},{0,1,0}}}", "Langton's ant (rot 45) on a 1 background but maze-like on a 0 background"],
    ["{{{0,2,1},{0,8,1}},{{1,1,0},{1,8,1}}}", "slow ice-skater makes furry shape"],
    ["{{{1,8,0},{1,1,1}},{{1,8,0},{0,2,1}}}", "busy beaver (goes cyclic) <50k"],
    ["{{{0,8,1},{1,8,1}},{{1,2,1},{0,2,0}}}", "interesting texture"],
    ["{{{1,1,1},{0,1,0}},{{1,2,0},{1,2,1}}}", "period-17 1 in 3 gradient highway (but needs debris to get started...)"],
    ["{{{0,2,1},{1,8,1}},{{1,4,0},{0,2,1}}}", "period-56 speed-28 horizontal highway"],
    ["{{{1,8,0},{0,1,1}},{{1,2,0},{1,8,0}}}", "somewhat loose growth"]];

// https://github.com/GollyGang/ruletablerepository/wiki/TwoDimensionalTuringMachines
/**
 * @type {[rule: string, desc: string][]}
 */
export const absLibrary = [
    [`{{{0,'N',2},{1,'S',1}},{{0,'E',0},{0,'S',0}},{{1,'W',1},{1,'N',2}}}`, "Alien Counter"]
];
