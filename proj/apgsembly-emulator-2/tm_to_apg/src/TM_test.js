import { assertEquals, test } from "../../test/deps.js";
import { TM } from "./TM.js";
import { palindrome } from "./test_data_test.js";

test('parse TM', () => {
    const tm = TM.parse(palindrome);

    if (tm instanceof Error) {
        throw tm;
    }
    const states = ["0", "1o", "1i", "2o", "2i", "3", "4", "accept", "accept2", "reject", "reject2", "halt-accept", "halt-reject"];
    assertEquals(tm.getStates(), states);

    assertEquals(tm.getSymbols(), ["0", "_", '1', ":", ")", "("]);
});
