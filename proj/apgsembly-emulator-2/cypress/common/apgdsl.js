// @ts-check
/// <reference types="cypress" />

import { APGsemblyEmulatorURL, setStep, dslURL } from "./common.js";

describe('APGDSL Integration', () => {
    it('should load', () => {
        cy.visit(dslURL);
        cy.get('h1').should('have.text', 'APGDSL');
    });
    it('should generate', () => {
        cy.get('#samples').click();
        cy.get('[data-src="01_output.txt"]').click();
        cy.get('#compile').click();
        cy.get('#output').should('include.value', 'INITIAL');
    });
    it('should run', () => {
        cy.get('#output').then(x => {
            /**
             * @type {string}
             */
            // @ts-ignore
            const prog = x.val();
            cy.visit(APGsemblyEmulatorURL);
            cy.get('#input').type(prog, { delay: 1 });
            setStep(100);
            cy.get('#step').click();
            cy.get('#output').should('have.value', '123');
        });
    });
});
