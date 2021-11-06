// @ts-check

import { B2DAction, B2D_INC, B2D_B2DX } from "../../src/actions/B2DAction.js";
import { assertEquals, test } from "../deps.js";

test('B2DAction pretty', () => {
    assertEquals(new B2DAction(B2D_INC, B2D_B2DX)?.pretty(), "INC B2DX");
});

test('B2DAction parse INC', () => {
    assertEquals(B2DAction.parse('INC B2DX')?.pretty(), "INC B2DX");
    assertEquals(B2DAction.parse('INC B2DY')?.pretty(), "INC B2DY");
    assertEquals(B2DAction.parse('INC B2D'), undefined);

    assertEquals(B2DAction.parse('  INC   B2DX  ').pretty(), "INC B2DX");
});

test('B2DAction parse APGsembly 1.0', () => {
    assertEquals(B2DAction.parse('INC SQX')?.pretty(), "INC B2DX");
    assertEquals(B2DAction.parse('INC SQY')?.pretty(), "INC B2DY");
    assertEquals(B2DAction.parse('INC SQ'), undefined);


    assertEquals(B2DAction.parse('DEC SQX')?.pretty(), "TDEC B2DX");
    assertEquals(B2DAction.parse('DEC SQY')?.pretty(), "TDEC B2DY");

    assertEquals(B2DAction.parse('SET SQ')?.pretty(), "SET B2D");
    assertEquals(B2DAction.parse('READ SQ')?.pretty(), "READ B2D");

    assertEquals(B2DAction.parse('READ SQX')?.pretty(), undefined);
    assertEquals(B2DAction.parse('SET SQX')?.pretty(), undefined);

    assertEquals(B2DAction.parse('TDEC SQX'), undefined);
    assertEquals(B2DAction.parse('TDEC SQY'), undefined);
});

test('B2DAction parse TDEC', () => {
    assertEquals(B2DAction.parse('TDEC B2DX')?.pretty(), "TDEC B2DX");
    assertEquals(B2DAction.parse('TDEC B2DY')?.pretty(), "TDEC B2DY");
    assertEquals(B2DAction.parse('TDEC B2D'), undefined);
});

test('B2DAction parse READ', () => {
    assertEquals(B2DAction.parse('READ B2DX'), undefined);

    assertEquals(B2DAction.parse('READ B2DY'), undefined);
    assertEquals(B2DAction.parse('READ B2D')?.pretty(), "READ B2D");
});

test('B2DAction parse SET', () => {
    assertEquals(B2DAction.parse('SET B2DX'), undefined);

    assertEquals(B2DAction.parse('SET B2DY'), undefined);
    assertEquals(B2DAction.parse('SET B2D')?.pretty(), "SET B2D");
});

test('B2DAction parse fail', () => {
    assertEquals(B2DAction.parse('SET'), undefined);
    assertEquals(B2DAction.parse(''), undefined);
    assertEquals(B2DAction.parse('a b c'), undefined);
});

test('B2DAction isSameComponent', () => {
    /**
     *
     * @param {string} str1
     * @param {string} str2
     * @param {boolean} value
     */
    function same(str1, str2, value) {
        assertEquals(
            B2DAction.parse(str1).isSameComponent(B2DAction.parse(str2)),
            value
        );
    }
    same('TDEC B2DX', 'SET B2D', true);
    same('INC B2DX', 'INC B2DY', false);
    same('INC B2DY', 'INC B2DY', true);
    same('INC B2DY', 'TDEC B2DY', true);
    same('INC B2DX', 'TDEC B2DX', true);
    same('INC B2DX', 'INC B2DX', true);
    same('INC B2DY', 'INC B2DX', false);
    same('TDEC B2DX', 'INC B2DY', false);
    same('TDEC B2DY', 'INC B2DX', false);
});
