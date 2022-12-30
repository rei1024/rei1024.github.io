// @ts-check
/// <reference types="cypress" />

import {
    turmitesURL,
    APGsemblyEmulatorURL,
    setStep,
    clickStep,
    setProgram,
    assertSteps,
} from "../common/common.js";

describe('Turmites integration', () => {
    it('should load', () => {
        cy.visit(turmitesURL);
        cy.contains('Turmites');

        // Generate
        cy.get('#samples').click();
        cy.contains('Langton').click();
        cy.get('#generate').click();
        cy.get('#copy').should('not.be.disabled');

        // Run
        cy.get('#output').then(x => {
            const prog = x.val();
            if (typeof prog !== 'string') {
                throw Error('prog is not a string');
            }
            cy.visit(APGsemblyEmulatorURL);

            setProgram(prog);
            setStep(500);
            clickStep();
            assertSteps(500);
        });
    });
});

export {};
