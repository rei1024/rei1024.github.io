import { Machine } from "../src/Machine.js"
import { Program } from "../src/Program.js";
import { program9_1, program9_2, program9_3, program9_4 } from "./Program_test.js";
import { piCalculator } from "./pi_calculator.js";
import { assertEquals } from "./deps.js";

Deno.test('Machine program9_2', () => {
    const program = Program.parse(program9_2);
    const machine = new Machine(program);
    assertEquals(machine.actionExecutor.uRegMap.get(0).getValue(), 7);
    assertEquals(machine.actionExecutor.uRegMap.get(1).getValue(), 5);
    
    machine.execCommand();

    assertEquals(machine.actionExecutor.uRegMap.get(0).getValue(), 6);
    assertEquals(machine.actionExecutor.uRegMap.get(1).getValue(), 5);

    machine.execCommand();

    assertEquals(machine.actionExecutor.uRegMap.get(0).getValue(), 5);
    assertEquals(machine.actionExecutor.uRegMap.get(1).getValue(), 6);

    for (let i = 0; i < 100; i++) {
        const res = machine.execCommand();
        if (res === 'HALT_OUT') {
            break;
        }
    }
    assertEquals(machine.actionExecutor.uRegMap.get(0).getValue(), 0);
    assertEquals(machine.actionExecutor.uRegMap.get(1).getValue(), 12);
});

Deno.test('Machine program9_3', () => {
    const program = Program.parse(program9_3);
    const machine = new Machine(program);
    assertEquals(machine.actionExecutor.uRegMap.get(0).getValue(), 7);
    assertEquals(machine.actionExecutor.uRegMap.get(1).getValue(), 5);
    for (let i = 0; i < 100; i++) {
        const res = machine.execCommand();
        if (res === 'HALT_OUT') {
            break;
        }
    }
    assertEquals(machine.actionExecutor.uRegMap.get(0).getValue(), 0);
    assertEquals(machine.actionExecutor.uRegMap.get(1).getValue(), 5);
    assertEquals(machine.actionExecutor.uRegMap.get(2).getValue(), 35);
    assertEquals(machine.actionExecutor.uRegMap.get(3).getValue(), 0); 
});

Deno.test('Machine program9_4', () => {
    const program = Program.parse(program9_4);
    const machine = new Machine(program);
    assertEquals(machine.actionExecutor.bRegMap.get(0).toBinaryString(), "0");

    for (let i = 0; i < 100; i++) {
        const res = machine.execCommand();
        if (res === 'HALT_OUT') {
            break;
        }
    }
    assertEquals(machine.actionExecutor.bRegMap.get(0).toBinaryString(), "10001011");
});

Deno.test('Machine PI Calculator', () => {
    const program = Program.parse(piCalculator);
    const machine = new Machine(program);
    // machine.actionExecutor.bRegMap.get(0)?.setBits([0, 1]);
    // machine.actionExecutor.bRegMap.get(2)?.setBits([1]);
    // console.log(machine);
    // console.log(machine.actionExecutor);
    for (let i = 0; i < 400000; i++) {
        try {
            const res = machine.execCommand();
            if (res === 'HALT_OUT') {
                break;
            }
        } catch (e) {
            throw e;
        }

    }
    // console.log(machine.actionExecutor);
    assertEquals(machine.actionExecutor.output.getString(), "3.14");
});
