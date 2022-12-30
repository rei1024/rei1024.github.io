// @ts-check
/// <reference types="cypress" />

export const baseURL = 'http://localhost:1123';
// export const baseURL = 'https://rei1024.github.io/proj/apgsembly-emulator-2';

export const APGsemblyEmulatorURL = baseURL + '/';

export const genURL = baseURL + '/generator/index.html';

export const turmitesURL = baseURL + '/turmites/index.html';

export const tmToAPGURL = baseURL + '/tm_to_apg/index.html';

export const toggleSel = '#toggle';

export function toggle() {
    cy.get(toggleSel).click();
}

export function assertToggleStart() {
    cy.get(toggleSel).should('not.be.disabled');
    cy.get(toggleSel).should('have.class', 'btn-primary');
}

export function assertToggleDisabledStart() {
    cy.get(toggleSel).should('be.disabled');
    cy.get(toggleSel).should('have.class', 'btn-primary');
}

export function assertToggleStop() {
    cy.get(toggleSel).should('not.be.disabled');
    cy.get(toggleSel).should('have.class', 'btn-danger');
}

/**
 *
 * @param {string} state
 */
export function assertCurrentState(state) {
    cy.get('#current_state').should('have.text', state);
}

const outputSelector = '#output';

/**
 *
 * @param {string} output
 */
export function assertOutput(output) {
    cy.get(outputSelector).should('have.value', output);
}

/**
 *
 * @param {number} n
 */
export function assertSteps(n) {
    cy.get('#steps').should('have.text', n.toLocaleString());
}

/**
 *
 * @param {number} n
 */
export function assertStepsNot(n) {
    cy.get('#steps').should('not.have.text', n.toLocaleString());
}

/**
 *
 * @param {string} msg
 */
export function assertError(msg) {
    cy.get('#error').should('have.text', msg);
}

/**
 *
 * @param {string} src
 */
export function loadProgram(src) {
    cy.get('#examples').click();
    cy.get(`[data-src="${src}"]`).click();
    cy.get('#examples').should('not.be.disabled'); // ロードされるまで待つ
    assertToggleStart();
}

/**
 *
 * @param {number} n
 */
export function setStep(n) {
    cy.get(`[data-test="config_button"]`).click();
    cy.wait(400);
    cy.get('#step_input').type(`{selectall}{backspace}${n}`);
    cy.get('#step_input').should(`have.value`, `${n}`);
    cy.get('#config_modal .btn-close').click();
    cy.wait(30);
}

export function clickStep() {
    cy.get('#step').click();
}

export function clickReset() {
    cy.get('#reset').click();
}

/**
 *
 * @param {string} program
 */
export function setProgram(program) {
    cy.get('#input').clear().invoke('val', program);
    cy.get('#reset').click();
}

/**
 *
 * @param {string} program
 */
export function setProgramSlow(program) {
    cy.get('#input').type(program, { delay: 1 });
    cy.get('#reset').click();
}

const statsSelector = '#stats_button';

export function clickStats() {
    cy.get(statsSelector).click();
    cy.wait(200);
}

export function closeStats() {
    cy.get(`#stats_modal > div > div > div.modal-header > button`).click();
    cy.wait(200);
}

/**
 * @param {number} n
 */
export function assertNumberOfStates(n) {
    clickStats();
    cy.get('#stats_number_of_states').contains(n.toString());
    closeStats();
}

/**
 * @typedef {'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'} DigitNonZero
 */

/**
 * @typedef {'0' | DigitNonZero} Digit
 */

/**
 * @param {`${'U' | 'B'}${`${Digit}` | `${DigitNonZero}${Digit}`}`} reg
 * @param {string} x
 */
export function assertRegister(reg, x) {
    cy.get(`[data-test="${reg}"]`).should('have.text', x);
}
