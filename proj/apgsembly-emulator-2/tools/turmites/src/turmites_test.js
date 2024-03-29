// @ts-check

import { Turmites } from "./turmites.js";
import { assertEquals, test } from "../../../test/deps.js";

test("Turmites fromObjectString", () => {
    const str = "{{{1,2,0},{0,1,1}},{{1,2,1},{0,8,0}}}";
    const tur = Turmites.fromObjectString(str);
    assertEquals(str, tur.toString());
});
