import { expect, test } from "@playwright/test";
import {
    APGsemblyEmulatorURL,
    assertCurrentState,
    assertError,
    assertOutput,
    assertRegister,
    assertSteps,
    assertStepsNot,
    assertToggleDisabledStart,
    assertToggleStart,
    assertToggleStop,
    clickReset,
    clickStep,
    loadProgram,
    setProgram,
    setStep,
    toggle,
} from "./common";

test.describe("Emulator", () => {
    test("should run", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await setProgram(
            page,
            `
        INITIAL; ZZ; A0; INC U0, NOP
        A0; ZZ; A0; HALT_OUT
        `,
        );
        await assertToggleStart(page);
        await expect(page.locator("#step")).toBeEnabled();
        await assertCurrentState(page, "INITIAL");
        await assertRegister(page, "U0", "0");
        await assertError(page, "");

        await toggle(page);
        await expect(page.locator("#step")).toBeDisabled();
        await assertCurrentState(page, "A0");
        await assertRegister(page, "U0", "1");
    });

    test("should error on empty program", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await assertToggleStart(page);
        await toggle(page);
        await assertError(page, "- Program is empty");
        await assertToggleDisabledStart(page);
    });

    test("should execute unary_multiply.apg", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await loadProgram(page, "unary_multiply.apg");

        await assertRegister(page, "U0", "7");
        await assertRegister(page, "U1", "5");

        await setStep(page, 100);
        await clickStep(page);
        await assertSteps(page, 93);
        await assertRegister(page, "U2", "35");

        await assertError(page, "");
    });

    test("should load Integers", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await loadProgram(page, "integers.apg");

        await setStep(page, 1050);
        await clickStep(page);
        await assertOutput(page, "1.2.3.4.5.6.7.8.9.10");
        await assertSteps(page, 1050);

        await assertError(page, "");
    });

    test("Rule 110 should work", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await loadProgram(page, "rule110.apg");

        await setStep(page, 1000);
        await clickStep(page);

        await assertSteps(page, 1000);

        await expect(page.locator("#command")).toHaveText(
            "NEXT_S000_WRITE_1; *; NEXT_S00_CHECK0_1; INC B2DX, NOP",
        );

        await assertError(page, "");
    });

    test("Start Stop Reset", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);

        await loadProgram(page, "rule110.apg");

        await assertToggleStart(page);
        await toggle(page);
        await assertToggleStop(page);
        await page.waitForTimeout(100);
        await toggle(page);
        await assertStepsNot(page, 0);

        await assertError(page, "");

        await clickReset(page);
        await assertSteps(page, 0);

        await assertError(page, "");
    });

    test("Error Unary", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await setProgram(
            page,
            `
    INITIAL; ZZ; A0; NOP
    A0; ZZ; A1; SET B0, NOP
    A1; ZZ; A1; SET B0, NOP`,
        );
        await setStep(page, 100);
        await clickStep(page);
        await assertSteps(page, 3);

        await assertError(
            page,
            '- The bit of the binary register B0 is already 1 in "A1; ZZ; A1; SET B0, NOP" at line 4',
        );
    });

    test("Error B2D", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await setProgram(
            page,
            `
    INITIAL; ZZ; A0; NOP
    A0; ZZ; A1; SET B2D, NOP
    A1; ZZ; A1; SET B2D, NOP`,
        );
        await setStep(page, 100);
        await clickStep(page);
        await assertSteps(page, 3);

        await assertError(
            page,
            '- SET B2D: Tried to set when it was already 1. x = 0, y = 0 in "A1; ZZ; A1; SET B2D, NOP" at line 4',
        );
    });

    test("Validation", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await setProgram(
            page,
            `
    INITIAL; ZZ; A0; NOP
    A0; ZZ; A1; INC U1, TDEC U1
    A1; ZZ; A1; HALT_OUT`,
        );
        await clickReset(page);
        await assertError(
            page,
            '- Actions "INC U1" and "TDEC U1" use same component in "A0; ZZ; A1; INC U1, TDEC U1" at line 3',
        );
    });

    test("π calculator", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await loadProgram(page, "pi_calc.apg");

        // assertNumberOfStates(131);
        await setStep(page, 1000000);
        await clickStep(page);
        await assertOutput(page, "3.141");

        await assertSteps(page, 1000000);

        await assertRegister(
            page,
            "B0",
            "value = 243290200817664000, max_pointer = 177, pointer = 1340000000000000000010010001011000001100100111010100000011011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        );

        await assertError(page, "");
    });

    test("Step", async ({ page }) => {
        await page.goto(APGsemblyEmulatorURL);
        await loadProgram(page, "binary_ruler.apg");

        await setStep(page, 5000000);
        await clickStep(page);
        await assertSteps(page, 5000000);
        await assertToggleStart(page);

        await clickStep(page);
        await assertSteps(page, 5000000 * 2);
        await assertToggleStart(page);

        await assertError(page, "");
        await assertRegister(
            page,
            "B0",
            "value = 1666672, max_pointer = 20, pointer = 0000011100111011010011",
        );
    });
});
