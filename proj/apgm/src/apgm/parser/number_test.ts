import { naturalNumberParser } from "./number.ts";
import { assertEquals, test } from "../../deps_test.ts";

test("parser: number", () => {
    const x = naturalNumberParser.tryParse("123");
    assertEquals(x, 123);
    const y = naturalNumberParser.tryParse("0x10");
    assertEquals(y, 16);
});
