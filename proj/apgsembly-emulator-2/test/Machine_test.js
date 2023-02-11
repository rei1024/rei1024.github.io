// @ts-check

/* eslint-disable camelcase */
import { Machine } from "../src/Machine.js";
import { Program } from "../src/Program.js";
import {
    program9_1,
    program9_2,
    program9_3,
    program9_4,
} from "./Program_test.js";
import { piCalculator } from "./pi_calculator.js";
import { assertEquals, assertThrows, test } from "./deps.js";

/**
 * @param {string} src
 * @param {unknown} [ErrorClass]
 * @param {string} [msgIncludes]
 */
function assertNewMachineThrows(src, ErrorClass, msgIncludes) {
    const program = Program.parse(src);
    if (!(program instanceof Program)) {
        throw Error("parse error " + src);
    }
    assertThrows(
        () => {
            new Machine(program);
        },
        ErrorClass,
        msgIncludes,
    );
}

test("Machine duplicated command", () => {
    const str = `
INITIAL; ZZ; ID0; OUTPUT 3, NOP
INITIAL; ZZ; ID0; OUTPUT 3, NOP
ID0; ZZ; ID0; NOP
    `;
    assertNewMachineThrows(str);
});

test("Machine duplicated command * *", () => {
    const str = `
INITIAL; *; ID0; OUTPUT 3, NOP
INITIAL; *; ID0; OUTPUT 3, NOP
ID0; ZZ; ID0; NOP
    `;
    assertNewMachineThrows(str);
});

test("Machine INITIAL is not exist", () => {
    const str = `
    ID0; ZZ; ID0; NOP
    `;
    assertNewMachineThrows(str, Error, "INITIAL state is not present");
});

