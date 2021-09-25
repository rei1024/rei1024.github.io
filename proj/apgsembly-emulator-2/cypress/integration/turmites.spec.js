/// <reference types="cypress" />

import { turmitesURL, APGsemblyEmulatorURL, setStep } from "../common/common.js";

describe('Turmites integration', () => {
    it('should load', () => {
        cy.visit(turmitesURL);
        cy.contains('Turmites');
    });
    it('should generate', () => {
        cy.get('#samples').click();
        cy.contains('Langton').click();
        cy.get('#generate').click();
        cy.get('#copy').should('not.be.disabled');
    });
    it('should run', () => {
        cy.get('#output').then(x => {
            const prog = x.val();
            cy.visit(APGsemblyEmulatorURL);
            cy.get('#input').clear().invoke('val', prog)
            setStep(500);
            cy.get('#step').click();
            cy.get('#steps').should('contain.text', '500');
        })
    });
});

export {};
