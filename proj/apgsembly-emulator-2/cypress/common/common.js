/// <reference types="cypress" />

export const baseURL = 'http://localhost:1123';
// export const baseURL = 'https://rei1024.github.io/proj/apgsembly-emulator-2';

export const APGsemblyEmulatorURL = baseURL + '/';

export const dslURL = baseURL + '/apgdsl/index.html';

export const genURL = baseURL + '/generator/index.html';

export const turmitesURL = baseURL + '/turmites/index.html';

/**
 *
 * @param {string} str
 */
export function loadProgram(str) {
    cy.get('#samples').click();
    cy.get(`[data-src="${str}"]`).click();
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
