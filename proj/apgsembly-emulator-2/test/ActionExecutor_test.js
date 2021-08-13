import { ActionExecutor } from '../src/ActionExecutor.js';
import { assertEquals, test, assertThrows } from './deps.js';

test('ActionExecutor output', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [],
        binaryRegisterNumbers: []
    });
    x.output.output('3');
    assertEquals(x.output.getString(), '3');
});

test('ActionExecutor setByRegistersInit empty', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [],
        binaryRegisterNumbers: []
    });
    x.setByRegistersInit({});
});

test('ActionExecutor setByRegistersInit', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [0, 1],
        binaryRegisterNumbers: [0, 1]
    });

    assertEquals(x.uRegMap.size, 2);
    assertEquals(x.bRegMap.size, 2);

    x.setByRegistersInit({ B0: [0, '11010001'], B1: [2, '110'], U0: 8 });
    assertEquals(
        [...x.bRegMap.get(0).toBinaryString()].reverse().join(''),
        '11010001'
    );
    assertEquals(x.bRegMap.get(0).pointer, 0);
    assertEquals(
        [...x.bRegMap.get(1).toBinaryString()].reverse().join(''),
        '110'
    );
    assertEquals(x.bRegMap.get(1).pointer, 2);
    assertEquals(x.uRegMap.get(0).getValue(), 8);
});

test('ActionExecutor setByRegistersInit', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [0, 1],
        binaryRegisterNumbers: [0, 1]
    });

    assertEquals(x.uRegMap.size, 2);
    assertEquals(x.bRegMap.size, 2);

    x.setByRegistersInit({ B0: 11 });
    assertEquals(
        [...x.bRegMap.get(0).toBinaryString()].reverse().join(''),
        '1101'
    );
    assertEquals(x.bRegMap.get(0).pointer, 0);
});

test('ActionExecutor setByRegistersInit error', () => {
    const x = new ActionExecutor({
        unaryRegisterNumbers: [0, 1],
        binaryRegisterNumbers: [0, 1]
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
        x.setByRegistersInit({ U0: true });
    });

    assertThrows(() => {
        x.setByRegistersInit({ U0: null });
    });

    assertThrows(() => {
        x.setByRegistersInit({ U0: "11" });
    });

    assertThrows(() => {
        x.setByRegistersInit({ B0: [0, 5] });
    });

    assertThrows(() => {
        x.setByRegistersInit({ B0: ['3', '11'] });
    });
});
