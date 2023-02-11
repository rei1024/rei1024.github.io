// @ts-check

export const palindrome =
    `; This example program checks if the input string is a binary palindrome.
; Input: a string of 0's and 1's, eg '1001001'


; Machine starts in state 0.

; State 0: read the leftmost symbol
0 0 _ r 1o
0 1 _ r 1i
0 _ _ * accept     ; Empty input

; State 1o, 1i: find the rightmost symbol
1o _ _ l 2o
1o * * r 1o

1i _ _ l 2i
1i * * r 1i

; State 2o, 2i: check if the rightmost symbol matches the most recently read left-hand symbol
2o 0 _ l 3
2o _ _ * accept
2o * * * reject

2i 1 _ l 3
2i _ _ * accept
2i * * * reject

; State 3, 4: return to left end of remaining input
3 _ _ * accept
3 * * l 4
4 * * l 4
4 _ _ r 0  ; Back to the beginning

accept * : r accept2
accept2 * ) * halt-accept

reject _ : r reject2
reject * _ l reject
reject2 * ( * halt-reject

    `;

export const tm21 = `0 _ * r halt
0 1 _ r 1
1 1 * r 1
1 _ * r 2
2 _ * r 3
3 _ 1 l 4
3 1 * r 3
4 _ * l 5
4 1 * l 4
5 _ * l 6
6 _ 1 r 7
6 1 * l 6
7 1 _ r 1
7 _ * l 15
8 _ * l 13
8 1 _ r 9
9 1 * r 9
9 _ * r 10
10 _ 1 l 11
10 1 1 r 10
11 _ * l 12
11 1 * l 11
12 1 * l 12
12 _ 1 r 8
13 1 * l 13
13 _ * l 14
14 _ * l 15
14 1 * l 13
15 _ * l 15
15 1 _ l 16
16 _ * l halt
16 1 * r 17
17 _ * r 17
17 1 * r 18
18 1 * r 18
18 _ * r 19
19 1 * r 18
19 _ * l 20
20 _ * l 21
21 1 * l 21
21 _ * r 8`;
