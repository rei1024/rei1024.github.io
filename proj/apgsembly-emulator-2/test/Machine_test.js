import { Machine } from "../src/Machine.js"
import { Program } from "../src/Program.js";
import { program9_1, program9_2, program9_3, program9_4 } from "./Program_test.js";
import { piCalculator } from "./pi_calculator.js";
import { assertEquals, assertThrows } from "./deps.js";

Deno.test('Machine duplicated command', () => {
    const str = `
INITIAL; ZZ; ID0; OUTPUT 3, NOP
INITIAL; ZZ; ID0; OUTPUT 3, NOP
ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine duplicated command NZ NZ', () => {
    const str = `
INITIAL; NZ; ID0; OUTPUT 3, NOP
INITIAL; NZ; ID0; OUTPUT 3, NOP
ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine duplicated command * *', () => {
    const str = `
INITIAL; NZ; ID0; OUTPUT 3, NOP
INITIAL; NZ; ID0; OUTPUT 3, NOP
ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine duplicated command * NZ', () => {
    const str = `
INITIAL; *; ID0; OUTPUT 3, NOP
INITIAL; NZ; ID0; OUTPUT 3, NOP
ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine duplicated command * Z', () => {
    const str = `
INITIAL; *; ID0; OUTPUT 3, NOP
INITIAL; Z; ID0; OUTPUT 3, NOP
ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine duplicated command ZZ Z', () => {
    const str = `
INITIAL; ZZ; ID0; OUTPUT 3, NOP
INITIAL; Z; ID0; OUTPUT 3, NOP
ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine INITIAL is not exist', () => {
    const str = `
    ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine Program no return value', () => {
    const str = `
INITIAL; ZZ; ID0; OUTPUT 3
ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    assertEquals(program, `Does not return the value in "INITIAL; ZZ; ID0; OUTPUT 3"`);
});

Deno.test('Machine Program return value twice', () => {
    const str = `
INITIAL; ZZ; ID0; NOP, TDEC U0
ID0; ZZ; ID0; NOP
    `;
    const program = Program.parse(str);
    assertEquals(program, 'The return value is returned more than once in "INITIAL; ZZ; ID0; NOP, TDEC U0": Actions that return a return value more than once are NOP, TDEC U0');
});

// > Also, the INITIAL state should never be returned to later in a program’s execution.
// > It should be the first state, and only the first state.
Deno.test('Machine INITIAL twice', () => {
    const str = `
INITIAL; ZZ; INITIAL; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    const machine = new Machine(program);

    assertThrows(() => {
        machine.execCommand();
    });
});

Deno.test('Machine register header error: register is not exist', () => {
    const str = `
#REGISTERS {"U3": 2}
INITIAL; ZZ; INITIAL; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }

    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine register header error: is not an object: number', () => {
    const str = `
#REGISTERS 2
INITIAL; ZZ; INITIAL; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }

    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine register header error: is not an object: null', () => {
    const str = `
#REGISTERS null
INITIAL; ZZ; INITIAL; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }

    assertThrows(() => {
        new Machine(program);
    });
});

Deno.test('Machine next state is not found', () => {
    const str = `
INITIAL; ZZ; NON_EXIST; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error('parse error '  + str);
    }
    assertThrows(() => {
        const machine = new Machine(program);
    });
});

Deno.test('Machine program9_2', () => {
    const program = Program.parse(program9_2);
    if (!(program instanceof Program)) {
        throw Error('parse error program9_2');
    }
    const machine = new Machine(program);
    assertEquals([...machine.actionExecutor.uRegMap.keys()], [0, 1]);
    assertEquals(machine.actionExecutor.uRegMap.get(0)?.getValue(), 7);
    assertEquals(machine.actionExecutor.uRegMap.get(1)?.getValue(), 5);

    machine.execCommand();

    assertEquals(machine.actionExecutor.uRegMap.get(0)?.getValue(), 6);
    assertEquals(machine.actionExecutor.uRegMap.get(1)?.getValue(), 5);

    machine.execCommand();

    assertEquals(machine.actionExecutor.uRegMap.get(0)?.getValue(), 5);
    assertEquals(machine.actionExecutor.uRegMap.get(1)?.getValue(), 6);

    for (let i = 0; i < 100; i++) {
        const res = machine.execCommand();
        if (res === -1) {
            break;
        }
    }
    assertEquals(machine.actionExecutor.uRegMap.get(0).getValue(), 0);
    assertEquals(machine.actionExecutor.uRegMap.get(1).getValue(), 12);
});

Deno.test('Machine program9_3', () => {
    const program = Program.parse(program9_3);
    if (!(program instanceof Program)) {
        throw Error('parse error program9_3');
    }
    const machine = new Machine(program);
    assertEquals([...machine.actionExecutor.uRegMap.keys()], [0, 1, 2, 3]);
    assertEquals(machine.actionExecutor.uRegMap.get(0)?.getValue(), 7);
    assertEquals(machine.actionExecutor.uRegMap.get(1)?.getValue(), 5);
    for (let i = 0; i < 100; i++) {
        const res = machine.execCommand();
        if (res === -1) {
            break;
        }
    }
    assertEquals(machine.actionExecutor.uRegMap.get(0)?.getValue(), 0);
    assertEquals(machine.actionExecutor.uRegMap.get(1)?.getValue(), 5);
    assertEquals(machine.actionExecutor.uRegMap.get(2)?.getValue(), 35);
    assertEquals(machine.actionExecutor.uRegMap.get(3)?.getValue(), 0); 
});

Deno.test('Machine program9_4', () => {
    const program = Program.parse(program9_4);
    if (!(program instanceof Program)) {
        throw Error('parse error program9_4');
    }
    const machine = new Machine(program);
    assertEquals(machine.actionExecutor.bRegMap.get(0)?.toBinaryString(), "0");

    for (let i = 0; i < 100; i++) {
        const res = machine.execCommand();
        if (res === -1) {
            break;
        }
    }
    assertEquals(machine.actionExecutor.bRegMap.get(0).toBinaryString(), "10001011");
});

Deno.test('Machine PI Calculator', () => {
    const program = Program.parse(piCalculator);
    if (!(program instanceof Program)) {
        throw Error('parse error PI Calculator');
    }
    const machine = new Machine(program);
    // machine.actionExecutor.bRegMap.get(0)?.setBits([0, 1]);
    // machine.actionExecutor.bRegMap.get(2)?.setBits([1]);
    // console.log(machine);
    // console.log(machine.actionExecutor);
    for (let i = 0; i < 250000; i++) {
        try {
            const res = machine.execCommand();
            if (res === -1) {
                break;
            }
        } catch (e) {
            throw e;
        }

    }
    // console.log(machine.actionExecutor);
    assertEquals(machine.actionExecutor.output.getString(), "3.14");
});