test("Machine register header: single quotation support", () => {
    const str = `
#REGISTERS {'U3': 2}
INITIAL; ZZ; A0; TDEC U3
A0; *; A0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error("parse error " + str);
    }
    const machine = new Machine(program);
    assertEquals(machine.actionExecutor.getUReg(3)?.getValue(), 2);
});

test("Machine register header: single quotation support for binary", () => {
    const str = `
#REGISTERS {'B0': [0, '110']}
INITIAL; ZZ; A0; TDEC B0
A0; *; A0; NOP
    `;
    const program = Program.parse(str);
    if (!(program instanceof Program)) {
        throw Error("parse error " + str);
    }
    const machine = new Machine(program);
    assertEquals(machine.actionExecutor.getBReg(0)?.getBits(), [1, 1, 0]);
});

test("Machine register header error: register is not exist", () => {
    const str = `
#REGISTERS {"U3": 2}
INITIAL; ZZ; A0; NOP
A0; *; A0; NOP
    `;
    assertNewMachineThrows(str);
});

test("Machine register header error: is not an object: number", () => {
    const str = `
#REGISTERS 2
INITIAL; ZZ; A0; NOP
A0; *; A0; NOP
    `;
    assertNewMachineThrows(str);
});

test("Machine register header error: is not an object: null", () => {
    const str = `
#REGISTERS null
INITIAL; ZZ; A0; NOP
A0; *; A0; NOP
    `;
    assertNewMachineThrows(str);
});

test("Machine next state is not found", () => {
    const str = `
INITIAL; ZZ; NON_EXIST; NOP
    `;
    assertNewMachineThrows(str);
});

test("Machine program9_1 new Machine", () => {
    const program = Program.parse(program9_1);
    if (!(program instanceof Program)) {
        throw Error("parse error program9_1");
    }
    const machine = new Machine(program);
    assertEquals(machine.getCurrentState(), "INITIAL");
});

test("Machine program9_1 fromString", () => {
    const machine = Machine.fromString(program9_1);
    assertEquals(machine.getCurrentState(), "INITIAL");
});

test("Machine program9_2", () => {
    const program = Program.parse(program9_2);
    if (!(program instanceof Program)) {
        throw Error("parse error program9_2");
    }
    const machine = new Machine(program);

    /**
     * @param {number} n
     */
    function getUReg(n) {
        return machine.actionExecutor.getUReg(n)?.getValue();
    }
    assertEquals([...machine.actionExecutor.uRegMap.keys()], [0, 1]);
    assertEquals(getUReg(0), 7);
    assertEquals(getUReg(1), 5);

    machine.execCommand();

    assertEquals(getUReg(0), 6);
    assertEquals(getUReg(1), 5);

    machine.execCommand();

    assertEquals(getUReg(0), 5);
    assertEquals(getUReg(1), 6);

    for (let i = 0; i < 20; i++) {
        const res = machine.execCommand();
        if (res === -1) {
            break;
        }
    }
    assertEquals(getUReg(0), 0);
    assertEquals(getUReg(1), 12);
    assertEquals(machine.stepCount, 9);
});

test("Machine program9_3", () => {
    const program = Program.parse(program9_3);
    if (!(program instanceof Program)) {
        throw Error("parse error program9_3");
    }
    const machine = new Machine(program);
    assertEquals([...machine.actionExecutor.uRegMap.keys()], [0, 1, 2, 3]);
    assertEquals(machine.actionExecutor.getUReg(0)?.getValue(), 7);
    assertEquals(machine.actionExecutor.getUReg(1)?.getValue(), 5);
    for (let i = 0; i < 100; i++) {
        const res = machine.execCommand();
        if (res === -1) {
            break;
        }
    }
    assertEquals(machine.actionExecutor.getUReg(0)?.getValue(), 0);
    assertEquals(machine.actionExecutor.getUReg(1)?.getValue(), 5);
    assertEquals(machine.actionExecutor.getUReg(2)?.getValue(), 35);
    assertEquals(machine.actionExecutor.getUReg(3)?.getValue(), 0);

    assertEquals(machine.getStateStats(), [
        {
            nz: 0,
            z: 1,
        },
        {
            nz: 7,
            z: 1,
        },
        {
            nz: 35,
            z: 7,
        },
        {
            nz: 35,
            z: 7,
        },
    ]);
});

test("Machine program9_4", () => {
    const program = Program.parse(program9_4);
    if (!(program instanceof Program)) {
        throw Error("parse error program9_4");
    }
    const machine = new Machine(program);
    assertEquals(machine.actionExecutor.getBReg(0)?.toBinaryString(), "0");

    for (let i = 0; i < 100; i++) {
        const res = machine.execCommand();
        if (res === -1) {
            break;
        }
    }
    assertEquals(
        machine.actionExecutor.getBReg(0)?.toBinaryString(),
        "10001011",
    );
});

test("Machine program9_4 exec", () => {
    const program = Program.parse(program9_4);
    if (!(program instanceof Program)) {
        throw Error("parse error program9_4");
    }
    const machine = new Machine(program);
    assertEquals(machine.actionExecutor.getBReg(0)?.toBinaryString(), "0");

    machine.exec(100, false, -1, 0);

    assertEquals(
        machine.actionExecutor.getBReg(0)?.toBinaryString(),
        "10001011",
    );
});

test("Machine exec", () => {
    const program = Program.parse(`
#REGISTERS { "U0": 42 }
INITIAL; ZZ; A_Z; INC B0, NOP
A_Z; *; A0; TDEC B0
A0; Z; A1; NOP
A0; NZ; A0; TDEC U0, INC U1
A1; *; A1; HALT_OUT
    `);
    if (!(program instanceof Program)) {
        throw Error("parse error: " + program);
    }

    for (const cond of [true, false]) {
        const machine = new Machine(program);
        const N = 100;
        if (cond) {
            for (let i = 0; i < N; i++) {
                const res = machine.execCommand();
                if (res === -1) {
                    break;
                }
            }
        } else {
            const result = machine.exec(N, false, -1, 0);
            assertEquals(result, "Halted");
        }
        assertEquals(machine.stepCount, 47);
        assertEquals(machine.actionExecutor.getUReg(0)?.getValue(), 0);
        assertEquals(machine.actionExecutor.getUReg(1)?.getValue(), 43);
        assertEquals(machine.getStateStats()[2], { nz: 43, z: 1 });
    }
});

test("Machine PI Calculator", () => {
    const program = Program.parse(piCalculator);
    if (!(program instanceof Program)) {
        throw Error("parse error PI Calculator");
    }
    let normalStats;
    let execStats;
    for (const cond of [true, false]) {
        const machine = new Machine(program);

        const N = 250000;

        if (cond) {
            for (let i = 0; i < N; i++) {
                const res = machine.execCommand();
                if (res === -1) {
                    break;
                }
            }
            normalStats = machine.getStateStats();
        } else {
            const result = machine.exec(N, false, -1, 0);
            assertEquals(result, undefined);
            execStats = machine.getStateStats();
        }

        assertEquals(machine.stepCount, N);
        assertEquals(machine.actionExecutor.output.getString(), "3.14");
    }

    assertEquals(normalStats, execStats);
});

test("Machine exec opt", () => {
    const program = Program.parse(`
    #REGISTERS { "U0": 3 }
INITIAL; ZZ; A_Z; INC B0, NOP
A_Z; *; A0; TDEC B0
A0; Z; A1; NOP
A0; NZ; A0; TDEC U0, INC U1
A1; *; END_0; NOP
END_0; *; END_1; NOP
END_1; *; END_1; HALT_OUT
    `);
    if (!(program instanceof Program)) {
        throw Error("parse error");
    }

    const res = [];
    for (let i = 1; i < 8; i++) {
        const machine = new Machine(program);
        const actionExecutor = machine.actionExecutor;
        machine.exec(i, false, -1, 0);
        res.push([
            actionExecutor.getUReg(0)?.getValue(),
            actionExecutor.getUReg(1)?.getValue(),
            machine.stepCount,
            machine.getStateStats()[machine.getStateMap().get("A0") ?? ""],
        ]);
    }

    assertEquals(res, [
        [3, 0, 1, { nz: 0, z: 0 }],
        [3, 0, 2, { nz: 0, z: 0 }],
        [2, 1, 3, { nz: 1, z: 0 }],
        [1, 2, 4, { nz: 2, z: 0 }],
        [0, 3, 5, { nz: 3, z: 0 }],
        [0, 4, 6, { nz: 4, z: 0 }],
        [0, 4, 7, { nz: 4, z: 1 }],
    ]);
});

test("Machine PI Calculator steps", () => {
    const program = Program.parse(piCalculator);
    if (!(program instanceof Program)) {
        throw Error("parse error PI Calculator");
    }

    /**
     * @param {Machine} machine
     */
    function getStats(machine) {
        return [
            machine.stepCount,
            machine.prevOutput,
            machine.getStateStats(),
            machine.actionExecutor.getBReg(0)?.getBits().slice(),
            machine.actionExecutor.getBReg(0)?.pointer,
            machine.actionExecutor.getUReg(0)?.getValue(),
        ];
    }

    const resNormal = [];
    const resExec = [];
    for (const cond of [true, false]) {
        const N = 100;

        if (cond) {
            const machine = new Machine(program);

            for (let i = 0; i < N; i++) {
                const res = machine.execCommand();
                if (res === -1) {
                    break;
                }
                resNormal.push(getStats(machine));
            }
        } else {
            for (let i = 1; i <= N; i++) {
                const machine = new Machine(program);
                machine.exec(i, false, -1, 0);
                resExec.push(getStats(machine));
            }
        }
    }

    assertEquals(resNormal, resExec);
});

test("Machine double", () => {
    // U0 -> U1, U2
    // U2 -> U1
    // U1 -> U0, U2
    // U2 -> U0
    const source = `
#REGISTERS { "U0": 1 }
# State    Input    Next state    Actions
# ---------------------------------------
INITIAL; ZZ; A0; TDEC U0
A0; Z; B0; TDEC U2
A0; NZ; A0; TDEC U0, INC U1, INC U2
B0; Z; C0; TDEC U1
B0; NZ; B0; TDEC U2, INC U1

C0; Z; D0; TDEC U2
C0; NZ; C0; TDEC U1, INC U0, INC U2
D0; Z; A0; TDEC U0
D0; NZ; D0; TDEC U2, INC U0
    `;
    const program = Program.parse(source);
    if (!(program instanceof Program)) {
        throw Error("parse error");
    }

    const machine = new Machine(program);

    const N = 250000;

    machine.exec(N, false, -1, 0);
    assertEquals(machine.actionExecutor.getUReg(0)?.getValue(), 0);
    assertEquals(machine.actionExecutor.getUReg(1)?.getValue(), 118896);
});
