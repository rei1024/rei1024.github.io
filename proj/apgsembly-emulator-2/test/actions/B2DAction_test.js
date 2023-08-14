// @ts-check

import { B2DAction } from "../../src/actions/B2DAction.js";
import { B2D_B2DX, B2D_INC } from "../../src/action_consts/B2D_consts.js";
import { assertEquals, never, test } from "../deps.js";

/**
 * @param {string} source
 * @param {string | undefined} expected
 */
function parsePretty(source, expected) {
    assertEquals(B2DAction.parse(source)?.pretty(), expected);
}

test("B2DAction pretty", () => {
    assertEquals(new B2DAction(B2D_INC, B2D_B2DX)?.pretty(), "INC B2DX");
});

test("B2DAction parse INC", () => {
    parsePretty("INC B2DX", "INC B2DX");
    parsePretty("INC B2DY", "INC B2DY");
    parsePretty("  INC   B2DX  ", "INC B2DX");
});

test("B2DAction parse APGsembly 1.0", () => {
    parsePretty("INC SQX", "INC B2DX");
    parsePretty("INC SQY", "INC B2DY");
    parsePretty("INC SQ", undefined);

    parsePretty("DEC SQX", "TDEC B2DX");
    parsePretty("DEC SQY", "TDEC B2DY");

    parsePretty("SET SQ", "SET B2D");
    parsePretty("READ SQ", "READ B2D");

    parsePretty("SET SQX", undefined);
    parsePretty("READ SQX", undefined);
    parsePretty("SET SQY", undefined);
    parsePretty("READ SQY", undefined);
});

test("B2DAction parse TDEC", () => {
    parsePretty("TDEC B2DX", "TDEC B2DX");
    parsePretty("TDEC B2DY", "TDEC B2DY");
    parsePretty("TDEC B2D", undefined);
});

test("B2DAction parse READ", () => {
    parsePretty("READ B2DX", undefined);
    parsePretty("READ B2DY", undefined);
    parsePretty("READ B2D", "READ B2D");
});

test("B2DAction parse SET", () => {
    parsePretty("SET B2DX", undefined);
    parsePretty("SET B2DY", undefined);
    parsePretty("SET B2D", "SET B2D");
});

test("B2DAction parse fail", () => {
    parsePretty("SET", undefined);
    parsePretty("", undefined);
    parsePretty("a b c", undefined);
});

test("B2DAction isSameComponent", () => {
    /**
     * @param {string} str1
     * @param {string} str2
     * @param {boolean} value
     */
    function same(str1, str2, value) {
        assertEquals(
            B2DAction.parse(str1)?.isSameComponent(
                B2DAction.parse(str2) ?? never(),
            ),
            value,
        );
    }
    same("TDEC B2DX", "SET B2D", true);
    same("INC B2DX", "INC B2DY", false);
    same("INC B2DY", "INC B2DY", true);
    same("INC B2DY", "TDEC B2DY", true);
    same("INC B2DX", "TDEC B2DX", true);
    same("INC B2DX", "INC B2DX", true);
    same("INC B2DY", "INC B2DX", false);
    same("TDEC B2DX", "INC B2DY", false);
    same("TDEC B2DY", "INC B2DX", false);
});
