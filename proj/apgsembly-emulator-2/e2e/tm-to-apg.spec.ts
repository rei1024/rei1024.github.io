import { expect, test } from "@playwright/test";
import {
    APGsemblyEmulatorURL,
    assertRegister,
    assertSteps,
    clickStep,
    setProgram,
    setStep,
    tmToAPGURL,
} from "./common.js";

test.describe("TM to APG integration", () => {
    test("BB3", async ({ page }) => {
        await page.goto(tmToAPGURL);

        // Generate
        await page.locator("#example_button").click();
        await page.getByText("BB(3)").click();
        await page.locator("#generate").click();
        await expect(page.locator("#copy")).toBeEnabled();

        // Run
        const prog = await page.locator("#output").inputValue();

        await page.goto(APGsemblyEmulatorURL);

        await setProgram(page, prog);
        await setStep(page, 200);
        await clickStep(page);
        await assertSteps(page, 119);
        await assertRegister(page, "U1", "14");
    });

    test("BB4", async ({ page }) => {
        await page.goto(tmToAPGURL);

        // Generate
        await page.locator("#example_button").click();
        await page.getByText("BB(4)").click();
        await page.locator("#generate").click();
        await expect(page.locator("#copy")).toBeEnabled();

        // Run
        const prog = await page.locator("#output").inputValue();

        await page.goto(APGsemblyEmulatorURL);

        await setProgram(page, prog);
        await setStep(page, 1000);
        await clickStep(page);
        await assertSteps(page, 887);
        await assertRegister(page, "U1", "108");
    });
});

export {};
