import { expect, type Page } from "@playwright/test";

export const baseURL = "http://localhost:1123";
// export const baseURL = 'https://rei1024.github.io/proj/apgsembly-emulator-2';

export const APGsemblyEmulatorURL = baseURL + "/";

export const genURL = baseURL + "/tools/eca-generator/index.html";

export const turmitesURL = baseURL + "/tools/turmites/index.html";

export const tmToAPGURL = baseURL + "/tools/tm-to-apg/index.html";

export const toggleSel = "#toggle";

export async function clickReset(page: Page) {
    await page.locator("#reset").click();
}

export async function setProgram(page: Page, program: string) {
    await page.locator("#input").fill(program);
    await clickReset(page);
}

export async function assertToggleStart(page: Page) {
    await expect(page.locator(toggleSel)).toBeEnabled();
    await expect(page.locator(toggleSel)).toHaveClass("btn btn-primary");
}

export async function assertToggleDisabledStart(page: Page) {
    await expect(page.locator(toggleSel)).toBeDisabled();
    await expect(page.locator(toggleSel)).toHaveClass("btn btn-primary");
}

export async function assertToggleStop(page: Page) {
    await expect(page.locator(toggleSel)).toBeEnabled();
    await expect(page.locator(toggleSel)).toHaveClass("btn btn-danger");
}

export async function assertCurrentState(page: Page, state: string) {
    await expect(page.locator("#current_state")).toHaveText(state);
}

type DigitNonZero = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Digit = "0" | DigitNonZero;

export async function assertRegister(
    page: Page,
    reg: `${"U" | "B"}${`${Digit}` | `${DigitNonZero}${Digit}`}`,
    x: string,
) {
    await expect(page.locator(`[data-test="${reg}"]`)).toHaveText(x);
}

export async function assertError(page: Page, msg: string) {
    await expect(page.locator("#error")).toHaveText(msg);
}

export async function toggle(page: Page) {
    await page.locator(toggleSel).click();
}

export async function loadProgram(page: Page, src: string) {
    await page.locator("#examples").click();
    await page.locator(`[data-src="${src}"]`).click();
    // ロードされるまで待つ
    await expect(page.locator("#examples")).toBeEnabled();
    await assertToggleStart(page);
}

export async function setStep(page: Page, n: number) {
    await page.locator(`[data-test="config_button"]`).click();
    // await page.waitForTimeout(400);
    await page.locator("#step_input").fill(n.toString());

    await page.locator("#config_modal .btn-close").click();
    // モーダル閉じるまで待つ
    await expect(page.locator(`#config_modal`)).not.toBeVisible();
}

export async function clickStep(page: Page) {
    await page.locator("#step").click();
}

const stepsSelector = "#steps";
export async function assertSteps(page: Page, n: number) {
    await expect(page.locator(stepsSelector)).toHaveText(n.toLocaleString());
}

export async function assertStepsNot(page: Page, n: number) {
    await expect(page.locator(stepsSelector)).not.toHaveText(
        n.toLocaleString(),
    );
}

const outputSelector = "#output";

export async function assertOutput(page: Page, output: string) {
    await expect(page.locator(outputSelector)).toHaveValue(output);
}
