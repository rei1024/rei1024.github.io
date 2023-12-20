import { expect, test } from "@playwright/test";
import {
    APGsemblyEmulatorURL,
    assertSteps,
    clickStep,
    genURL,
    setProgram,
    setStep,
} from "./common.js";

test.describe("Generator integration", () => {
    test("should load", async ({ page }) => {
        await page.goto(genURL);
        // Generate
        await page.locator("#rule").fill("110");
        await page.locator("#generate").click();
        await expect(page.locator("#copy")).toBeEnabled();

        // Run
        const prog = await page.locator("#output").inputValue();

        await page.goto(APGsemblyEmulatorURL);

        await setProgram(page, prog);
        await setStep(page, 100);
        await clickStep(page);
        await assertSteps(page, 100);
    });
});
