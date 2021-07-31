export {};

const apgsemblyEmulatorPageURL = 'http://localhost:1123/';

const dslURL = 'http://localhost:1123/apgdsl/index.html';

describe('APGDSL Load', () => {
    it('should load', () => {
        cy.visit(dslURL);
        cy.get('h1').should('have.text', 'APGDSL');
    });
});

/**
 *
 * @param {number} n 
 */
 function setStep(n) {
    cy.get(`[data-test="config_button"]`).click();
    cy.wait(500);
    cy.get('#step_input').type(`{selectall}{backspace}${n}`);
    cy.get('#config_modal .btn-close').click();
    cy.wait(50);
}

describe('APGDSL Integration', () => {
    it('Integration', () => {
        cy.visit(dslURL);
        cy.get('#samples').click();
        cy.get('[data-src="01_output.js"]').click();
        cy.get('#compile').click();
        cy.get('#output').then(x => {
            const prog = x.val();
            cy.visit(apgsemblyEmulatorPageURL);
            cy.get('#input').type(prog);
            setStep(100);
            cy.get('#step').click();
            cy.get('#output').should('have.value', '123');
        });
    });
});
