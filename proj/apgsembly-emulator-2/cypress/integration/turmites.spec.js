// @ts-check
/// <reference types="cypress" />

import {
    turmitesURL,
    APGsemblyEmulatorURL,
    setStep,
    setProgram,
    assertSteps,
} from "../common/common.js";

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
            /**
             * @type {string}
             */
            // @ts-ignore
            const prog = x.val();
            cy.visit(APGsemblyEmulatorURL);

            setProgram(prog);
            setStep(500);
            cy.get('#step').click();
            assertSteps(500);
        });
    });
});

export {};
