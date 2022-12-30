// @ts-check
/// <reference types="cypress" />

import {
    genURL,
    APGsemblyEmulatorURL,
    setStep,
    clickStep,
    setProgram,
    assertSteps,
} from "../common/common.js";

describe('Generator integration', () => {
    it('should load', () => {
        cy.visit(genURL);
        cy.contains('Code generator for elementary cellular automata');

        // Generate
        cy.get('#rule').type(`{selectall}{backspace}110`);
        cy.get('#generate').click();
        cy.get('#copy').should('not.be.disabled');

        // Run
        cy.wait(50);
        cy.get('#output').then(x => {
            const prog = x.val();
            if (typeof prog !== 'string') {
                throw Error('prog is not a string');
            }
            cy.visit(APGsemblyEmulatorURL);

            setProgram(prog);
            setStep(100);
            clickStep();
            assertSteps(100);
        });
    });
});

export {};
