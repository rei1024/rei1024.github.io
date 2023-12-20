import { expect, test } from "@playwright/test";
import {
    APGsemblyEmulatorURL,
    assertSteps,
    clickStep,
    setProgram,
    setStep,
    turmitesURL,
} from "./common.js";

test.describe("Turmites integration", () => {
    test("should load", async ({ page }) => {
        await page.goto(turmitesURL);

        // Generate
        await page.locator("#samples").click();
        await page.getByText("1: Langton's ant").click();
        await page.locator("#generate").click();
        await expect(page.locator("#copy")).toBeEnabled();

        // Run
        const prog = await page.locator("#output").inputValue();

        await page.goto(APGsemblyEmulatorURL);

        await setProgram(page, prog);
        await setStep(page, 500);
        await clickStep(page);
        await assertSteps(page, 500);
    });
});

export {};
