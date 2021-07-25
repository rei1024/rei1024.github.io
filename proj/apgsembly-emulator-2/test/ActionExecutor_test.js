import { ActionExecutor } from '../src/ActionExecutor.js';
import { assertEquals, test } from './deps.js';

test('ActionExecutor output', () => {
    const x = new ActionExecutor({ unaryRegisterNumbers: [], binaryRegisterNumbers: [] });
    x.output.output('3');
    assertEquals(x.output.getString(), '3');
});

test('ActionExecutor setByRegistersInit empty', () => {
    const x = new ActionExecutor({ unaryRegisterNumbers: [], binaryRegisterNumbers: [] });
    x.setByRegistersInit({});
});

test('ActionExecutor setByRegistersInit', () => {
    const x = new ActionExecutor({ unaryRegisterNumbers: [0, 1], binaryRegisterNumbers: [0, 1] });

    assertEquals(x.uRegMap.size, 2);
    assertEquals(x.bRegMap.size, 2);

    x.setByRegistersInit({ B0: [0, '11010001'], U0: 8 });
    assertEquals([...x.bRegMap.get(0).toBinaryString()].reverse().join(''), '11010001');
    assertEquals(x.uRegMap.get(0).getValue(), 8);
});
