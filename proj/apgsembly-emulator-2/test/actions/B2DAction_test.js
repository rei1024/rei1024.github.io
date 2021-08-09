import { B2DAction } from "../../src/actions/B2DAction.js";
import { assertEquals, test } from "../deps.js";

test('B2DAction pretty', () => {
    assertEquals(new B2DAction('INC', 'B2DX')?.pretty(), "INC B2DX");
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
    assertEquals(B2DAction.parse('TDEC B2DX').isSameComponent(B2DAction.parse('SET B2D')), true);
});
