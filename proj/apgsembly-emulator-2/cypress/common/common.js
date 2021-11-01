// @ts-check
/// <reference types="cypress" />

export const baseURL = 'http://localhost:1123';
// export const baseURL = 'https://rei1024.github.io/proj/apgsembly-emulator-2';

export const APGsemblyEmulatorURL = baseURL + '/';

export const dslURL = baseURL + '/apgdsl/index.html';

export const genURL = baseURL + '/generator/index.html';

export const turmitesURL = baseURL + '/turmites/index.html';

export const tmToAPGURL = baseURL + '/tm_to_apg/index.html';

/**
 *
 * @param {string} src
 */
export function loadProgram(src) {
    cy.get('#samples').click();
    cy.get(`[data-src="${src}"]`).click();
    cy.get('#samples').should('not.be.disabled'); // ロードされるまで待つ
    cy.get('#start').should('not.be.disabled');
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
