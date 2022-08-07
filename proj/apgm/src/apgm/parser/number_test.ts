import { naturalNumberParser } from "./number.ts";
import { assertEquals, test } from "../../deps_test.ts";

test("parser: number", () => {
    const array: [string, number][] = [
        ["0", 0],
        ["123", 123],
        ["0x10", 16],
        ["0xf", 15],
        ["0xF", 15],
        ["0xff", 255],
    ];
    for (const [str, num] of array) {
        assertEquals(naturalNumberParser.tryParse(str), num);
    }
});
