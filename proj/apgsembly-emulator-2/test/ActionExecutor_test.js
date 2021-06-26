import { ActionExecutor } from '../src/ActionExecutor.js';
import { assertEquals } from './deps.js';

Deno.test('ActionExecutor output', () => {
    const x = new ActionExecutor({ unaryRegisterNumbers: [], binaryRegisterNumbers: [] });
    x.output.output('3');
    assertEquals(x.output.getString(), '3');
});

Deno.test('ActionExecutor setByRegistersInit empty', () => {
    const x = new ActionExecutor({ unaryRegisterNumbers: [], binaryRegisterNumbers: [] });
    x.setByRegistersInit({});
});

Deno.test('ActionExecutor setByRegistersInit empty', () => {
    const x = new ActionExecutor({ unaryRegisterNumbers: [0, 1], binaryRegisterNumbers: [0, 1] });
    x.setByRegistersInit({ "B0": [0, '11010001'], "U0": 8 });
    assertEquals([...x.bRegMap.get(0).toBinaryString()].reverse().join(''), '11010001');
    assertEquals(x.uRegMap.get(0).getValue(), 8);
});
