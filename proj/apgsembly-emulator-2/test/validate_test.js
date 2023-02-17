// @ts-check

import { NopAction } from "../src/actions/NopAction.js";
import { OutputAction } from "../src/actions/OutputAction.js";
import { HaltOutAction } from "../src/actions/HaltOutAction.js";
import { U_INC, URegAction } from "../src/actions/URegAction.js";
import { Command } from "../src/Command.js";
import { validateNoSameComponentCommand } from "../src/validators/no_same_component.js";
import { validateActionReturnOnceCommand } from "../src/validators/action_return_once.js";
import { validateNoDuplicatedActionCommand } from "../src/validators/no_dup_action.js";
import { validateZAndNZ } from "../src/validators/z_and_nz.js";
import { validateAll } from "../src/validate.js";
import { assertEquals, test } from "./deps.js";

test("validateAll", () => {
    assertEquals(
        validateAll([
            new Command({
                state: "INITIAL",
                input: "ZZ",
                nextState: "A0",
                actions: [
                    new URegAction(U_INC, 0),
                    new URegAction(U_INC, 0),
                    new NopAction(),
                ],
            }),
        ]),
        `Duplicated actions "INC U0" in "INITIAL; ZZ; A0; INC U0, INC U0, NOP"
Actions "INC U0" and "INC U0" use same component in "INITIAL; ZZ; A0; INC U0, INC U0, NOP"`,
    );
});

test("validateActionReturnOnce HALT_OUT", () => {
    const err = validateActionReturnOnceCommand(
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new HaltOutAction(), new HaltOutAction()],
        }),
    );
    // FIXME: とりあえず無視
    assertEquals(err, undefined);
});

test("validateNoSameComponent NOP NOP", () => {
    const err = validateNoSameComponentCommand(
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new NopAction(), new NopAction()],
        }),
    );
    assertEquals(
        err,
        `Actions "NOP" and "NOP" use same component in "INITIAL; ZZ; A0; NOP, NOP"`,
    );
});

test("validateZAndNZ ZZ and NZ", () => {
    const err = validateZAndNZ([
        new Command({
            state: "A0",
            input: "ZZ",
            nextState: "A0",
            actions: [new NopAction()],
        }),
        new Command({
            state: "INITIAL",
            input: "NZ",
            nextState: "A0",
            actions: [new NopAction()],
        }),
    ]);
    assertEquals(
        err,
        [`Need Z line followed by NZ line in "A0; ZZ; A0; NOP"`],
    );
});

test("validateZAndNZ empty", () => {
    const err = validateZAndNZ([]);
    assertEquals(
        err,
        undefined,
    );
});

test("validateZAndNZ Z", () => {
    const err = validateZAndNZ([
        new Command({
            state: "INITIAL",
            input: "Z",
            nextState: "A0",
            actions: [new NopAction()],
        }),
    ]);
    assertEquals(
        err,
        ['Need Z line followed by NZ line in "INITIAL; Z; A0; NOP"'],
    );
});

test("validateNoDuplicatedAction NOP NOP", () => {
    const err = validateNoDuplicatedActionCommand(
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new NopAction(), new NopAction()],
        }),
    );
    assertEquals(
        err,
        `Duplicated actions "NOP" in "INITIAL; ZZ; A0; NOP, NOP"`,
    );
});

test("validateNoDuplicatedAction NOP, OUTPUT 1, NOP", () => {
    const err = validateNoDuplicatedActionCommand(
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new NopAction(), new OutputAction("1"), new NopAction()],
        }),
    );
    assertEquals(
        err,
        `Duplicated actions "NOP" in "INITIAL; ZZ; A0; NOP, OUTPUT 1, NOP"`,
    );
});
