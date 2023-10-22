// @ts-check

import { test } from "./test_deps.js";
import { TM } from "./TM.js";
import { TMMap } from "./TMMap.js";
import { convert } from "./convert.js";

const test1 = `
0 _ * r 7
0 1 _ r 1
1 1 * r 1
1 _ * r 2
2 _ 1 l 3
2 1 1 r 2
3 _ * l 4
3 1 * l 3
4 1 * l 4
4 _ 1 r 0
5 1 * r 5
5 _ * r 6
6 _ * r 6
6 1 * l 6a
6a _ * r 7
7 _ _ l 8
7 1 _ r 8
8 1 * r 8
8 _ * r 9
9 _ 1 r 10
9 1 * r 9
10 _ 1 l 11
11 _ * l 12
11 1 * l 11
12 _ * r 13
12 1 * l 12
13 _ * l 14
13 1 _ r 8
14 _ * l 14
14 1 _ l 15
15 _ * l halt
15 1 * r 5
`;

test("tm-to-apg convert", () => {
    let tm = TM.parse(test1);

    if (tm instanceof Error) {
        throw tm;
    }

    tm = TM.parse(`
    0 _ * r 5
0 1 _ r 1
1 1 * r 1
1 _ * r 2
2 _ 1 l 3
2 1 * r 2
3 1 * l 3
3 _ * l 4
4 1 * l 4
4 _ 1 r 0
5 _ * r 10
5 1 _ r 6
6 1 * r 6
6 _ * r 7
7 _ 1 l 8
7 1 * r 7
8 1 * l 8
8 _ * l 9
9 1 * l 9
9 _ 1 r 5
10 _ * r 15
10 1 _ r 11
11 1 * r 11
11 _ * r 12
12 _ 1 l 13
12 1 * r 12
13 1 * l 13
13 _ * l 14
14 1 * l 14
14 _ 1 r 10
15 _ * r halt
15 1 _ r 16
16 1 * r 16
16 _ * r 17
17 _ 1 r 18
17 1 * r 17
18 _ 1 l 19
19 1 * l 19
19 _ * l 20
20 1 * l 21
20 _ * l 22
21 1 * l 21
21 _ * r 15
22 _ * l 22
22 1 _ l 23
23 1 * r 24
23 _ * l 26
24 _ * r 24
24 1 * l 25
25 _ * r 15
26 _ * l 26
26 1 _ l 27
27 _ * l 30
27 1 * r 28
28 _ * r 28
28 1 * l 29
29 _ * r 10
30 _ * l 30
30 1 _ l 31
31 _ * l halt
31 1 * r 32
32 _ * r 32
32 1 * l 33
33 _ * r 5
`);

    if (tm instanceof Error) {
        throw tm;
    }

    const tmMap = TMMap.fromTM(tm);

    if (tmMap instanceof Error) {
        throw tmMap;
    }

    const str = convert(tmMap);
    if (str instanceof Error) {
        throw str;
    }
});
