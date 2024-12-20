// @ts-check

// https://en.wikipedia.org/wiki/Busy_beaver#Examples

export const bb3 = `; 3-state busy beaver
; <current state> <current symbol> <new symbol> <direction> <new state>
0 _ 1 r 1
0 1 1 r halt
1 _ _ r 2
1 1 1 r 1
2 _ 1 l 2
2 1 1 l 0`;

export const bb4 = `; 4-state busy beaver
; When run with blank input, prints a number of 1's then halts.
; See, eg, http://en.wikipedia.org/wiki/Busy_beaver for background on the busy beaver problem.

; <current state> <current symbol> <new symbol> <direction> <new state>
0 * * * a

a _ 1 r b
a 1 1 l b
b _ 1 l a
b 1 _ l c
c _ 1 r halt
c 1 1 l d
d _ 1 r d
d 1 _ r a`;

/**
 * https://discuss.bbchallenge.org/t/july-2nd-2024-we-have-proved-bb-5-47-176-870/237
 */
export const bb5 = `; 5-state busy beaver
; <current state> <current symbol> <new symbol> <direction> <new state>
0 _ 1 r 1
0 1 1 l 2
1 _ 1 r 2
1 1 1 r 1
2 _ 1 r 3
2 1 _ l 4
3 _ 1 l 0
3 1 1 l 3
4 _ 1 r halt
4 1 _ l 0`;

export const maybeBB6 = `; 6-state busy beaver?
; <current state> <current symbol> <new symbol> <direction> <new state>
0 _ 1 r 1
0 1 1 l 4
1 _ 1 r 2
1 1 1 r 5
2 _ 1 l 3
2 1 _ r 1
3 _ 1 r 4
3 1 _ l 2
4 _ 1 l 0
4 1 _ r 3
5 _ 1 l halt
5 1 1 r 2
`;

export const bb5Std = `1RB1LC_1RC1RB_1RD0LE_1LA1LD_1RZ0LA`;

/**
 * @type {{
    name: string;
    prog: string;
}[]}
 */
export const list = [
    {
        name: "BB(3)",
        prog: bb3,
    },
    {
        name: "BB(4)",
        prog: bb4,
    },
    {
        name: "BB(5)",
        prog: bb5,
    },
    {
        name: "maybe BB(6)",
        prog: maybeBB6,
    },
    {
        name: "BB(5) Standard text format",
        prog: bb5Std,
    },
];
