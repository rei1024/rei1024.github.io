// @ts-check

import { ActionExecutor } from '../src/ActionExecutor.js';
import { BRegAction, B_INC, B_SET, B_TDEC, B_READ } from '../src/actions/BRegAction.js';
import { URegAction, U_INC, U_TDEC } from "../src/actions/URegAction.js";

import { assertEquals, test, assertThrows } from './deps.js';

test('ActionExecutor output', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [],
        binaryRegisterNumbers: [],
        legacyTRegisterNumbers: [],
    });
    x.output.output('3');
    assertEquals(x.output.getString(), '3');
});

test('ActionExecutor setByRegistersInit empty', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [],
        binaryRegisterNumbers: [],
        legacyTRegisterNumbers: [],
    });
    x.setByRegistersInit({});
});

test('ActionExecutor constructor', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [0],
        binaryRegisterNumbers: [1],
        legacyTRegisterNumbers: [2],
    });
    assertEquals(x.getUReg(0) !== undefined, true);
    assertEquals(x.getBReg(1) !== undefined, true);
    assertEquals(x.legecyTRegMap.get(2) !== undefined, true);
});

test('ActionExecutor setByRegistersInit', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [0, 1],
        binaryRegisterNumbers: [0, 1],
        legacyTRegisterNumbers: [],
    });

    assertEquals(x.uRegMap.size, 2);
    assertEquals(x.bRegMap.size, 2);

    const bReg0 = x.getBReg(0);

    if (bReg0 === undefined) {
        throw Error('is undefined');
    }

    const bReg1 = x.getBReg(1);

    if (bReg1 === undefined) {
        throw Error('is undefined');
    }

    const uReg0 = x.getUReg(0);

    if (uReg0 === undefined) {
        throw Error('is undefined');
    }

    x.setByRegistersInit({ B0: [0, '11010001'], B1: [2, '110'], U0: 8 });
    assertEquals(
        [...bReg0.toBinaryString()].reverse().join(''),
        '11010001'
    );
    assertEquals(bReg0.pointer, 0);
    assertEquals(
        [...bReg1.toBinaryString()].reverse().join(''),
        '110'
    );
    assertEquals(bReg1.pointer, 2);
    assertEquals(uReg0.getValue(), 8);

    uReg0.inc();
    assertEquals(uReg0.getValue(), 9);
});

test('ActionExecutor setByRegistersInit 2', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [0, 1],
        binaryRegisterNumbers: [0, 1],
        legacyTRegisterNumbers: [],
    });

    assertEquals(x.uRegMap.size, 2);
    assertEquals(x.bRegMap.size, 2);

    x.setByRegistersInit({ B0: 11 });
    const bReg0 = x.getBReg(0);
    if (bReg0 == undefined) {
        throw Error('bReg0 is undefined');
    }
    assertEquals(
        [...bReg0.toBinaryString()].reverse().join(''),
        '1101'
    );
    assertEquals(bReg0.pointer, 0);
});

test('ActionExecutor setByRegistersInit error', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [0, 1],
        binaryRegisterNumbers: [0, 1],
        legacyTRegisterNumbers: [],
    });

    assertEquals(x.uRegMap.size, 2);
    assertEquals(x.bRegMap.size, 2);

    assertThrows(() => {
        x.setByRegistersInit({ U0: [0, '11'] });
    });

    assertThrows(() => {
        x.setByRegistersInit({ "U-1": 1 });
    });

    assertThrows(() => {
        // @ts-ignore expect type error
        x.setByRegistersInit({ U0: true });
    });

    assertThrows(() => {
        x.setByRegistersInit({ U0: null });
    });

    assertThrows(() => {
        // @ts-ignore expect type error
        x.setByRegistersInit({ U0: "11" });
    });

    assertThrows(() => {
        // @ts-ignore expect type error
        x.setByRegistersInit({ B0: [0, 5] });
    });

    assertThrows(() => {
        // @ts-ignore expect type error
        x.setByRegistersInit({ B0: ['3', '11'] });
    });

    assertThrows(() => {
        // @ts-ignore expect type error
        x.setByRegistersInit({ B0: {} });
    });
});


test('ActionExecutor register not found error', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [0],
        binaryRegisterNumbers: [0],
        legacyTRegisterNumbers: [],
    });

    assertEquals(x.execAction(new URegAction(U_INC, 0)), undefined);
    assertEquals(x.execAction(new URegAction(U_TDEC, 0)), 1);
    assertEquals(x.execAction(new URegAction(U_TDEC, 0)), 0);
    assertThrows(() => {
        x.execAction(new URegAction(U_INC, 1));
    });
});

test('ActionExecutor BReg', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [],
        binaryRegisterNumbers: [0],
        legacyTRegisterNumbers: [],
    });

    assertEquals(x.execAction(new BRegAction(B_INC, 0)), undefined);
    assertEquals(x.execAction(new BRegAction(B_TDEC, 0)), 1);
    assertEquals(x.execAction(new BRegAction(B_TDEC, 0)), 0);
    assertEquals(x.execAction(new BRegAction(B_SET, 0)), undefined);
    assertEquals(x.execAction(new BRegAction(B_READ, 0)), 1);
    assertEquals(x.execAction(new BRegAction(B_READ, 0)), 0);

    assertThrows(() => {
        x.execAction(new URegAction(U_INC, 1));
    });
});
