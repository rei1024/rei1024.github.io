import { assertEquals, test } from "../../test/deps.js";
import { TM } from "./TM.js";
import { TMMap } from "./TMMap.js";
import { palindrome } from "./test_data_test.js";

test('TMMap convert', () => {
    const tm = TM.parse(palindrome);

    if (tm instanceof Error) {
        throw tm;
    }

    const tmMap = TMMap.fromTM(tm);

    if (tmMap instanceof Error) {
        throw tmMap;
    }
});
