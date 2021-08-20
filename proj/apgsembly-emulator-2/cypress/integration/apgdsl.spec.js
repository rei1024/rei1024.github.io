/// <reference types="cypress" />

import { APGsemblyEmulatorURL, setStep, dslURL } from "../common/common.js";

describe('APGDSL Load', () => {
    it('should load', () => {
        cy.visit(dslURL);
        cy.get('h1').should('have.text', 'APGDSL');
    });
});

describe('APGDSL Integration', () => {
    it('Integration', () => {
        cy.visit(dslURL);
        cy.get('#samples').click();
        cy.get('[data-src="01_output.txt"]').click();
        cy.get('#compile').click();
        cy.get('#output').then(x => {
            const prog = x.val();
            cy.visit(APGsemblyEmulatorURL);
            cy.get('#input').type(prog, { delay: 1 });
            setStep(100);
            cy.get('#step').click();
            cy.get('#output').should('have.value', '123');
        });
    });
});
