import { assertEquals, test } from "../../test/deps.js";
import { TM } from "./TM.js";
import { Line } from "./Line.js";
import { TMMap } from "./TMMap.js";
import { palindrome, tm21 } from "./test_data_test.js";

test('TMMap', () => {
    const tm = TM.parse(palindrome);

    if (tm instanceof Error) {
        throw tm;
    }

    const tmMap = TMMap.fromTM(tm);

    if (tmMap instanceof Error) {
        throw tmMap;
    }
    assertEquals(tmMap.map.size, 13);
});

test('TMMap fromTM tm21', () => {
    const tm = TM.parse(tm21);

    if (tm instanceof Error) {
        throw tm;
    }

    const tmMap = TMMap.fromTM(tm);

    if (tmMap instanceof Error) {
        throw tmMap;
    }

    assertEquals(tmMap.map.get('21').get("1"), new Line({
        currentState: "21",
        currentSymbol: "1",
        direction: "l",
        newState: "21",
        newSymbol: undefined
    }));

    assertEquals(tmMap.map.get('21').get("_"), new Line({
        currentState: "21",
        currentSymbol: "_",
        direction: "r",
        newState: "8",
        newSymbol: undefined
    }));

});


test('TMMap fromTM 2', () => {
    const tm = TM.parse(`
0 0 0 l 0
1 1 1 r 1
    `);

    if (tm instanceof Error) {
        throw tm;
    }

    const tmMap = TMMap.fromTM(tm);

    if (tmMap instanceof Error) {
        throw tmMap;
    }

    assertEquals(tmMap.map.size, 2);
    assertEquals(tmMap.map.get('0')?.get("0")?.direction, "l");
    assertEquals(tmMap.map.get('0')?.has("1"), true);
    assertEquals(tmMap.map.get('0')?.get("1"), undefined);
});
