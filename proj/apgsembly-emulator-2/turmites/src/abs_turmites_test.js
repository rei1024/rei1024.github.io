// @ts-check

import { AbsTurmites } from "./abs_turmites.js";
import { assertEquals, test } from "../../test/deps.js";

test("AbsTurmites fromObjectString", () => {
    const str =
        "{{{1,'N',1},{1,'',0}},{{1,'E',2},{1,'E',3}},{{1,'W',3},{0,'S',4}},{{0,'W',4},{1,'S',3}},{{1,'E',0},{0,'W',4}}}";
    const tur = AbsTurmites.fromObjectString(str);
    assertEquals(str, tur.toString());
});
